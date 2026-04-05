package com.example.event_management_server.dto;

import com.example.event_management_server.model.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public class PurchaseRequestDTO {

    @NotNull(message = "reservationId is required")
    private Integer reservationId;

    @NotNull(message = "paymentMethod is required")
    private PaymentMethod paymentMethod;

    public Integer getReservationId() {
        return reservationId;
    }

    public void setReservationId(Integer reservationId) {
        this.reservationId = reservationId;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}