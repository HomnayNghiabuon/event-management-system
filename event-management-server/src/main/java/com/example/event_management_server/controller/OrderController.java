package com.example.event_management_server.controller;

import com.example.event_management_server.dto.OrderResponse;
import com.example.event_management_server.model.*;
import com.example.event_management_server.repository.OrderRepository;
import com.example.event_management_server.repository.TicketRepository;
import com.example.event_management_server.repository.TicketReservationRepository;
import com.example.event_management_server.repository.TicketTypeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@Transactional(readOnly = true)
public class OrderController {

    private final OrderRepository orderRepository;
    private final TicketRepository ticketRepository;
    private final TicketReservationRepository ticketReservationRepository;
    private final TicketTypeRepository ticketTypeRepository;

    public OrderController(OrderRepository orderRepository,
                           TicketRepository ticketRepository,
                           TicketReservationRepository ticketReservationRepository,
                           TicketTypeRepository ticketTypeRepository) {
        this.orderRepository = orderRepository;
        this.ticketRepository = ticketRepository;
        this.ticketReservationRepository = ticketReservationRepository;
        this.ticketTypeRepository = ticketTypeRepository;
    }

    /**
     * Lấy danh sách đơn hàng của user đang đăng nhập, sắp xếp mới nhất trước.
     * GET /api/v1/orders/my?page=0&size=10
     */
    @GetMapping("/my")
    public Page<OrderResponse> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user
    ) {
        return orderRepository
                .findByUser_IdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(this::toResponse);
    }

    /**
     * Lấy order theo gatewayOrderCode (dùng sau khi redirect từ VNPay/Momo).
     * GET /api/v1/orders/by-code/{code}
     * Chỉ chủ đơn hoặc admin mới được xem.
     */
    @GetMapping("/by-code/{code}")
    public OrderResponse getByCode(
            @PathVariable String code,
            @AuthenticationPrincipal User user
    ) {
        Order order = orderRepository.findByGatewayOrderCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order không tồn tại"));

        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem order này");
        }
        return toResponse(order);
    }

    /**
     * Lấy chi tiết một order theo orderId.
     * GET /api/v1/orders/{orderId}
     * Chỉ chủ đơn hoặc admin mới được xem.
     */
    @GetMapping("/{orderId}")
    public OrderResponse getOrder(
            @PathVariable Integer orderId,
            @AuthenticationPrincipal User user
    ) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order không tồn tại"));

        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem order này");
        }

        return toResponse(order);
    }

    /**
     * Huỷ đơn hàng đã PAID và hoàn trả số lượng vé.
     * POST /api/v1/orders/{orderId}/cancel
     * Các bước: đánh dấu order CANCELLED → invalidate tất cả tickets (bulk UPDATE) → hoàn trả quantity.
     * invalidateByOrderId: dùng @Query UPDATE thay vì load từng ticket → tối ưu cho đơn nhiều vé.
     */
    @PostMapping("/{orderId}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional(readOnly = false)
    public void cancelOrder(
            @PathVariable Integer orderId,
            @AuthenticationPrincipal User user) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order không tồn tại"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền huỷ order này");
        }

        String status = order.getPaymentStatus();
        if (!"PENDING".equals(status) && !"AWAITING_GATEWAY".equals(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Chỉ có thể huỷ đơn hàng chưa thanh toán");
        }

        order.setPaymentStatus("CANCELLED");
        orderRepository.save(order);

        // Bulk UPDATE: UPDATE tickets SET is_valid=false WHERE order_detail_id IN (SELECT ... WHERE order_id=?)
        ticketRepository.invalidateByOrderId(orderId);

        TicketReservation reservation = order.getTicketReservation();
        if (reservation != null) {
            reservation.setStatus(ReservationStatus.CANCELLED);
            TicketType ticketType = reservation.getTicketType();
            ticketType.setQuantity(ticketType.getQuantity() + reservation.getQuantity()); // hoàn trả vé
            ticketTypeRepository.save(ticketType);
            ticketReservationRepository.save(reservation);
        }
    }

    private OrderResponse toResponse(Order order) {
        List<Ticket> tickets = ticketRepository.findByOrderIdWithDetails(order.getOrderId());
        List<OrderResponse.TicketInfo> infos = tickets.stream()
                .map(OrderResponse.TicketInfo::from)
                .toList();

        // Lấy event info từ ticket đầu tiên (tất cả tickets trong order thuộc cùng 1 event)
        Integer eventId = null;
        String eventTitle = null;
        LocalDate eventDate = null;
        LocalTime startTime = null;
        String eventLocation = null;
        String eventThumbnail = null;
        String ticketTypeName = null;
        BigDecimal unitPrice = null;
        Integer quantity = null;

        if (!tickets.isEmpty()) {
            Ticket first = tickets.get(0);
            OrderDetail od = first.getOrderDetail();
            if (od != null) {
                unitPrice = od.getPrice();
                quantity = od.getQuantity();
                TicketType tt = od.getTicketType();
                if (tt != null) {
                    ticketTypeName = tt.getName();
                    Event event = tt.getEvent();
                    if (event != null) {
                        eventId = event.getEventId();
                        eventTitle = event.getTitle();
                        eventDate = event.getEventDate();
                        startTime = event.getStartTime();
                        eventLocation = event.getLocation();
                        eventThumbnail = event.getThumbnail();
                    }
                }
            }
        } else {
            // Fallback: lấy từ reservation nếu chưa có ticket
            TicketReservation reservation = order.getTicketReservation();
            if (reservation != null) {
                quantity = reservation.getQuantity();
                TicketType tt = reservation.getTicketType();
                if (tt != null) {
                    ticketTypeName = tt.getName();
                    unitPrice = tt.getPrice();
                    Event event = tt.getEvent();
                    if (event != null) {
                        eventId = event.getEventId();
                        eventTitle = event.getTitle();
                        eventDate = event.getEventDate();
                        startTime = event.getStartTime();
                        eventLocation = event.getLocation();
                        eventThumbnail = event.getThumbnail();
                    }
                }
            }
        }

        return OrderResponse.from(order, infos, eventId, eventTitle, eventDate, startTime,
                eventLocation, eventThumbnail, ticketTypeName, unitPrice, quantity);
    }
}
