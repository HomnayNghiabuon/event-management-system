package com.example.event_management_server.dto;

public record RegisterResponse(
        String userId,
        String fullName,
        String email,
        String role,
        String accessToken,
        String refreshToken
) {}
