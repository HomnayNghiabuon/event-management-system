package com.example.event_management_server.repository;

import com.example.event_management_server.model.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Integer> {
    List<OrderDetail> findByOrder_OrderId(Integer orderId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(od) FROM OrderDetail od WHERE od.ticketType.event.eventId = :eventId")
    long countByEventId(@org.springframework.data.repository.query.Param("eventId") Integer eventId);
}
