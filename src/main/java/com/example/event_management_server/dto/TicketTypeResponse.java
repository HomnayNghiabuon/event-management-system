
package com.example.event_management_server.dto;

import com.example.event_management_server.model.TicketType;

import java.math.BigDecimal;

public record TicketTypeResponse(
        Integer ticketTypeId,
        String name,
        BigDecimal price,
        Integer quantity
) {
    public static TicketTypeResponse from(TicketType tt) {
        return new TicketTypeResponse(
                tt.getTicketTypeId(),
                tt.getName(),
                tt.getPrice(),
                tt.getQuantity()
        );
    }
}
