package com.event.management.server.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ticket_reservations", indexes = {
    @Index(name = "idx_reservations_expires", columnList = "expires_at"),
    @Index(name = "idx_reservations_user", columnList = "user_id")
})
public class TicketReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Integer reservationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_type_id", nullable = false)
    private TicketType ticketType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "reserved_at", nullable = false, updatable = false)
    private Instant reservedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(length = 20)
    private String status; // PENDING, COMPLETED, EXPIRED

    // ===== Lifecycle Callbacks =====
    @PrePersist
    protected void onCreate() {
        this.reservedAt = Instant.now();
        // Mặc định giữ chỗ trong 10 phút nếu chưa set
        if (this.expiresAt == null) {
            this.expiresAt = this.reservedAt.plusSeconds(600); 
        }
        if (this.status == null) {
            this.status = "PENDING";
        }
    }

    // ===== Constructors =====
    public TicketReservation() {}

    // ===== Getters & Setters =====
    public Integer getReservationId() { return reservationId; }
    public void setReservationId(Integer reservationId) { this.reservationId = reservationId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public TicketType getTicketType() { return ticketType; }
    public void setTicketType(TicketType ticketType) { this.ticketType = ticketType; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Instant getReservedAt() { return reservedAt; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // ===== Builder Pattern =====
    public static final class ReservationBuilder {
        private Integer reservationId;
        private User user;
        private TicketType ticketType;
        private Integer quantity;
        private Instant expiresAt;
        private String status;

        public ReservationBuilder reservationId(Integer reservationId) { this.reservationId = reservationId; return this; }
        public ReservationBuilder user(User user) { this.user = user; return this; }
        public ReservationBuilder ticketType(TicketType ticketType) { this.ticketType = ticketType; return this; }
        public ReservationBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public ReservationBuilder expiresAt(Instant expiresAt) { this.expiresAt = expiresAt; return this; }
        public ReservationBuilder status(String status) { this.status = status; return this; }

        public TicketReservation build() {
            TicketReservation res = new TicketReservation();
            res.setReservationId(this.reservationId);
            res.setUser(this.user);
            res.setTicketType(this.ticketType);
            res.setQuantity(this.quantity);
            res.setExpiresAt(this.expiresAt);
            res.setStatus(this.status);
            return res;
        }
    }
}