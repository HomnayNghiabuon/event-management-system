package com.event.management.server.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Integer ticketId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_detail_id", nullable = false)
    private OrderDetail orderDetail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendee_id")
    private User attendee;

    @Column(name = "qr_code")
    private String qrCode;

    @Column(name = "checkin_status")
    private Boolean checkinStatus = false;

    @Column(name = "checkin_time")
    private Instant checkinTime;

    @Column(name = "attendee_name")
    private String attendeeName;

    @PrePersist
    protected void onCreate() {
        if (this.checkinStatus == null) {
            this.checkinStatus = false;
        }
    }

    // ===== Getter Setter =====
    public Integer getTicketId() { return ticketId; }
    public void setTicketId(Integer ticketId) { this.ticketId = ticketId; }

    public OrderDetail getOrderDetail() { return orderDetail; }
    public void setOrderDetail(OrderDetail orderDetail) { this.orderDetail = orderDetail; }

    public User getAttendee() { return attendee; }
    public void setAttendee(User attendee) { this.attendee = attendee; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public Boolean getCheckinStatus() { return checkinStatus; }
    public void setCheckinStatus(Boolean checkinStatus) { this.checkinStatus = checkinStatus; }

    public Instant getCheckinTime() { return checkinTime; }
    public void setCheckinTime(Instant checkinTime) { this.checkinTime = checkinTime; }

    public String getAttendeeName() { return attendeeName; }
    public void setAttendeeName(String attendeeName) { this.attendeeName = attendeeName; }
}