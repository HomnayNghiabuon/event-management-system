package com.example.event_management_server.dto;

public record RegisterResponse(
        String userId,
        String email,
        String role,
        String token
) {}
