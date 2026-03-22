package com.example.event_management_server.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_user", columnList = "user_id"),
    @Index(name = "idx_notifications_status", columnList = "is_read")
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Integer notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(length = 50)
    private String type; 

    // ===== Lifecycle =====
    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.isRead == null) {
            this.isRead = false;
        }
    }

    // ===== Constructor =====
    public Notification() {}

    // ===== Getter Setter =====
    public Integer getNotificationId() { return notificationId; }
    public void setNotificationId(Integer notificationId) { this.notificationId = notificationId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public Instant getCreatedAt() { return createdAt; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    // ===== Builder =====
    public static final class NotificationBuilder {
        private Integer notificationId;
        private User user;
        private String title;
        private String message;
        private Boolean isRead;
        private String type; 

        public NotificationBuilder notificationId(Integer notificationId) { this.notificationId = notificationId; return this; }
        public NotificationBuilder user(User user) { this.user = user; return this; }
        public NotificationBuilder title(String title) { this.title = title; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder isRead(Boolean isRead) { this.isRead = isRead; return this; }
        public NotificationBuilder type(String type) { this.type = type; return this; }

        public Notification build() {
            Notification notification = new Notification();
            notification.setNotificationId(this.notificationId);
            notification.setUser(this.user);
            notification.setTitle(this.title);
            notification.setMessage(this.message);
            notification.setIsRead(this.isRead);
            notification.setType(this.type); 
            return notification;
        }
    }
}