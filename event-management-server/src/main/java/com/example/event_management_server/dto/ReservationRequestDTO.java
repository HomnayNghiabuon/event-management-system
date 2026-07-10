package com.example.event_management_server.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ReservationRequestDTO {

    @NotNull(message = "ticketTypeId is required")
    private Integer ticketTypeId;

    @NotNull(message = "quantity is required")
    @Min(value = 1, message = "quantity phải >= 1")
    @jakarta.validation.constraints.Max(value = 10, message = "Mỗi lần chỉ được đặt tối đa 10 vé")
    private Integer quantity;

    public Integer getTicketTypeId() { return ticketTypeId; }
    public void setTicketTypeId(Integer ticketTypeId) { this.ticketTypeId = ticketTypeId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
