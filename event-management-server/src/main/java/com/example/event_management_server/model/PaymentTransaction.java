package com.example.event_management_server.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payment_transactions",
        indexes = {
            @Index(name = "idx_payment_tx_order", columnList = "order_id"),
            @Index(name = "idx_payment_tx_provider_ref",
                    columnList = "provider, provider_txn_ref", unique = true)
        })
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_transaction_id")
    private Integer paymentTransactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false, length = 16)
    private PaymentMethod provider;

    @Column(name = "provider_txn_ref", nullable = false, length = 64)
    private String providerTxnRef;

    @Column(name = "provider_txn_id", length = 64)
    private String providerTxnId;

    @Column(name = "amount", precision = 19, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", length = 8, nullable = false)
    private String currency = "VND";

    @Column(name = "status", length = 32, nullable = false)
    private String status;

    @Column(name = "request_payload", columnDefinition = "TEXT")
    private String requestPayload;

    @Column(name = "response_payload", columnDefinition = "TEXT")
    private String responsePayload;

    @Column(name = "signature", length = 512)
    private String signature;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    public PaymentTransaction() {}

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Integer getPaymentTransactionId() { return paymentTransactionId; }
    public Order getOrder() { return order; }
    public PaymentMethod getProvider() { return provider; }
    public String getProviderTxnRef() { return providerTxnRef; }
    public String getProviderTxnId() { return providerTxnId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getStatus() { return status; }
    public String getRequestPayload() { return requestPayload; }
    public String getResponsePayload() { return responsePayload; }
    public String getSignature() { return signature; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setPaymentTransactionId(Integer id) { this.paymentTransactionId = id; }
    public void setOrder(Order order) { this.order = order; }
    public void setProvider(PaymentMethod provider) { this.provider = provider; }
    public void setProviderTxnRef(String ref) { this.providerTxnRef = ref; }
    public void setProviderTxnId(String id) { this.providerTxnId = id; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setCurrency(String currency) { this.currency = currency; }
    public void setStatus(String status) { this.status = status; }
    public void setRequestPayload(String payload) { this.requestPayload = payload; }
    public void setResponsePayload(String payload) { this.responsePayload = payload; }
    public void setSignature(String signature) { this.signature = signature; }
}
