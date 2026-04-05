package com.example.event_management_server.dto;

import java.time.Instant;

public class ReservationResponseDTO {

    private Integer reservationId;
    private Integer ticketTypeId;
    private Integer quantity;
    private String status;
    private Instant expirationTime;

    public ReservationResponseDTO() {}

    public ReservationResponseDTO(Integer reservationId, Integer ticketTypeId, Integer quantity, String status, Instant expirationTime) {
        this.reservationId = reservationId;
        this.ticketTypeId = ticketTypeId;
        this.quantity = quantity;
        this.status = status;
        this.expirationTime = expirationTime;
    }

    public Integer getReservationId() { return reservationId; }
    public void setReservationId(Integer reservationId) { this.reservationId = reservationId; }

    public Integer getTicketTypeId() { return ticketTypeId; }
    public void setTicketTypeId(Integer ticketTypeId) { this.ticketTypeId = ticketTypeId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getExpirationTime() { return expirationTime; }
    public void setExpirationTime(Instant expirationTime) { this.expirationTime = expirationTime; }
}