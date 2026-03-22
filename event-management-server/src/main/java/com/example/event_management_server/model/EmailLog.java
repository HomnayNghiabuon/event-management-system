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

    @Column(name = "send_at")
    private Instant sendAt;

    @PrePersist
    protected void onCreate() {
        if (this.sendAt == null) {
            this.sendAt = Instant.now();
        }
    }

    // ===== Getter Setter =====
    public Integer getEmailId() { return emailId; }
    public void setEmailId(Integer emailId) { this.emailId = emailId; }

    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getSendAt() { return sendAt; }
    public void setSendAt(Instant sendAt) { this.sendAt = sendAt; }
}