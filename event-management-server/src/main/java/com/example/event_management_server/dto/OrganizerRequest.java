package com.example.event_management_server.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body cho POST/PUT /admin/organizers
 */
public record OrganizerRequest(
        @NotBlank(message = "fullName không được để trống")
        String fullName,

        @NotBlank(message = "email không được để trống")
        @Email(message = "email không hợp lệ")
        String email,

        String password,      // nullable khi update

        String phone,

        String organizationName
) {}
