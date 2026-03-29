package com.example.event_management_server.dto;

import jakarta.validation.constraints.NotNull;

public record PublishRequest(
        @NotNull(message = "Trường publish không được để trống")
        Boolean publish
) {}
