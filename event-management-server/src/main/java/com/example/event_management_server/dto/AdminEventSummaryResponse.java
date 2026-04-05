package com.example.event_management_server.dto;

import com.example.event_management_server.model.Event;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO tóm tắt sự kiện cho Admin (bao gồm thông tin duyệt).
 */
public record AdminEventSummaryResponse(
        Integer eventId,
        String title,
        String location,
        LocalDate eventDate,
        BigDecimal minPrice,
        String status,
        String approvalStatus,
        String rejectionReason,
        OrganizerInfo organizer,
        Instant createdAt,
        Instant reviewedAt
) {
    public record OrganizerInfo(String organizerId, String name, String email) {}

    public static AdminEventSummaryResponse from(Event e) {
        OrganizerInfo org = e.getOrganizer() != null
                ? new OrganizerInfo(
                        e.getOrganizer().getId().toString(),
                        e.getOrganizer().getFullName(),
                        e.getOrganizer().getEmail())
                : null;

        return new AdminEventSummaryResponse(
                e.getEventId(),
                e.getTitle(),
                e.getLocation(),
                e.getEventDate(),
                e.getMinPrice(),
                e.getStatus(),
                e.getApprovalStatus(),
                e.getRejectionReason(),
                org,
                e.getCreatedAt(),
                e.getReviewedAt()
        );
    }
}
