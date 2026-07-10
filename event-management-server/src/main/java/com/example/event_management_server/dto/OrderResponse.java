package com.example.event_management_server.dto;

import com.example.event_management_server.model.Order;
import com.example.event_management_server.model.Ticket;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record OrderResponse(
        Integer orderId,
        BigDecimal totalPrice,
        String paymentStatus,
        String paymentMethod,
        String transactionId,
        Instant createdAt,
        Instant paidAt,
        Integer eventId,
        String eventTitle,
        LocalDate eventDate,
        LocalTime startTime,
        String eventLocation,
        String eventThumbnail,
        String ticketTypeName,
        BigDecimal unitPrice,
        Integer quantity,
        List<TicketInfo> tickets
) {
    public record TicketInfo(
            Integer ticketId,
            String qrCode,
            String attendeeName,
            Boolean checkinStatus,
            Instant checkinTime
    ) {
        public static TicketInfo from(Ticket t) {
            return new TicketInfo(
                    t.getTicketId(),
                    t.getQrCode(),
                    t.getAttendeeName(),
                    t.getCheckinStatus(),
                    t.getCheckinTime()
            );
        }
    }

    public static OrderResponse from(Order o, List<TicketInfo> tickets,
                                     Integer eventId, String eventTitle,
                                     LocalDate eventDate, LocalTime startTime,
                                     String eventLocation, String eventThumbnail,
                                     String ticketTypeName, BigDecimal unitPrice,
                                     Integer quantity) {
        return new OrderResponse(
                o.getOrderId(),
                o.getTotalPrice(),
                o.getPaymentStatus(),
                o.getPaymentMethod(),
                o.getTransactionId(),
                o.getCreatedAt(),
                o.getPaidAt(),
                eventId,
                eventTitle,
                eventDate,
                startTime,
                eventLocation,
                eventThumbnail,
                ticketTypeName,
                unitPrice,
                quantity,
                tickets
        );
    }
}
