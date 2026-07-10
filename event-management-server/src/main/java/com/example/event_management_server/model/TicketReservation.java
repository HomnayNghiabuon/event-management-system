package com.example.event_management_server.model;

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

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ReservationStatus status;

    /**
     * Chạy tự động trước khi INSERT vào DB.
     * expiresAt = reservedAt + 600 giây (10 phút) — thời gian giữ vé.
     * ReservationCleanupTask chạy mỗi 60s để dọn các reservation PENDING đã quá expiresAt.
     */
    @PrePersist
    protected void onCreate() {
        this.reservedAt = Instant.now();
        if (this.expiresAt == null) {
            this.expiresAt = this.reservedAt.plusSeconds(600); // 10 phút giữ chỗ
        }
        if (this.status == null) {
            this.status = ReservationStatus.PENDING;
        }
    }

    public TicketReservation() {}

    // ===== Getter Setter =====
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

    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }

    /** Kiểm tra reservation đã hết hạn chưa (so sánh thời điểm hiện tại với expiresAt). */
    public boolean isExpired() {
        return Instant.now().isAfter(this.expiresAt);
    }

    // ===== Builder =====
    public static final class ReservationBuilder {
        private Integer reservationId;
        private User user;
        private TicketType ticketType;
        private Integer quantity;
        private Instant expiresAt;
        private ReservationStatus status;

        public ReservationBuilder reservationId(Integer reservationId) { this.reservationId = reservationId; return this; }
        public ReservationBuilder user(User user) { this.user = user; return this; }
        public ReservationBuilder ticketType(TicketType ticketType) { this.ticketType = ticketType; return this; }
        public ReservationBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public ReservationBuilder expiresAt(Instant expiresAt) { this.expiresAt = expiresAt; return this; }
        public ReservationBuilder status(ReservationStatus status) { this.status = status; return this; }

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