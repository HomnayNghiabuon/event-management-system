package com.event.management.server.repository;

import com.event.management.server.entity.Order;
import com.event.management.server.entity.TicketReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findByTicketReservation(TicketReservation ticketReservation);

}