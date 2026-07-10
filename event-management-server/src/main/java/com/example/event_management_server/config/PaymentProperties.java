package com.example.event_management_server.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.payment")
public class PaymentProperties {

    private String returnBaseUrl;
    private String ipnBaseUrl;
    private Vnpay vnpay = new Vnpay();
    private Momo momo = new Momo();

    public String getReturnBaseUrl() { return returnBaseUrl; }
    public void setReturnBaseUrl(String returnBaseUrl) { this.returnBaseUrl = returnBaseUrl; }

    public String getIpnBaseUrl() { return ipnBaseUrl; }
    public void setIpnBaseUrl(String ipnBaseUrl) { this.ipnBaseUrl = ipnBaseUrl; }

    public Vnpay getVnpay() { return vnpay; }
    public void setVnpay(Vnpay vnpay) { this.vnpay = vnpay; }

    public Momo getMomo() { return momo; }
    public void setMomo(Momo momo) { this.momo = momo; }

    public static class Vnpay {
        private String tmnCode;
        private String hashSecret;
        private String payUrl;
        private String apiUrl;
        private String version = "2.1.0";
        private String command = "pay";
        private String currency = "VND";
        private String locale = "vn";

        public String getTmnCode() { return tmnCode; }
        public void setTmnCode(String tmnCode) { this.tmnCode = tmnCode; }
        public String getHashSecret() { return hashSecret; }
        public void setHashSecret(String hashSecret) { this.hashSecret = hashSecret; }
        public String getPayUrl() { return payUrl; }
        public void setPayUrl(String payUrl) { this.payUrl = payUrl; }
        public String getApiUrl() { return apiUrl; }
        public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
        public String getCommand() { return command; }
        public void setCommand(String command) { this.command = command; }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
        public String getLocale() { return locale; }
        public void setLocale(String locale) { this.locale = locale; }
    }

    public static class Momo {
        private String partnerCode;
        private String accessKey;
        private String secretKey;
        private String endpoint;
        private String requestType = "payWithMethod";

        public String getPartnerCode() { return partnerCode; }
        public void setPartnerCode(String partnerCode) { this.partnerCode = partnerCode; }
        public String getAccessKey() { return accessKey; }
        public void setAccessKey(String accessKey) { this.accessKey = accessKey; }
        public String getSecretKey() { return secretKey; }
        public void setSecretKey(String secretKey) { this.secretKey = secretKey; }
        public String getEndpoint() { return endpoint; }
        public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
        public String getRequestType() { return requestType; }
        public void setRequestType(String requestType) { this.requestType = requestType; }
    }
}
