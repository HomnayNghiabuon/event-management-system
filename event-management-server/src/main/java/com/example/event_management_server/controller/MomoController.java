package com.example.event_management_server.controller;

import com.example.event_management_server.service.MomoService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment/momo")
public class MomoController {

    private final MomoService momoService;

    public MomoController(MomoService momoService) {
        this.momoService = momoService;
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> req) {

        String amount = req.get("amount").toString();
        String orderId = req.get("orderId").toString();
        String orderInfo = req.get("orderInfo").toString();

        String payUrl = momoService.createPayment(amount, orderId, orderInfo);

        return ResponseEntity.ok(Map.of(
                "payUrl", payUrl
        ));
    }
}