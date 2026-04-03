package com.example.event_management_server.repository;

import com.example.event_management_server.model.TicketType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketTypeRepository extends JpaRepository<TicketType, Integer> {
    List<TicketType> findByEvent_EventId(Integer eventId);
    void deleteByEvent_EventId(Integer eventId);
}
