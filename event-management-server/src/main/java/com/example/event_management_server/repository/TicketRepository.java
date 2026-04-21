package com.example.event_management_server.repository;

import com.example.event_management_server.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    List<Ticket> findByAttendee_Id(java.util.UUID attendeeId);
    @Query("SELECT t FROM Ticket t JOIN FETCH t.orderDetail od JOIN FETCH od.ticketType tt JOIN FETCH tt.event WHERE t.qrCode = :qrCode")
    Optional<Ticket> findByQrCode(@Param("qrCode") String qrCode);

    @Query("""
        SELECT t FROM Ticket t
        JOIN t.orderDetail od
        JOIN od.order o
        JOIN o.ticketReservation r
        JOIN r.ticketType tt
        WHERE tt.event.eventId = :eventId
        """)
    List<Ticket> findByEventId(@Param("eventId") Integer eventId);

    @Query("""
        SELECT COUNT(t) FROM Ticket t
        JOIN t.orderDetail od
        JOIN od.order o
        JOIN o.ticketReservation r
        JOIN r.ticketType tt
        WHERE tt.event.eventId = :eventId
        """)
    long countByEventId(@Param("eventId") Integer eventId);

    @Query("""
        SELECT COUNT(t) FROM Ticket t
        JOIN t.orderDetail od
        JOIN od.order o
        JOIN o.ticketReservation r
        JOIN r.ticketType tt
        WHERE tt.event.eventId = :eventId AND t.checkinStatus = true
        """)
    long countCheckedInByEventId(@Param("eventId") Integer eventId);
}
