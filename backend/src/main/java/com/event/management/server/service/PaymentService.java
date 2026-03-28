package com.event.management.server.service;

import com.event.management.server.dto.PurchaseRequestDTO;
import com.event.management.server.entity.*;
import com.event.management.server.exception.BadRequestException;
import com.event.management.server.exception.NotFoundException;
import com.event.management.server.repository.OrderRepository;
import com.event.management.server.repository.TicketReservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final TicketReservationRepository reservationRepository;
    private final OrderRepository orderRepository;

    
    public PaymentService(TicketReservationRepository reservationRepository, OrderRepository orderRepository) {
        this.reservationRepository = reservationRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public Order processPayment(PurchaseRequestDTO request) {

        log.info("Processing payment for reservationId={}", request.getReservationId());

        TicketReservation reservation = reservationRepository
                .findByIdForUpdate(request.getReservationId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy mã giữ chỗ"));

        if ("COMPLETED".equals(reservation.getStatus())) {
            log.warn("Reservation {} already paid", reservation.getReservationId()); 
            return orderRepository.findByTicketReservation(reservation)
                    .orElseThrow(() -> new RuntimeException("Order không tồn tại"));
        }

        if (!"PENDING".equals(reservation.getStatus())) {
            throw new BadRequestException("Reservation không hợp lệ để thanh toán");
        }

        if (Instant.now().isAfter(reservation.getExpiresAt())) {
            handleExpiredReservation(reservation);
            throw new BadRequestException("Reservation đã hết hạn");
        }

        reservation.setStatus("PROCESSING");

        reservation.setStatus("COMPLETED"); 
        Order order = new Order();
        order.setPaymentMethod(request.getPaymentMethod().toString());

        Order savedOrder = orderRepository.save(order);

        log.info("Payment success for reservationId={}, orderId={}",
                reservation.getReservationId(), savedOrder.getOrderId()); 

        return savedOrder;
    }

    private void handleExpiredReservation(TicketReservation reservation) {

        log.warn("Reservation {} expired", reservation.getReservationId()); 

        reservation.setStatus("EXPIRED"); 

        TicketType ticketType = reservation.getTicketType();
        ticketType.setQuantity(
                ticketType.getQuantity() + reservation.getQuantity()
        );
    }
}