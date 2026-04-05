package com.example.event_management_server.service;

import com.example.event_management_server.dto.PurchaseRequestDTO;
import com.example.event_management_server.dto.ReservationRequestDTO;
import com.example.event_management_server.dto.ReservationResponseDTO;
import com.example.event_management_server.exception.BadRequestException;
import com.example.event_management_server.exception.NotFoundException;
import com.example.event_management_server.model.*;
import com.example.event_management_server.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class ReservationService {

    private final UserRepository userRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final TicketReservationRepository ticketReservationRepository;
    private final OrderRepository orderRepository;

    public ReservationService(UserRepository userRepository,
                              TicketTypeRepository ticketTypeRepository,
                              TicketReservationRepository ticketReservationRepository,
                              OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.ticketTypeRepository = ticketTypeRepository;
        this.ticketReservationRepository = ticketReservationRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public ReservationResponseDTO reserveTicket(ReservationRequestDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        TicketType ticketType = ticketTypeRepository.findByIdForUpdate(request.getTicketTypeId())
                .orElseThrow(() -> new NotFoundException("Ticket type not found"));

        if (ticketType.getQuantity() < request.getQuantity()) {
            throw new BadRequestException("Not enough tickets available");
        }

        // Trừ vé và lưu lại
        ticketType.setQuantity(ticketType.getQuantity() - request.getQuantity());
        ticketTypeRepository.save(ticketType); 

        TicketReservation reservation = new TicketReservation.ReservationBuilder()
                .user(user)
                .ticketType(ticketType)
                .quantity(request.getQuantity())
                .status(ReservationStatus.PENDING) 
                .build();

        TicketReservation saved = ticketReservationRepository.save(reservation);

        return new ReservationResponseDTO(
                saved.getReservationId(),
                saved.getTicketType().getTicketTypeId(),
                saved.getQuantity(),
                saved.getStatus().name(), 
                saved.getExpiresAt()
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public String processPayment(PurchaseRequestDTO request) {
        TicketReservation reservation = ticketReservationRepository
                .findByIdForUpdate(request.getReservationId())
                .orElseThrow(() -> new NotFoundException("Reservation not found"));

        if (reservation.getStatus() == ReservationStatus.PAID || reservation.getStatus() == ReservationStatus.COMPLETED) {
            Order existingOrder = orderRepository.findByTicketReservation(reservation)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            return "Already paid! Order ID: " + existingOrder.getOrderId();
        }

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new BadRequestException("Reservation is not valid for payment");
        }

        if (isExpired(reservation)) {
            handleExpiredReservation(reservation);
            throw new BadRequestException("Reservation expired. Tickets returned.");
        }

        BigDecimal totalPrice = calculateTotalPrice(reservation);

        Order order = new Order();
        order.setUser(reservation.getUser());
        order.setTotalPrice(totalPrice);
        order.setPaymentStatus("PAID");
        order.setPaymentMethod(request.getPaymentMethod().name());
        order.setTicketReservation(reservation);
        order.setTransactionId(UUID.randomUUID().toString());

        orderRepository.save(order);


        reservation.setStatus(ReservationStatus.PAID);
        ticketReservationRepository.save(reservation);

        return "Payment successful! Order ID: " + order.getOrderId();
    }

    private boolean isExpired(TicketReservation reservation) {
        return Instant.now().isAfter(reservation.getExpiresAt());
    }

    private void handleExpiredReservation(TicketReservation reservation) {
        reservation.setStatus(ReservationStatus.EXPIRED); 
        releaseTicket(reservation);
        ticketReservationRepository.save(reservation);
    }

    private void releaseTicket(TicketReservation reservation) {
        TicketType ticketType = reservation.getTicketType();
        ticketType.setQuantity(ticketType.getQuantity() + reservation.getQuantity());
        ticketTypeRepository.save(ticketType);
    }

    private BigDecimal calculateTotalPrice(TicketReservation reservation) {
        return reservation.getTicketType().getPrice()
                .multiply(BigDecimal.valueOf(reservation.getQuantity()));
    }
}