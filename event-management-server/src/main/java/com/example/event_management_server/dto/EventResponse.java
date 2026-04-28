package com.example.event_management_server.dto;

import com.example.event_management_server.model.Event;
import com.example.event_management_server.model.TicketType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * DTO chi tiết sự kiện (GET /events/{id}, POST /events, PUT /events/{id}).
 */
public record EventResponse(
        Integer eventId,
        String title,
        String description,
        String category,
        Integer categoryId,
        String location,
        Double latitude,
        Double longitude,
        String addressDetail,
        LocalDate eventDate,
        LocalTime startTime,
        LocalTime endTime,
        String thumbnail,
        BigDecimal minPrice,
        String status,
        String approvalStatus,
        String rejectionReason,
        OrganizerInfo organizer,
        List<TicketTypeResponse> ticketTypes,
        Instant createdAt,
        Instant updatedAt
) {
    public record OrganizerInfo(String organizerId, String name) {}

    public static EventResponse from(Event e, List<TicketType> ticketTypes) {
        return new EventResponse(
                e.getEventId(),
                e.getTitle(),
                e.getDescription(),
                e.getCategory() != null ? e.getCategory().getName() : null,
                e.getCategory() != null ? e.getCategory().getCategoryId() : null,
                e.getLocation(),
                e.getLatitude(),
                e.getLongitude(),
                e.getAddressDetail(),
                e.getEventDate(),
                e.getStartTime(),
                e.getEndTime(),
                e.getThumbnail(),
                e.getMinPrice(),
                e.getStatus(),
                e.getApprovalStatus(),
                e.getRejectionReason(),
                e.getOrganizer() != null
                        ? new OrganizerInfo(e.getOrganizer().getId().toString(), e.getOrganizer().getFullName())
                        : null,
                ticketTypes.stream().map(TicketTypeResponse::from).toList(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
