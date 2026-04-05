package com.example.event_management_server.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ticket_types", indexes = {
    @Index(name = "idx_ticket_types_event", columnList = "event_id")
})
public class TicketType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_type_id")
    private Integer ticketTypeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false, length = 100)
    private String name; // Ví dụ: VIP, General Admission, Student

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer quantity; // Tổng số lượng vé phát hành cho loại này

    // ===== Constructors =====
    public TicketType() {}

    // ===== Getters & Setters =====
    public Integer getTicketTypeId() { return ticketTypeId; }
    public void setTicketTypeId(Integer ticketTypeId) { this.ticketTypeId = ticketTypeId; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getAvailableQuantity() { return quantity; }

    // ===== Builder Pattern =====
    public static final class TicketTypeBuilder {
        private Integer ticketTypeId;
        private Event event;
        private String name;
        private BigDecimal price;
        private Integer quantity;

        public TicketTypeBuilder ticketTypeId(Integer ticketTypeId) { this.ticketTypeId = ticketTypeId; return this; }
        public TicketTypeBuilder event(Event event) { this.event = event; return this; }
        public TicketTypeBuilder name(String name) { this.name = name; return this; }
        public TicketTypeBuilder price(BigDecimal price) { this.price = price; return this; }
        public TicketTypeBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }

        public TicketType build() {
            TicketType ticketType = new TicketType();
            ticketType.setTicketTypeId(this.ticketTypeId);
            ticketType.setEvent(this.event);
            ticketType.setName(this.name);
            ticketType.setPrice(this.price);
            ticketType.setQuantity(this.quantity);
            return ticketType;
        }
    }
}