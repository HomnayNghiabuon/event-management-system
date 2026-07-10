package com.example.event_management_server.service.payment;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public final class HmacUtils {

    private HmacUtils() {}

    public static String hmacSha512(String key, String data) {
        return hmac("HmacSHA512", key, data);
    }

    public static String hmacSha256(String key, String data) {
        return hmac("HmacSHA256", key, data);
    }

    private static String hmac(String algo, String key, String data) {
        if (key == null || key.isEmpty()) {
            throw new IllegalStateException(
                    "HMAC " + algo + " thất bại: key rỗng. "
                  + "Kiểm tra .env đã set VNPAY_HASH_SECRET / MOMO_SECRET_KEY chưa.");
        }
        try {
            Mac mac = Mac.getInstance(algo);
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), algo));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("HMAC calculation failed: " + algo, e);
        }
    }
}
