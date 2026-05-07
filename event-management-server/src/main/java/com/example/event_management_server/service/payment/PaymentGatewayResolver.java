package com.example.event_management_server.service.payment;

import com.example.event_management_server.model.PaymentMethod;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class PaymentGatewayResolver {

    private final Map<PaymentMethod, PaymentService> services = new EnumMap<>(PaymentMethod.class);

    public PaymentGatewayResolver(List<PaymentService> impls) {
        for (PaymentService s : impls) services.put(s.method(), s);
    }

    public PaymentService resolve(PaymentMethod method) {
        PaymentService s = services.get(method);
        if (s == null) throw new IllegalArgumentException("Unsupported payment method: " + method);
        return s;
    }
}
