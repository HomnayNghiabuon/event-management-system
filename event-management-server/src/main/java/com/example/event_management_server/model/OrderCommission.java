package com.example.event_management_server.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "order_commissions",
        uniqueConstraints = @UniqueConstraint(name = "uk_order_commission_order", columnNames = "order_id"),
        indexes = {
            @Index(name = "idx_order_commission_organizer", columnList = "organizer_id"),
            @Index(name = "idx_order_commission_event", columnList = "event_id")
        })
public class OrderCommission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_commission_id")
    private Integer orderCommissionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @Column(name = "gross_amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal grossAmount;

    @Column(name = "commission_percent", precision = 5, scale = 2, nullable = false)
    private BigDecimal commissionPercent;

    @Column(name = "commission_amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal commissionAmount;

    @Column(name = "net_amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal netAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commission_id")
    private Commission commission;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public OrderCommission() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Integer getOrderCommissionId() { return orderCommissionId; }
    public Order getOrder() { return order; }
    public User getOrganizer() { return organizer; }
    public Event getEvent() { return event; }
    public BigDecimal getGrossAmount() { return grossAmount; }
    public BigDecimal getCommissionPercent() { return commissionPercent; }
    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public BigDecimal getNetAmount() { return netAmount; }
    public Commission getCommission() { return commission; }
    public Instant getCreatedAt() { return createdAt; }

    public void setOrderCommissionId(Integer id) { this.orderCommissionId = id; }
    public void setOrder(Order order) { this.order = order; }
    public void setOrganizer(User organizer) { this.organizer = organizer; }
    public void setEvent(Event event) { this.event = event; }
    public void setGrossAmount(BigDecimal v) { this.grossAmount = v; }
    public void setCommissionPercent(BigDecimal v) { this.commissionPercent = v; }
    public void setCommissionAmount(BigDecimal v) { this.commissionAmount = v; }
    public void setNetAmount(BigDecimal v) { this.netAmount = v; }
    public void setCommission(Commission commission) { this.commission = commission; }
}
