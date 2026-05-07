package com.example.event_management_server.dto.payment;

public record CreatePaymentResponse(
        String payUrl,
        String orderCode,
        Integer orderId,
        String paymentMethod
) {}
