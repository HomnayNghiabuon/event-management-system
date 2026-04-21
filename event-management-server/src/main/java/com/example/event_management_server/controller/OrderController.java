package com.example.event_management_server.controller;

import com.example.event_management_server.dto.OrderResponse;
import com.example.event_management_server.model.Order;
import com.example.event_management_server.model.Ticket;
import com.example.event_management_server.model.TicketReservation;
import com.example.event_management_server.model.TicketType;
import com.example.event_management_server.model.User;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
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
     */
    @PostMapping("/{orderId}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void cancelOrder(
            @PathVariable Integer orderId,
            @AuthenticationPrincipal User user) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order không tồn tại"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền huỷ order này");
        }

        if (!"PAID".equals(order.getPaymentStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Chỉ có thể huỷ order ở trạng thái PAID");
        }

        order.setPaymentStatus("CANCELLED");
        orderRepository.save(order);

        TicketReservation reservation = order.getTicketReservation();
        if (reservation != null) {
            reservation.setStatus(com.example.event_management_server.model.ReservationStatus.CANCELLED);
            TicketType ticketType = reservation.getTicketType();
            ticketType.setQuantity(ticketType.getQuantity() + reservation.getQuantity());
            ticketTypeRepository.save(ticketType);
            ticketReservationRepository.save(reservation);
        }
    }

    private OrderResponse toResponse(Order order) {
        List<Ticket> tickets = ticketRepository.findByAttendee_Id(order.getUser().getId());
        List<OrderResponse.TicketInfo> infos = tickets.stream()
                .map(t -> new OrderResponse.TicketInfo(
                        t.getTicketId(), t.getQrCode(), t.getAttendeeName(), t.getCheckinStatus()))
                .toList();
        return OrderResponse.from(order, infos);
    }
}
