package com.example.event_management_server.dto;

import com.example.event_management_server.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "fullName không được để trống")
        @Size(max = 100)
        String fullName,

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        String email,

        @NotBlank(message = "Password không được để trống")
        @Size(min = 6, message = "Password phải có ít nhất 6 ký tự")
        String password,

        @NotNull(message = "Role không được để trống")
        Role role,

        // Chỉ bắt buộc khi role = ORGANIZER (kiểm tra trong service)
        String phone,
        String organizationName
) {}
