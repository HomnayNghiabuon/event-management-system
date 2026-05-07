package com.example.event_management_server.service;

import com.example.event_management_server.dto.OrderResponse;
import com.example.event_management_server.dto.PurchaseRequestDTO;
import com.example.event_management_server.dto.ReservationRequestDTO;
import com.example.event_management_server.dto.ReservationResponseDTO;
import com.example.event_management_server.exception.BadRequestException;
import com.example.event_management_server.exception.NotFoundException;
import com.example.event_management_server.model.*;
import com.example.event_management_server.model.PaymentMethod;
import com.example.event_management_server.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationService {

    private final TicketTypeRepository ticketTypeRepository;
    private final TicketReservationRepository ticketReservationRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final CommissionCalculatorService commissionCalculatorService;

    public ReservationService(TicketTypeRepository ticketTypeRepository,
                              TicketReservationRepository ticketReservationRepository,
                              OrderRepository orderRepository,
                              OrderDetailRepository orderDetailRepository,
                              TicketRepository ticketRepository,
                              NotificationService notificationService,
                              EmailService emailService,
                              CommissionCalculatorService commissionCalculatorService) {
        this.ticketTypeRepository = ticketTypeRepository;
        this.ticketReservationRepository = ticketReservationRepository;
        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.commissionCalculatorService = commissionCalculatorService;
    }

    /**
     * Tạm giữ vé cho user trong 10 phút (expiresAt được set tự động bởi @PrePersist trong TicketReservation).
     * Dùng SELECT FOR UPDATE (findByIdForUpdate) để tránh race condition khi nhiều user cùng mua.
     * Giảm quantity ngay lập tức — nếu hết hạn, ReservationCleanupTask sẽ hoàn trả.
     */
    @Transactional(rollbackFor = Exception.class)
    public ReservationResponseDTO reserveTicket(ReservationRequestDTO request, User user) {
        // SELECT FOR UPDATE: khóa row này lại, các transaction khác phải chờ → tránh oversell
        TicketType ticketType = ticketTypeRepository.findByIdForUpdate(request.getTicketTypeId())
                .orElseThrow(() -> new NotFoundException("Ticket type not found"));

        if (ticketType.getQuantity() < request.getQuantity()) {
            throw new BadRequestException("Không đủ vé: chỉ còn " + ticketType.getQuantity() + " vé");
        }

        ticketType.setQuantity(ticketType.getQuantity() - request.getQuantity());
        ticketTypeRepository.save(ticketType);

        TicketReservation reservation = new TicketReservation.ReservationBuilder()
                .user(user)
                .ticketType(ticketType)
                .quantity(request.getQuantity())
                .status(ReservationStatus.PENDING)
                .build();

        TicketReservation saved = ticketReservationRepository.save(reservation);

        // Load with event for response (separate from lock query to avoid H2 compatibility issue)
        TicketType ttWithEvent = ticketTypeRepository.findByIdWithEvent(ticketType.getTicketTypeId())
                .orElse(ticketType);
        String eventTitle = ttWithEvent.getEvent() != null ? ttWithEvent.getEvent().getTitle() : null;

        return new ReservationResponseDTO(
                saved.getReservationId(),
                ttWithEvent.getTicketTypeId(),
                ttWithEvent.getName(),
                eventTitle,
                saved.getQuantity(),
                saved.getStatus().name(),
                saved.getExpiresAt()
        );
    }

    /**
     * Hoàn tất thanh toán: tạo Order, OrderDetail và Ticket (mỗi vé có qrCode là UUID riêng).
     * Idempotent: nếu reservation đã PAID (double-submit), trả về order hiện có thay vì tạo mới.
     * Gửi notification trong app và email xác nhận bất đồng bộ (@Async).
     */
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse processPayment(PurchaseRequestDTO request, User user) {
        // SELECT FOR UPDATE để tránh double-payment race condition
        TicketReservation reservation = ticketReservationRepository
                .findByIdForUpdate(request.getReservationId())
                .orElseThrow(() -> new NotFoundException("Reservation không tồn tại"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền thanh toán reservation này");
        }

        // Idempotency: nếu đã thanh toán rồi (gọi lại lần 2) → trả order cũ, không tạo mới
        if (reservation.getStatus() == ReservationStatus.PAID
                || reservation.getStatus() == ReservationStatus.COMPLETED) {
            Order existingOrder = orderRepository.findByTicketReservation(reservation)
                    .orElseThrow(() -> new RuntimeException("Order không tồn tại"));
            return buildOrderResponse(existingOrder);
        }

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new BadRequestException("Reservation không hợp lệ để thanh toán (status: " + reservation.getStatus() + ")");
        }

        if (reservation.isExpired()) {
            handleExpiredReservation(reservation);
            throw new BadRequestException("Reservation đã hết hạn, vé đã được hoàn trả.");
        }

        BigDecimal totalPrice = reservation.getTicketType().getPrice()
                .multiply(BigDecimal.valueOf(reservation.getQuantity()));

        Order order = new Order();
        order.setUser(user);
        order.setTotalPrice(totalPrice);
        order.setPaymentStatus("PAID");
        order.setPaymentMethod(request.getPaymentMethod().name());
        order.setTicketReservation(reservation);
        order.setTransactionId(UUID.randomUUID().toString());
        Order savedOrder = orderRepository.save(order);

        OrderDetail detail = new OrderDetail();
        detail.setOrder(savedOrder);
        detail.setTicketType(reservation.getTicketType());
        detail.setQuantity(reservation.getQuantity());
        detail.setPrice(reservation.getTicketType().getPrice());
        OrderDetail savedDetail = orderDetailRepository.save(detail);

        List<String> attendeeNames = request.getAttendeeNames();
        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < reservation.getQuantity(); i++) {
            Ticket ticket = new Ticket();
            ticket.setOrderDetail(savedDetail);
            ticket.setAttendee(user);
            String name = (attendeeNames != null && i < attendeeNames.size()
                    && attendeeNames.get(i) != null && !attendeeNames.get(i).isBlank())
                    ? attendeeNames.get(i).trim()
                    : user.getFullName();
            ticket.setAttendeeName(name);
            ticket.setQrCode(UUID.randomUUID().toString());
            ticket.setCheckinStatus(false);
            tickets.add(ticketRepository.save(ticket));
        }

        reservation.setStatus(ReservationStatus.PAID);
        ticketReservationRepository.save(reservation);

        // Snapshot hoa hồng tại thời điểm PAID
        commissionCalculatorService.persistCommission(savedOrder);

        String eventTitle = reservation.getTicketType().getEvent().getTitle();
        notificationService.send(user,
                "Đặt vé thành công",
                String.format("Bạn đã đặt %d vé cho sự kiện \"%s\". Mã đơn hàng: #%d",
                        reservation.getQuantity(), eventTitle, savedOrder.getOrderId()),
                "ORDER_CONFIRMED");

        List<OrderResponse.TicketInfo> ticketInfos = tickets.stream()
                .map(t -> new OrderResponse.TicketInfo(t.getTicketId(), t.getQrCode(), t.getAttendeeName(), t.getCheckinStatus()))
                .toList();

        // Gửi email xác nhận bất đồng bộ (không block response)
        List<String> qrCodes = tickets.stream().map(Ticket::getQrCode).toList();
        emailService.sendOrderConfirmation(user, eventTitle, reservation.getQuantity(), savedOrder.getOrderId(), qrCodes);

        return OrderResponse.from(savedOrder, ticketInfos);
    }

    /**
     * Tạo Order ở trạng thái AWAITING_GATEWAY cho luồng VNPay/Momo.
     * KHÔNG sinh ticket — chờ IPN xác nhận PAID rồi mới sinh trong confirmOrderPaid().
     * Nếu reservation đã có Order rồi (retry) → trả về Order cũ.
     */
    @Transactional(rollbackFor = Exception.class)
    public Order createOrderForGateway(Integer reservationId, PaymentMethod method,
                                       List<String> attendeeNames, User user) {
        TicketReservation reservation = ticketReservationRepository
                .findByIdForUpdate(reservationId)
                .orElseThrow(() -> new NotFoundException("Reservation không tồn tại"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền tạo payment cho reservation này");
        }
        if (reservation.getStatus() == ReservationStatus.PAID
                || reservation.getStatus() == ReservationStatus.COMPLETED) {
            return orderRepository.findByTicketReservation(reservation)
                    .orElseThrow(() -> new RuntimeException("Order không tồn tại"));
        }
        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new BadRequestException("Reservation không hợp lệ để thanh toán (status: " + reservation.getStatus() + ")");
        }
        if (reservation.isExpired()) {
            handleExpiredReservation(reservation);
            throw new BadRequestException("Reservation đã hết hạn, vé đã được hoàn trả.");
        }

        // Nếu đã có Order pending từ lần trước (user reload page) → trả về để tạo URL mới
        var existing = orderRepository.findByTicketReservation(reservation);
        if (existing.isPresent()) {
            Order o = existing.get();
            if ("AWAITING_GATEWAY".equals(o.getPaymentStatus())) return o;
        }

        BigDecimal totalPrice = reservation.getTicketType().getPrice()
                .multiply(BigDecimal.valueOf(reservation.getQuantity()));

        Order order = new Order();
        order.setUser(user);
        order.setTotalPrice(totalPrice);
        order.setPaymentStatus("AWAITING_GATEWAY");
        order.setPaymentMethod(method.name());
        order.setTicketReservation(reservation);
        order.setGatewayOrderCode("EVT-" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().substring(0, 8));
        Order savedOrder = orderRepository.save(order);

        // Lưu attendee names tạm vào session/DB? — đơn giản: lưu vào OrderDetail.price=null tạm
        // Quyết định: tạm thời lưu attendee names trong memory cache không phù hợp;
        // FE phải gửi lại khi confirm. Hiện tại chấp nhận: dùng fullName user nếu names null.
        // (Mở rộng sau: thêm bảng order_attendees để lưu trước khi PAID.)
        // → Lưu OrderDetail luôn để giữ ticketType + quantity + price snapshot
        OrderDetail detail = new OrderDetail();
        detail.setOrder(savedOrder);
        detail.setTicketType(reservation.getTicketType());
        detail.setQuantity(reservation.getQuantity());
        detail.setPrice(reservation.getTicketType().getPrice());
        orderDetailRepository.save(detail);

        return savedOrder;
    }

    /**
     * Gọi từ IPN webhook khi gateway xác nhận thanh toán thành công.
     * Sinh Ticket + QR, set Reservation PAID, lưu commission, gửi notification + email.
     * Idempotent: nếu Order đã PAID thì return luôn.
     */
    @Transactional(rollbackFor = Exception.class)
    public void confirmOrderPaid(Order order, String providerTxnId) {
        if ("PAID".equals(order.getPaymentStatus())) return;

        order.setPaymentStatus("PAID");
        order.setPaidAt(java.time.Instant.now());
        if (providerTxnId != null && !providerTxnId.isBlank()) {
            order.setTransactionId(providerTxnId);
        }
        orderRepository.save(order);

        TicketReservation reservation = order.getTicketReservation();
        // Sinh ticket cho từng vé
        // Tìm OrderDetail đã tạo lúc createOrderForGateway
        var details = ticketRepository.findByOrderId(order.getOrderId());
        if (details.isEmpty()) {
            // Tạo ticket mới — chuẩn flow
            // Lấy OrderDetail từ DB (dùng OrderDetailRepository qua order id chưa có sẵn → query qua reservation)
            int qty = reservation.getQuantity();
            // Tìm OrderDetail vừa tạo trong createOrderForGateway: query thẳng JPQL
            OrderDetail orderDetail = orderDetailRepository.findAll().stream()
                    .filter(od -> od.getOrder() != null
                            && od.getOrder().getOrderId().equals(order.getOrderId()))
                    .findFirst()
                    .orElseGet(() -> {
                        OrderDetail d = new OrderDetail();
                        d.setOrder(order);
                        d.setTicketType(reservation.getTicketType());
                        d.setQuantity(qty);
                        d.setPrice(reservation.getTicketType().getPrice());
                        return orderDetailRepository.save(d);
                    });

            for (int i = 0; i < qty; i++) {
                Ticket ticket = new Ticket();
                ticket.setOrderDetail(orderDetail);
                ticket.setAttendee(order.getUser());
                ticket.setAttendeeName(order.getUser().getFullName());
                ticket.setQrCode(UUID.randomUUID().toString());
                ticket.setCheckinStatus(false);
                ticketRepository.save(ticket);
            }
        }

        reservation.setStatus(ReservationStatus.PAID);
        ticketReservationRepository.save(reservation);

        commissionCalculatorService.persistCommission(order);

        String eventTitle = reservation.getTicketType().getEvent().getTitle();
        notificationService.send(order.getUser(),
                "Đặt vé thành công",
                String.format("Bạn đã đặt %d vé cho sự kiện \"%s\". Mã đơn hàng: #%d",
                        reservation.getQuantity(), eventTitle, order.getOrderId()),
                "ORDER_CONFIRMED");

        var paidTickets = ticketRepository.findByOrderId(order.getOrderId());
        List<String> qrCodes = paidTickets.stream().map(Ticket::getQrCode).toList();
        emailService.sendOrderConfirmation(order.getUser(), eventTitle, reservation.getQuantity(),
                order.getOrderId(), qrCodes);
    }

    /**
     * Gọi từ IPN khi gateway báo thất bại — set order FAILED, hoàn vé.
     */
    @Transactional(rollbackFor = Exception.class)
    public void markOrderFailed(Order order) {
        if ("PAID".equals(order.getPaymentStatus())) return; // không đụng order đã PAID
        order.setPaymentStatus("FAILED");
        orderRepository.save(order);

        TicketReservation reservation = order.getTicketReservation();
        if (reservation != null && reservation.getStatus() == ReservationStatus.PENDING) {
            restoreTicketQuantity(reservation);
            reservation.setStatus(ReservationStatus.CANCELLED);
            ticketReservationRepository.save(reservation);
        }
    }

    /** Lấy danh sách reservation của user, sắp xếp mới nhất trước, phân trang. */
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ReservationResponseDTO> getMyReservations(User user, int page, int size) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ticketReservationRepository.findByUser_IdOrderByReservedAtDesc(user.getId(), pageable)
                .map(r -> {
                    String ticketTypeName = r.getTicketType() != null ? r.getTicketType().getName() : null;
                    String eventTitle = (r.getTicketType() != null && r.getTicketType().getEvent() != null)
                            ? r.getTicketType().getEvent().getTitle() : null;
                    return new ReservationResponseDTO(
                            r.getReservationId(),
                            r.getTicketType() != null ? r.getTicketType().getTicketTypeId() : null,
                            ticketTypeName,
                            eventTitle,
                            r.getQuantity(),
                            r.getStatus().name(),
                            r.getExpiresAt()
                    );
                });
    }

    /** Hủy reservation đang PENDING: hoàn trả quantity và đánh dấu CANCELLED. */
    @Transactional(rollbackFor = Exception.class)
    public void cancelReservation(Integer reservationId, User user) {
        TicketReservation reservation = ticketReservationRepository.findByIdForUpdate(reservationId)
                .orElseThrow(() -> new NotFoundException("Reservation không tồn tại"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền hủy reservation này");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new BadRequestException("Chỉ có thể hủy reservation ở trạng thái PENDING");
        }

        restoreTicketQuantity(reservation);
        reservation.setStatus(ReservationStatus.CANCELLED);
        ticketReservationRepository.save(reservation);
    }

    private void handleExpiredReservation(TicketReservation reservation) {
        restoreTicketQuantity(reservation);
        reservation.setStatus(ReservationStatus.EXPIRED);
        ticketReservationRepository.save(reservation);
    }

    /** Hoàn trả số lượng vé về TicketType khi reservation bị hủy hoặc hết hạn. */
    private void restoreTicketQuantity(TicketReservation reservation) {
        TicketType ticketType = reservation.getTicketType();
        ticketType.setQuantity(ticketType.getQuantity() + reservation.getQuantity());
        ticketTypeRepository.save(ticketType);
    }

    private OrderResponse buildOrderResponse(Order order) {
        List<Ticket> tickets = ticketRepository.findByOrderId(order.getOrderId());
        List<OrderResponse.TicketInfo> infos = tickets.stream()
                .map(t -> new OrderResponse.TicketInfo(t.getTicketId(), t.getQrCode(), t.getAttendeeName(), t.getCheckinStatus()))
                .toList();
        return OrderResponse.from(order, infos);
    }
}
