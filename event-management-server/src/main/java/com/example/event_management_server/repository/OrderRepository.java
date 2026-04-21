package com.example.event_management_server.repository;

import com.example.event_management_server.model.Order;
import com.example.event_management_server.model.TicketReservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findByTicketReservation(TicketReservation ticketReservation);

    Page<Order> findByUser_IdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @Query("""
        SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o
        JOIN o.ticketReservation r
        JOIN r.ticketType tt
        WHERE tt.event.eventId = :eventId AND o.paymentStatus = 'PAID'
        """)
    java.math.BigDecimal sumRevenueByEventId(@Param("eventId") Integer eventId);

    @Query("""
        SELECT COUNT(o) FROM Order o
        JOIN o.ticketReservation r
        JOIN r.ticketType tt
        WHERE tt.event.eventId = :eventId AND o.paymentStatus = 'PAID'
        """)
    long countPaidOrdersByEventId(@Param("eventId") Integer eventId);
}