package com.example.event_management_server.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "gateway_order_code", unique = true, length = 64)
    private String gatewayOrderCode;

    @Column(name = "paid_at")
    private Instant paidAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private TicketReservation ticketReservation;

    @Transient
    private LocalDateTime orderDate;

    public Order() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // ===== Getter =====
    public Integer getOrderId() { return orderId; }
    public User getUser() { return user; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public String getPaymentStatus() { return paymentStatus; }
    public Instant getCreatedAt() { return createdAt; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getTransactionId() { return transactionId; }
    public TicketReservation getTicketReservation() { return ticketReservation; }
    public LocalDateTime getOrderDate() { return orderDate; }
    public String getGatewayOrderCode() { return gatewayOrderCode; }
    public Instant getPaidAt() { return paidAt; }

    // ===== Setter =====
    public void setOrderId(Integer orderId) { this.orderId = orderId; }
    public void setUser(User user) { this.user = user; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public void setTicketReservation(TicketReservation ticketReservation) { this.ticketReservation = ticketReservation; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
    public void setGatewayOrderCode(String gatewayOrderCode) { this.gatewayOrderCode = gatewayOrderCode; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
}
