package com.example.event_management_server.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class ReservationRequestDTO {

    @NotNull(message = "userId is required")
    private UUID userId;

    @NotNull(message = "ticketTypeId is required")
    private Integer ticketTypeId;

    @NotNull(message = "quantity is required")
    private Integer quantity;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public Integer getTicketTypeId() {
        return ticketTypeId;
    }

    public void setTicketTypeId(Integer ticketTypeId) {
        this.ticketTypeId = ticketTypeId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}