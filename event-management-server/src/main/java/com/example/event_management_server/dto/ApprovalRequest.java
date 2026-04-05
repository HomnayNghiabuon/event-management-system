package com.example.event_management_server.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request body cho PATCH /admin/events/{eventId}/approval
 * action: APPROVE hoặc REJECT
 * reason: bắt buộc khi action = REJECT
 */
public record ApprovalRequest(
        @NotNull(message = "action không được để trống")
        String action,   // APPROVE | REJECT

        String reason    // nullable, dùng khi REJECT
) {}
