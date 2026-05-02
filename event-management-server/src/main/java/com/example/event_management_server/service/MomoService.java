package com.example.event_management_server.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class MomoService {

    @Value("${momo.accessKey}")
    private String accessKey;

    @Value("${momo.secretKey}")
    private String secretKey;

    @Value("${momo.partnerCode}")
    private String partnerCode;

    @Value("${momo.endpoint}")
    private String endpoint;

    @Value("${momo.redirectUrl}")
    private String redirectUrl;

    @Value("${momo.ipnUrl}")
    private String ipnUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String createPayment(String amount, String orderId, String orderInfo) {

        try {
            String requestId = orderId + System.currentTimeMillis();
            String requestType = "payWithMethod";
            String extraData = "";

            // 🔥 RAW SIGNATURE
            String rawSignature = "accessKey=" + accessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + ipnUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + partnerCode +
                    "&redirectUrl=" + redirectUrl +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType;

            String signature = hmacSHA256(rawSignature, secretKey);

            // 🔥 REQUEST BODY
            String json = """
            {
                "partnerCode": "%s",
                "requestId": "%s",
                "amount": "%s",
                "orderId": "%s",
                "orderInfo": "%s",
                "redirectUrl": "%s",
                "ipnUrl": "%s",
                "requestType": "%s",
                "extraData": "%s",
                "signature": "%s",
                "lang": "vi"
            }
            """.formatted(
                    partnerCode, requestId, amount, orderId,
                    orderInfo, redirectUrl, ipnUrl,
                    requestType, extraData, signature
            );

            HttpClient client = HttpClient.newHttpClient();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response =
                    client.send(request, HttpResponse.BodyHandlers.ofString());

            String body = response.body();

            // 🔥 LOG FULL RESPONSE (QUAN TRỌNG)
            System.out.println("🔥 MOMO RESPONSE: " + body);

            // 🔥 SAFE PARSE
            JsonNode root;

            try {
                root = objectMapper.readTree(body);
            } catch (Exception e) {
                throw new RuntimeException("MoMo trả không phải JSON: " + body);
            }

            // 🔥 CHECK RESULT CODE
            int resultCode = root.has("resultCode") ? root.get("resultCode").asInt() : -1;

            if (resultCode != 0) {
                throw new RuntimeException("MoMo error response: " + body);
            }

            // 🔥 CHECK PAY URL
            if (!root.has("payUrl")) {
                throw new RuntimeException("MoMo không trả payUrl: " + body);
            }

            return root.get("payUrl").asText();

        } catch (Exception e) {
            throw new RuntimeException("MoMo createPayment failed: " + e.getMessage());
        }
    }

    private String hmacSHA256(String data, String key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));

        byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder hex = new StringBuilder();
        for (byte b : raw) {
            String s = Integer.toHexString(0xff & b);
            if (s.length() == 1) hex.append('0');
            hex.append(s);
        }
        return hex.toString();
    }
}