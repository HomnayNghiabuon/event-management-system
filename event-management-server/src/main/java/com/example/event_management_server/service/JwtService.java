package com.example.event_management_server.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secretKey;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpiration;

    /** Tạo access token (hết hạn theo jwtExpiration, mặc định 1 giờ). */
    public String generateToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, jwtExpiration);
    }

    /** Tạo refresh token (hết hạn theo refreshExpiration, mặc định 7 ngày). */
    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration);
    }

    /**
     * Xây dựng JWT với claims, subject (email), issuedAt, expiration và ký bằng HMAC-SHA256.
     * jti (JWT ID) là UUID ngẫu nhiên để mỗi token là duy nhất ngay cả khi cùng user.
     */
    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        extraClaims.put("jti", UUID.randomUUID().toString()); // JWT ID duy nhất chống replay attack
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername()) // subject = email của user
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey()) // ký bằng HMAC-SHA256 với secret key
                .compact();
    }

    /** Lấy email (subject) từ JWT token. Ném exception nếu token không hợp lệ hoặc hết hạn. */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Generic method lấy bất kỳ claim nào từ token thông qua Function resolver. */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    /** Kiểm tra token hợp lệ: subject phải khớp với email user VÀ token chưa hết hạn. */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    /**
     * Parse và verify chữ ký JWT. Ném JwtException nếu:
     * - Chữ ký không hợp lệ (bị giả mạo)
     * - Token đã hết hạn
     * - Token bị malformed
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Giải mã Base64 secret từ application.yaml và tạo HMAC-SHA key. */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey); // secret phải là Base64-encoded string
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
