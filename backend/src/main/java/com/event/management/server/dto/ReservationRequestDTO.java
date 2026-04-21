package com.event.management.server.dto;

import jakarta.validation.constraints.NotNull;

public class ReservationRequestDTO {

    @NotNull(message = "userId is required")
    private Integer userId;

    @NotNull(message = "ticketTypeId is required")
    private Integer ticketTypeId;

    @NotNull(message = "quantity is required")
    private Integer quantity;

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
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