package com.example.event_management_server.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EmailNotifyRequest(
        @NotBlank(message = "Tiêu đề không được để trống")
        @Size(max = 255)
        String subject,

        @NotBlank(message = "Nội dung không được để trống")
        String message
) {}
