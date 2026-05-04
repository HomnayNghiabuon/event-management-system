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

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "address_detail", length = 255)
    private String addressDetail;

    private String thumbnail;

    @Column(name = "min_price", precision = 19, scale = 2)
    private BigDecimal minPrice;

    @Column(name = "approval_status", length = 20)
    private String approvalStatus = "PENDING"; // PENDING | APPROVED | REJECTED

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

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

    // ===== Constructors =====
    public Event() {}

    // ===== Lifecycle =====

    /** Tự động set createdAt và approvalStatus=PENDING trước INSERT. */
    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.approvalStatus == null) {
            this.approvalStatus = "PENDING"; // mặc định chờ admin duyệt
        }
        validateTime();
    }

    /** Cập nhật updatedAt trước mỗi UPDATE. */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
        validateTime();
    }

    /** Validate startTime < endTime ở tầng model — bảo vệ toàn vẹn dữ liệu ngay cả khi service bỏ qua. */
    private void validateTime() {
        if (startTime != null && endTime != null && startTime.isAfter(endTime)) {
            throw new IllegalArgumentException("startTime phải trước endTime");
        }
    }

    // ===== Builder =====
    public static EventBuilder builder() {
        return new EventBuilder();
    }

    public static class EventBuilder {
        private String title;
        private String description;
        private LocalDate eventDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private String status;
        private String location;
        private Double latitude;
        private Double longitude;
        private String addressDetail;
        private String thumbnail;
        private BigDecimal minPrice;
        private String approvalStatus = "PENDING";
        private User organizer;
        private Category category;

        public EventBuilder title(String title) { this.title = title; return this; }
        public EventBuilder description(String description) { this.description = description; return this; }
        public EventBuilder eventDate(LocalDate eventDate) { this.eventDate = eventDate; return this; }
        public EventBuilder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public EventBuilder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public EventBuilder status(String status) { this.status = status; return this; }
        public EventBuilder location(String location) { this.location = location; return this; }
        public EventBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public EventBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public EventBuilder addressDetail(String addressDetail) { this.addressDetail = addressDetail; return this; }
        public EventBuilder thumbnail(String thumbnail) { this.thumbnail = thumbnail; return this; }
        public EventBuilder minPrice(BigDecimal minPrice) { this.minPrice = minPrice; return this; }
        public EventBuilder approvalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; return this; }
        public EventBuilder organizer(User organizer) { this.organizer = organizer; return this; }
        public EventBuilder category(Category category) { this.category = category; return this; }

        public Event build() {
            Event e = new Event();
            e.title = this.title;
            e.description = this.description;
            e.eventDate = this.eventDate;
            e.startTime = this.startTime;
            e.endTime = this.endTime;
            e.status = this.status;
            e.location = this.location;
            e.latitude = this.latitude;
            e.longitude = this.longitude;
            e.addressDetail = this.addressDetail;
            e.thumbnail = this.thumbnail;
            e.minPrice = this.minPrice;
            e.approvalStatus = this.approvalStatus;
            e.organizer = this.organizer;
            e.category = this.category;
            return e;
        }
    }

    // ===== Getters =====
    public Integer getEventId() { return eventId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDate getEventDate() { return eventDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public String getStatus() { return status; }
    public String getLocation() { return location; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getAddressDetail() { return addressDetail; }
    public String getThumbnail() { return thumbnail; }
    public BigDecimal getMinPrice() { return minPrice; }
    public String getApprovalStatus() { return approvalStatus; }
    public String getRejectionReason() { return rejectionReason; }
    public User getReviewedBy() { return reviewedBy; }
    public Instant getReviewedAt() { return reviewedAt; }
    public User getOrganizer() { return organizer; }
    public Category getCategory() { return category; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    // ===== Setters =====
    public void setEventId(Integer eventId) { this.eventId = eventId; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public void setStatus(String status) { this.status = status; }
    public void setLocation(String location) { this.location = location; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public void setAddressDetail(String addressDetail) { this.addressDetail = addressDetail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
    public void setOrganizer(User organizer) { this.organizer = organizer; }
    public void setCategory(Category category) { this.category = category; }
}
