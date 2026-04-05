package com.example.event_management_server.repository;

import com.example.event_management_server.model.Order;
import com.example.event_management_server.model.TicketReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findByTicketReservation(TicketReservation ticketReservation);

}