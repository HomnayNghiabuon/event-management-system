package com.example.event_management_server.service.payment;

import com.example.event_management_server.model.PaymentMethod;

/**
 * Kết quả parse + verify từ return URL hoặc IPN của gateway.
 *
 * @param success         true nếu chữ ký hợp lệ và gateway trả về thành công
 * @param signatureValid  true nếu chữ ký HMAC hợp lệ (kể cả khi giao dịch fail)
 * @param provider        VNPAY hoặc MOMO
 * @param orderCode       gateway_order_code (= vnp_TxnRef hoặc requestId/orderId của Momo)
 * @param providerTxnId   id giao dịch ở gateway (vnp_TransactionNo, momo transId)
 * @param amount          số tiền (đơn vị VND)
 * @param responseCode    raw response code (vnp_ResponseCode hoặc resultCode)
 * @param message         thông điệp người dùng đọc
 * @param rawSignature    chữ ký gateway gửi về (để log)
 */
public record PaymentCallbackResult(
        boolean success,
        boolean signatureValid,
        PaymentMethod provider,
        String orderCode,
        String providerTxnId,
        java.math.BigDecimal amount,
        String responseCode,
        String message,
        String rawSignature
) {}
