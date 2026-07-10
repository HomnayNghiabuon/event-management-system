package com.example.event_management_server.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UserInfo user
) {
    public record UserInfo(
            String userId,
            String fullName,
            String email,
            String role
    ) {}
}
