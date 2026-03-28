package com.event.management.server.repository;

import com.event.management.server.entity.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

@Repository
public interface TicketTypeRepository extends JpaRepository<TicketType, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TicketType t WHERE t.ticketTypeId = :id")
    Optional<TicketType> findByIdForUpdate(@Param("id") Integer id);
}