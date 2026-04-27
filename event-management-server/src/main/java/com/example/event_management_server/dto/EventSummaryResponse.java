package com.example.event_management_server.dto;

import com.example.event_management_server.model.Event;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO dùng trong danh sách sự kiện (GET /events).
 */
public record EventSummaryResponse(
        Integer eventId,
        String title,
        String category,
        String location,
        LocalDate eventDate,
        LocalTime startTime,
        LocalTime endTime,
        String thumbnail,
        BigDecimal minPrice,
        String status,
        String approvalStatus,
        Instant createdAt
) {
    public static EventSummaryResponse from(Event e) {
        return new EventSummaryResponse(
                e.getEventId(),
                e.getTitle(),
                e.getCategory() != null ? e.getCategory().getName() : null,
                e.getLocation(),
                e.getEventDate(),
                e.getStartTime(),
                e.getEndTime(),
                e.getThumbnail(),
                e.getMinPrice(),
                e.getStatus(),
                e.getApprovalStatus(),
                e.getCreatedAt()
        );
    }
}
