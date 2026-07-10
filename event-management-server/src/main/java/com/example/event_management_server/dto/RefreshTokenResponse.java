package com.example.event_management_server.dto;

public record RefreshTokenResponse(
        String accessToken,
        long expiresIn
) {}
