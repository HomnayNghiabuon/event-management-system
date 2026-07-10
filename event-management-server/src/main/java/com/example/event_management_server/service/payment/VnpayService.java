package com.example.event_management_server.service.payment;

import com.example.event_management_server.config.PaymentProperties;
import com.example.event_management_server.model.Order;
import com.example.event_management_server.model.PaymentMethod;
import com.example.event_management_server.model.PaymentTransaction;
import com.example.event_management_server.repository.PaymentTransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * VNPay 2.1.0 sandbox.
 *
 * Spec: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
 */
@Service
public class VnpayService implements PaymentService {

    private final PaymentProperties props;
    private final PaymentTransactionRepository txnRepository;

    public VnpayService(PaymentProperties props, PaymentTransactionRepository txnRepository) {
        this.props = props;
        this.txnRepository = txnRepository;
    }

    @Override
    public PaymentMethod method() { return PaymentMethod.VNPAY; }

    @Override
    public String createPaymentUrl(Order order, String clientIp) {
        PaymentProperties.Vnpay v = props.getVnpay();

        String orderCode = order.getGatewayOrderCode();
        BigDecimal amount = order.getTotalPrice() != null ? order.getTotalPrice() : BigDecimal.ZERO;

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", v.getVersion());
        params.put("vnp_Command", v.getCommand());
        params.put("vnp_TmnCode", v.getTmnCode());
        // VNPay yêu cầu amount * 100 (vì đơn vị là đồng-trăm)
        params.put("vnp_Amount", amount.multiply(BigDecimal.valueOf(100)).toBigInteger().toString());
        params.put("vnp_CurrCode", v.getCurrency());
        params.put("vnp_TxnRef", orderCode);
        params.put("vnp_OrderInfo", "Thanh toan don hang " + orderCode);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", v.getLocale());
        params.put("vnp_ReturnUrl", props.getReturnBaseUrl() + "/payment/return?provider=VNPAY");
        params.put("vnp_IpAddr", clientIp != null ? clientIp : "127.0.0.1");

        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss");
        fmt.setTimeZone(TimeZone.getTimeZone("Etc/GMT+7"));
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        params.put("vnp_CreateDate", fmt.format(cal.getTime()));
        cal.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", fmt.format(cal.getTime()));

        // Build hash + query
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> it = keys.iterator();
        while (it.hasNext()) {
            String k = it.next();
            String val = params.get(k);
            if (val == null || val.isEmpty()) continue;
            hashData.append(k).append('=')
                    .append(URLEncoder.encode(val, StandardCharsets.US_ASCII));
            query.append(URLEncoder.encode(k, StandardCharsets.US_ASCII)).append('=')
                    .append(URLEncoder.encode(val, StandardCharsets.US_ASCII));
            if (it.hasNext()) {
                hashData.append('&');
                query.append('&');
            }
        }

        String secureHash = HmacUtils.hmacSha512(v.getHashSecret(), hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        String payUrl = v.getPayUrl() + "?" + query;

        // Lưu transaction INIT
        PaymentTransaction tx = new PaymentTransaction();
        tx.setOrder(order);
        tx.setProvider(PaymentMethod.VNPAY);
        tx.setProviderTxnRef(orderCode);
        tx.setAmount(amount);
        tx.setCurrency(v.getCurrency());
        tx.setStatus("INIT");
        tx.setSignature(secureHash);
        tx.setRequestPayload(params.toString());
        txnRepository.save(tx);

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
        String receivedHash = params.get("vnp_SecureHash");
        Map<String, String> filtered = new HashMap<>(params);
        filtered.remove("vnp_SecureHash");
        filtered.remove("vnp_SecureHashType");

        List<String> keys = new ArrayList<>(filtered.keySet());
        Collections.sort(keys);
        StringBuilder hashData = new StringBuilder();
        Iterator<String> it = keys.iterator();
        while (it.hasNext()) {
            String k = it.next();
            String val = filtered.get(k);
            if (val == null || val.isEmpty()) continue;
            hashData.append(k).append('=')
                    .append(URLEncoder.encode(val, StandardCharsets.US_ASCII));
            if (it.hasNext()) hashData.append('&');
        }

        String calculatedHash = HmacUtils.hmacSha512(props.getVnpay().getHashSecret(), hashData.toString());
        boolean signatureValid = calculatedHash.equalsIgnoreCase(receivedHash);

        String responseCode = params.get("vnp_ResponseCode");
        String txnStatus = params.get("vnp_TransactionStatus");
        boolean success = signatureValid && "00".equals(responseCode) && "00".equals(txnStatus);

        BigDecimal amount = BigDecimal.ZERO;
        try {
            String amt = params.get("vnp_Amount");
            if (amt != null) amount = new BigDecimal(amt).divide(BigDecimal.valueOf(100));
        } catch (NumberFormatException ignored) {}

        return new PaymentCallbackResult(
                success,
                signatureValid,
                PaymentMethod.VNPAY,
                params.get("vnp_TxnRef"),
                params.get("vnp_TransactionNo"),
                amount,
                responseCode,
                params.getOrDefault("vnp_OrderInfo", ""),
                receivedHash
        );
    }
}
