package com.event.management.server.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email", columnList = "email", unique = true)
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('ADMIN','ORGANIZER','ATTENDEE')", nullable = false)
    private Role role;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    private LocalDate dob;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(length = 10)
    private String gender;

    // ===== Constructors =====
    public User() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.isActive == null) {
            this.isActive = true;
        }
    }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public static final class UserBuilder {
        private Integer userId;
        private String name;
        private String email;
        private String password;
        private String phone;
        private Role role;
        private Instant createdAt;
        private LocalDate dob;
        private Boolean isActive;
        private String gender;

        public UserBuilder userId(Integer userId) { this.userId = userId; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder role(Role role) { this.role = role; return this; }
        public UserBuilder dob(LocalDate dob) { this.dob = dob; return this; }
        public UserBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public UserBuilder gender(String gender) { this.gender = gender; return this; }

        public User build() {
            User user = new User();
            user.setUserId(this.userId);
            user.setName(this.name);
            user.setEmail(this.email);
            user.setPassword(this.password);
            user.setPhone(this.phone);
            user.setRole(this.role);
            user.setDob(this.dob);
            user.setIsActive(this.isActive);
            user.setGender(this.gender);
            return user;
        }
    }
}

enum Role { ADMIN, ORGANIZER, ATTENDEE }