package com.event.management.server.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "commissions")
public class Commission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "commission_id")
    private Integer commissionId;

    @Column(name = "percent", precision = 5, scale = 2)
    private BigDecimal percent;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "effective_from")
    private Instant effectiveFrom;

    @Column(name = "is_active")
    private Boolean isActive;

    // Constructor rỗng (thay @NoArgsConstructor)
    public Commission() {}

    // Constructor full (thay @AllArgsConstructor)
    public Commission(Integer commissionId, BigDecimal percent, Instant createdAt,
                      Instant effectiveFrom, Boolean isActive) {
        this.commissionId = commissionId;
        this.percent = percent;
        this.createdAt = createdAt;
        this.effectiveFrom = effectiveFrom;
        this.isActive = isActive;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.isActive == null) {
            this.isActive = true;
        }
    }

    // ===== Getter =====
    public Integer getCommissionId() {
        return commissionId;
    }

    public BigDecimal getPercent() {
        return percent;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getEffectiveFrom() {
        return effectiveFrom;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    // ===== Setter =====
    public void setCommissionId(Integer commissionId) {
        this.commissionId = commissionId;
    }

    public void setPercent(BigDecimal percent) {
        this.percent = percent;
    }

    public void setEffectiveFrom(Instant effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

}