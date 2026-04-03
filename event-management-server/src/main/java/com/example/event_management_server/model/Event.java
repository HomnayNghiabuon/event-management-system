package com.example.event_management_server.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "events", indexes = {
    @Index(name = "idx_events_title", columnList = "title"),
    @Index(name = "idx_events_date", columnList = "event_date")
})
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Integer eventId;

    @NotBlank(message = "Title không được để trống")
    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(length = 50)
    private String status;

    @Column(length = 255)
    private String location;

    private String thumbnail;

    @Column(name = "min_price", precision = 19, scale = 2)
    private BigDecimal minPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    // ===== Constructor rỗng =====
    public Event() {}

    // ===== Constructor full =====
    public Event(Integer eventId, String title, String description,
                 LocalDate eventDate, LocalTime startTime, LocalTime endTime,
                 String status, String location, String thumbnail,
                 BigDecimal minPrice, User organizer, Category category,
                 Instant createdAt, Instant updatedAt) {
        this.eventId = eventId;
        this.title = title;
        this.description = description;
        this.eventDate = eventDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.location = location;
        this.thumbnail = thumbnail;
        this.minPrice = minPrice;
        this.organizer = organizer;
        this.category = category;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ===== Lifecycle =====
    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        validateTime();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
        validateTime();
    }

    // ===== Validation =====
    private void validateTime() {
        if (startTime != null && endTime != null) {
            if (startTime.isAfter(endTime)) {
                throw new IllegalArgumentException("startTime phải trước endTime");
            }
        }
    }

    // ===== Getter =====
    public Integer getEventId() { return eventId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDate getEventDate() { return eventDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public String getStatus() { return status; }
    public String getLocation() { return location; }
    public String getThumbnail() { return thumbnail; }
    public BigDecimal getMinPrice() { return minPrice; }
    public User getOrganizer() { return organizer; }
    public Category getCategory() { return category; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    // ===== Setter =====
    public void setEventId(Integer eventId) { this.eventId = eventId; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setStatus(String status) { this.status = status; }
    public void setLocation(String location) { this.location = location; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }
    public void setOrganizer(User organizer) { this.organizer = organizer; }
    public void setCategory(Category category) { this.category = category; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

}