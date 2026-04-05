package com.example.event_management_server.repository;

import com.example.event_management_server.model.TicketType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TicketTypeRepository extends JpaRepository<TicketType, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TicketType t WHERE t.ticketTypeId = :id")
    Optional<TicketType> findByIdForUpdate(@Param("id") Integer id);

    List<TicketType> findByEvent_EventId(Integer eventId);
    void deleteByEvent_EventId(Integer eventId);
}
