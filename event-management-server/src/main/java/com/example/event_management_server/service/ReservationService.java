package com.example.event_management_server.service;

import com.example.event_management_server.dto.OrderResponse;
import com.example.event_management_server.dto.PurchaseRequestDTO;
import com.example.event_management_server.dto.ReservationRequestDTO;
import com.example.event_management_server.dto.ReservationResponseDTO;
import com.example.event_management_server.exception.BadRequestException;
import com.example.event_management_server.exception.NotFoundException;
import com.example.event_management_server.model.*;
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

    public ReservationService(TicketTypeRepository ticketTypeRepository,
                              TicketReservationRepository ticketReservationRepository,
                              OrderRepository orderRepository,
                              OrderDetailRepository orderDetailRepository,
                              TicketRepository ticketRepository,
                              NotificationService notificationService) {
        this.ticketTypeRepository = ticketTypeRepository;
        this.ticketReservationRepository = ticketReservationRepository;
        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
    }

    @Transactional(rollbackFor = Exception.class)
    public ReservationResponseDTO reserveTicket(ReservationRequestDTO request, User user) {
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

        // Vé miễn phí: tự động tạo order và tickets ngay, không cần bước purchase
        if (BigDecimal.ZERO.compareTo(ticketType.getPrice()) == 0) {
            PurchaseRequestDTO freeRequest = new PurchaseRequestDTO();
            freeRequest.setReservationId(saved.getReservationId());
            freeRequest.setPaymentMethod(PaymentMethod.CASH);
            processPayment(freeRequest, user);

            return new ReservationResponseDTO(
                    saved.getReservationId(),
                    ttWithEvent.getTicketTypeId(),
                    ttWithEvent.getName(),
                    eventTitle,
                    saved.getQuantity(),
                    ReservationStatus.PAID.name(),
                    saved.getExpiresAt()
            );
        }

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

    @Transactional(rollbackFor = Exception.class)
    public OrderResponse processPayment(PurchaseRequestDTO request, User user) {
        TicketReservation reservation = ticketReservationRepository
                .findByIdForUpdate(request.getReservationId())
                .orElseThrow(() -> new NotFoundException("Reservation không tồn tại"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền thanh toán reservation này");
        }

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

        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < reservation.getQuantity(); i++) {
            Ticket ticket = new Ticket();
            ticket.setOrderDetail(savedDetail);
            ticket.setAttendee(user);
            ticket.setAttendeeName(user.getFullName());
            ticket.setQrCode(UUID.randomUUID().toString());
            ticket.setCheckinStatus(false);
            tickets.add(ticketRepository.save(ticket));
        }

        reservation.setStatus(ReservationStatus.PAID);
        ticketReservationRepository.save(reservation);

        String eventTitle = reservation.getTicketType().getEvent().getTitle();
        notificationService.send(user,
                "Đặt vé thành công",
                String.format("Bạn đã đặt %d vé cho sự kiện \"%s\". Mã đơn hàng: #%d",
                        reservation.getQuantity(), eventTitle, savedOrder.getOrderId()),
                "ORDER_CONFIRMED");

        List<OrderResponse.TicketInfo> ticketInfos = tickets.stream()
                .map(t -> new OrderResponse.TicketInfo(t.getTicketId(), t.getQrCode(), t.getAttendeeName(), t.getCheckinStatus()))
                .toList();

        return OrderResponse.from(savedOrder, ticketInfos);
    }

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
