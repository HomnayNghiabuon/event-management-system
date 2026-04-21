package com.example.event_management_server.dto;

import com.example.event_management_server.model.Order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
        Integer orderId,
        BigDecimal totalPrice,
        String paymentStatus,
        String paymentMethod,
        String transactionId,
        Instant createdAt,
        List<TicketInfo> tickets
) {
    public record TicketInfo(Integer ticketId, String qrCode, String attendeeName, Boolean checkinStatus) {}

    public static OrderResponse from(Order o, List<TicketInfo> tickets) {
        return new OrderResponse(
                o.getOrderId(),
                o.getTotalPrice(),
                o.getPaymentStatus(),
                o.getPaymentMethod(),
                o.getTransactionId(),
                o.getCreatedAt(),
                tickets
        );
    }
}
