package com.example.event_management_server.service.payment;

import com.example.event_management_server.model.Order;
import com.example.event_management_server.model.PaymentMethod;

import java.util.Map;

public interface PaymentService {

    PaymentMethod method();

    /** Tạo URL gateway, lưu PaymentTransaction status=INIT. */
    String createPaymentUrl(Order order, String clientIp);

    /** Verify chữ ký + parse params từ browser return URL. */
    PaymentCallbackResult verifyReturn(Map<String, String> params);

    /** Verify IPN webhook (server-to-server, nguồn sự thật). */
    PaymentCallbackResult verifyIpn(Map<String, String> params);
}
