package com.example.event_management_server.dto.payment;

import com.example.event_management_server.model.PaymentMethod;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CreatePaymentRequest {

    @NotNull(message = "reservationId is required")
    private Integer reservationId;

    @NotNull(message = "paymentMethod is required")
    private PaymentMethod paymentMethod;

    private List<String> attendeeNames;

    public Integer getReservationId() { return reservationId; }
    public void setReservationId(Integer reservationId) { this.reservationId = reservationId; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public List<String> getAttendeeNames() { return attendeeNames; }
    public void setAttendeeNames(List<String> attendeeNames) { this.attendeeNames = attendeeNames; }
}
