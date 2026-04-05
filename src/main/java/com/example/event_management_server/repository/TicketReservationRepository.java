package com.example.event_management_server.repository;

import com.example.event_management_server.model.TicketReservation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketReservationRepository extends JpaRepository<TicketReservation, Integer> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM TicketReservation r WHERE r.reservationId = :id")
    Optional<TicketReservation> findByIdForUpdate(@Param("id") Integer id);
}