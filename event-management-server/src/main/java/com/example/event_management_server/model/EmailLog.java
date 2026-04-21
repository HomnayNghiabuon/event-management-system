package com.example.event_management_server.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "email_logs")
public class EmailLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "email_id")
    private Integer emailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id")
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    @Column
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "send_at", updatable = false)
    private Instant sendAt;

    // Constructor rỗng
    public EmailLog() {}

    // Constructor đầy đủ
    public EmailLog(Integer emailId, User recipient, Event event,
                    String subject, String content, Instant sendAt) {
        this.emailId = emailId;
        this.recipient = recipient;
        this.event = event;
        this.subject = subject;
        this.content = content;
        this.sendAt = sendAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.sendAt == null) {
            this.sendAt = Instant.now();
        }
    }

    // ===== Getter =====
    public Integer getEmailId() {
        return emailId;
    }

    public User getRecipient() {
        return recipient;
    }

    public Event getEvent() {
        return event;
    }

    public String getSubject() {
        return subject;
    }

    public String getContent() {
        return content;
    }

    public Instant getSendAt() {
        return sendAt;
    }

    // ===== Setter =====
    public void setEmailId(Integer emailId) {
        this.emailId = emailId;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setContent(String content) {
        this.content = content;
    }

}