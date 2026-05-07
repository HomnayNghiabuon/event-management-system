package com.example.event_management_server.service;

import com.example.event_management_server.model.Order;
import com.example.event_management_server.repository.OrderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Quét Order còn AWAITING_GATEWAY quá 15 phút → đánh dấu FAILED + hoàn vé.
 * Tránh Order kẹt vĩnh viễn nếu IPN không bao giờ về.
 */
@Component
public class PaymentTimeoutTask {

    private final OrderRepository orderRepository;
    private final ReservationService reservationService;

    public PaymentTimeoutTask(OrderRepository orderRepository, ReservationService reservationService) {
        this.orderRepository = orderRepository;
        this.reservationService = reservationService;
    }

    @Scheduled(fixedDelay = 60_000)
    public void expireStalePayments() {
        Instant cutoff = Instant.now().minus(15, ChronoUnit.MINUTES);
        List<Order> stale = orderRepository.findStaleAwaitingGateway(cutoff);
        for (Order o : stale) {
            try {
                reservationService.markOrderFailed(o);
            } catch (Exception e) {
                System.err.println("[PaymentTimeout] Lỗi khi expire order " + o.getOrderId() + ": " + e.getMessage());
            }
        }
        if (!stale.isEmpty()) {
            System.out.printf("[PaymentTimeout] Expired %d stale order(s).%n", stale.size());
        }
    }
}
