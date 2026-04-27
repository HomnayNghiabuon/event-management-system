package com.example.event_management_server.repository;

import com.example.event_management_server.model.TicketReservation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketReservationRepository extends JpaRepository<TicketReservation, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM TicketReservation r WHERE r.reservationId = :id")
    Optional<TicketReservation> findByIdForUpdate(@Param("id") Integer id);

    org.springframework.data.domain.Page<TicketReservation> findByUser_IdOrderByReservedAtDesc(UUID userId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT r FROM TicketReservation r WHERE r.status = 'PENDING' AND r.expiresAt < :now")
    List<TicketReservation> findExpiredPendingReservations(@Param("now") Instant now);

    long countByTicketType_Event_EventId(Integer eventId);
}