package com.example.event_management_server.controller;

import com.example.event_management_server.dto.payment.CreatePaymentRequest;
import com.example.event_management_server.dto.payment.CreatePaymentResponse;
import com.example.event_management_server.model.Order;
import com.example.event_management_server.model.PaymentMethod;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.OrderRepository;
import com.example.event_management_server.service.ReservationService;
import com.example.event_management_server.service.payment.PaymentCallbackResult;
import com.example.event_management_server.service.payment.PaymentGatewayResolver;
import com.example.event_management_server.service.payment.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final ReservationService reservationService;
    private final PaymentGatewayResolver gatewayResolver;
    private final OrderRepository orderRepository;

    public PaymentController(ReservationService reservationService,
                             PaymentGatewayResolver gatewayResolver,
                             OrderRepository orderRepository) {
        this.reservationService = reservationService;
        this.gatewayResolver = gatewayResolver;
        this.orderRepository = orderRepository;
    }

    /** Tạo URL gateway (VNPay/Momo). CASH dùng /reservations/purchase như cũ. */
    @PostMapping("/create")
    public CreatePaymentResponse createPayment(@Valid @RequestBody CreatePaymentRequest request,
                                               @AuthenticationPrincipal User user,
                                               HttpServletRequest httpRequest) {
        if (request.getPaymentMethod() == PaymentMethod.CASH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "CASH dùng /api/v1/reservations/purchase, không qua endpoint này");
        }

        Order order = reservationService.createOrderForGateway(
                request.getReservationId(),
                request.getPaymentMethod(),
                request.getAttendeeNames(),
                user);

        PaymentService gateway = gatewayResolver.resolve(request.getPaymentMethod());
        String payUrl = gateway.createPaymentUrl(order, getClientIp(httpRequest));

        return new CreatePaymentResponse(
                payUrl,
                order.getGatewayOrderCode(),
                order.getOrderId(),
                request.getPaymentMethod().name()
        );
    }

    // ── VNPay ──
    @GetMapping("/vnpay/return")
    public ResponseEntity<PaymentCallbackResult> vnpayReturn(@RequestParam Map<String, String> params) {
        PaymentService s = gatewayResolver.resolve(PaymentMethod.VNPAY);
        return ResponseEntity.ok(s.verifyReturn(params));
    }

    @GetMapping("/vnpay/ipn")
    public Map<String, String> vnpayIpn(@RequestParam Map<String, String> params) {
        PaymentService s = gatewayResolver.resolve(PaymentMethod.VNPAY);
        PaymentCallbackResult result = s.verifyIpn(params);
        Map<String, String> reply = new HashMap<>();
        if (!result.signatureValid()) {
            reply.put("RspCode", "97");
            reply.put("Message", "Invalid signature");
            return reply;
        }
        return processIpn(result, "00", "Confirm Success",
                "01", "Order not found",
                "02", "Order already confirmed",
                "99", "Unknown error");
    }

    // ── Momo ──
    @PostMapping("/momo/return")
    public ResponseEntity<PaymentCallbackResult> momoReturnPost(@RequestBody Map<String, String> body) {
        PaymentService s = gatewayResolver.resolve(PaymentMethod.MOMO);
        return ResponseEntity.ok(s.verifyReturn(body));
    }

    @GetMapping("/momo/return")
    public ResponseEntity<PaymentCallbackResult> momoReturnGet(@RequestParam Map<String, String> params) {
        PaymentService s = gatewayResolver.resolve(PaymentMethod.MOMO);
        return ResponseEntity.ok(s.verifyReturn(params));
    }

    @PostMapping("/momo/ipn")
    public ResponseEntity<Void> momoIpn(@RequestBody Map<String, String> body) {
        PaymentService s = gatewayResolver.resolve(PaymentMethod.MOMO);
        PaymentCallbackResult result = s.verifyIpn(body);
        if (!result.signatureValid()) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        processIpn(result, "OK", "OK", "OK", "OK", "OK", "OK", "OK", "OK");
        return ResponseEntity.noContent().build();
    }

    @Transactional
    protected Map<String, String> processIpn(PaymentCallbackResult result,
                                             String okCode, String okMsg,
                                             String notFoundCode, String notFoundMsg,
                                             String alreadyCode, String alreadyMsg,
                                             String errorCode, String errorMsg) {
        Map<String, String> reply = new HashMap<>();
        try {
            Order order = orderRepository.findByGatewayOrderCode(result.orderCode()).orElse(null);
            if (order == null) {
                reply.put("RspCode", notFoundCode);
                reply.put("Message", notFoundMsg);
                return reply;
            }
            if ("PAID".equals(order.getPaymentStatus())) {
                reply.put("RspCode", alreadyCode);
                reply.put("Message", alreadyMsg);
                return reply;
            }
            if (result.success()) {
                reservationService.confirmOrderPaid(order, result.providerTxnId());
            } else {
                reservationService.markOrderFailed(order);
            }
            reply.put("RspCode", okCode);
            reply.put("Message", okMsg);
        } catch (Exception e) {
            reply.put("RspCode", errorCode);
            reply.put("Message", errorMsg + ": " + e.getMessage());
        }
        return reply;
    }

    private String getClientIp(HttpServletRequest req) {
        String xf = req.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) return xf.split(",")[0].trim();
        return req.getRemoteAddr();
    }
}
