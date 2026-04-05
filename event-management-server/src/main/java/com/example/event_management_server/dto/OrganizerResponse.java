package com.example.event_management_server.dto;

import com.example.event_management_server.model.User;

import java.time.LocalDateTime;

/**
 * DTO thông tin Organizer trả về cho Admin.
 */
public record OrganizerResponse(
        String organizerId,
        String fullName,
        String email,
        String phone,
        String organizationName,
        LocalDateTime createdAt
) {
    public static OrganizerResponse from(User u) {
        return new OrganizerResponse(
                u.getId().toString(),
                u.getFullName(),
                u.getEmail(),
                u.getPhone(),
                u.getOrganizationName(),
                u.getCreatedAt()
        );
    }
}
