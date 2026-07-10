package com.example.event_management_server.service.payment;

import com.example.event_management_server.config.PaymentProperties;
import com.example.event_management_server.model.Order;
import com.example.event_management_server.model.PaymentMethod;
import com.example.event_management_server.model.PaymentTransaction;
import com.example.event_management_server.repository.PaymentTransactionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Momo OneTime Payment (captureWallet) — sandbox.
 * Spec: https://developers.momo.vn/v3/vi/docs/payment/onetime/
 */
@Service
public class MomoService implements PaymentService {

    private final PaymentProperties props;
    private final PaymentTransactionRepository txnRepository;
    private final ObjectMapper mapper = new ObjectMapper();
    private final RestTemplate http = new RestTemplate();

    public MomoService(PaymentProperties props, PaymentTransactionRepository txnRepository) {
        this.props = props;
        this.txnRepository = txnRepository;
    }

    @Override
    public PaymentMethod method() { return PaymentMethod.MOMO; }

    @Override
    public String createPaymentUrl(Order order, String clientIp) {
        PaymentProperties.Momo m = props.getMomo();
        String orderCode = order.getGatewayOrderCode();
        long amount = order.getTotalPrice() != null ? order.getTotalPrice().longValueExact() : 0L;

        String requestId = orderCode + "-" + System.currentTimeMillis();
        String orderInfo = "Thanh toan don hang " + orderCode;
        String redirectUrl = props.getReturnBaseUrl() + "/payment/return?provider=MOMO";
        String ipnUrl = props.getIpnBaseUrl() + "/api/v1/payments/momo/ipn";
        String extraData = "";

        // Raw signature theo doc Momo (key sắp xếp theo thứ tự alphabet, đã ghi sẵn dưới)
        String raw = "accessKey=" + m.getAccessKey()
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + ipnUrl
                + "&orderId=" + orderCode
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + m.getPartnerCode()
                + "&redirectUrl=" + redirectUrl
                + "&requestId=" + requestId
                + "&requestType=" + m.getRequestType();
        String signature = HmacUtils.hmacSha256(m.getSecretKey(), raw);

        Map<String, Object> body = new HashMap<>();
        body.put("partnerCode", m.getPartnerCode());
        body.put("partnerName", "Event Management");
        body.put("storeId", "EventManagementStore");
        body.put("requestId", requestId);
        body.put("amount", amount);
        body.put("orderId", orderCode);
        body.put("orderInfo", orderInfo);
        body.put("redirectUrl", redirectUrl);
        body.put("ipnUrl", ipnUrl);
        body.put("lang", "vi");
        body.put("extraData", extraData);
        body.put("requestType", m.getRequestType());
        body.put("signature", signature);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

        String payUrl = null;
        String response;
        try {
            response = http.postForObject(m.getEndpoint(), req, String.class);
            JsonNode json = mapper.readTree(response);
            payUrl = json.path("payUrl").asText(null);
        } catch (Exception e) {
            response = "ERROR: " + e.getMessage();
        }

        PaymentTransaction tx = new PaymentTransaction();
        tx.setOrder(order);
        tx.setProvider(PaymentMethod.MOMO);
        tx.setProviderTxnRef(orderCode);
        tx.setAmount(BigDecimal.valueOf(amount));
        tx.setCurrency("VND");
        tx.setStatus(payUrl != null ? "INIT" : "FAIL");
        tx.setSignature(signature);
        tx.setRequestPayload(body.toString());
        tx.setResponsePayload(response);
        txnRepository.save(tx);

        if (payUrl == null) {
            throw new IllegalStateException("Momo không trả về payUrl: " + response);
        }
        return payUrl;
    }

    @Override
    public PaymentCallbackResult verifyReturn(Map<String, String> params) {
        return verify(params);
    }

    @Override
    public PaymentCallbackResult verifyIpn(Map<String, String> params) {
        return verify(params);
    }

    private PaymentCallbackResult verify(Map<String, String> params) {
        PaymentProperties.Momo m = props.getMomo();
        String received = params.getOrDefault("signature", "");

        String raw = "accessKey=" + m.getAccessKey()
                + "&amount=" + params.getOrDefault("amount", "")
                + "&extraData=" + params.getOrDefault("extraData", "")
                + "&message=" + params.getOrDefault("message", "")
                + "&orderId=" + params.getOrDefault("orderId", "")
                + "&orderInfo=" + params.getOrDefault("orderInfo", "")
                + "&orderType=" + params.getOrDefault("orderType", "")
                + "&partnerCode=" + params.getOrDefault("partnerCode", "")
                + "&payType=" + params.getOrDefault("payType", "")
                + "&requestId=" + params.getOrDefault("requestId", "")
                + "&responseTime=" + params.getOrDefault("responseTime", "")
                + "&resultCode=" + params.getOrDefault("resultCode", "")
                + "&transId=" + params.getOrDefault("transId", "");

        String calculated = HmacUtils.hmacSha256(m.getSecretKey(), raw);
        boolean signatureValid = calculated.equalsIgnoreCase(received);

        String resultCode = params.getOrDefault("resultCode", "");
        boolean success = signatureValid && "0".equals(resultCode);

        BigDecimal amount = BigDecimal.ZERO;
        try {
            String amt = params.get("amount");
            if (amt != null) amount = new BigDecimal(amt);
        } catch (NumberFormatException ignored) {}

        return new PaymentCallbackResult(
                success,
                signatureValid,
                PaymentMethod.MOMO,
                params.get("orderId"),
                params.get("transId"),
                amount,
                resultCode,
                params.getOrDefault("message", ""),
                received
        );
    }
}
