package com.event.management.server.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_details")
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_detail_id")
    private Integer orderDetailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_type_id", nullable = false)
    private TicketType ticketType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price", precision = 19, scale = 2)
    private BigDecimal price;

    // ===== Constructor =====
    public OrderDetail() {}

    public OrderDetail(Integer orderDetailId, Order order, TicketType ticketType,
                       Integer quantity, BigDecimal price) {
        this.orderDetailId = orderDetailId;
        this.order = order;
        this.ticketType = ticketType;
        this.quantity = quantity;
        this.price = price;
    }

    // ===== Getter =====
    public Integer getOrderDetailId() { return orderDetailId; }
    public Order getOrder() { return order; }
    public TicketType getTicketType() { return ticketType; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getPrice() { return price; }

    // ===== Setter =====
    public void setOrderDetailId(Integer orderDetailId) { this.orderDetailId = orderDetailId; }
    public void setOrder(Order order) { this.order = order; }
    public void setTicketType(TicketType ticketType) { this.ticketType = ticketType; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public void setPrice(BigDecimal price) { this.price = price; }
}