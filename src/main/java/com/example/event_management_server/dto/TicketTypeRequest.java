package com.example.event_management_server.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record TicketTypeRequest(
        @NotBlank(message = "Tên loại vé không được để trống")
        String name,

        @NotNull(message = "Giá vé không được để trống")
        @Min(value = 0, message = "Giá vé phải >= 0")
        BigDecimal price,

        @NotNull(message = "Số lượng vé không được để trống")
        @Min(value = 1, message = "Số lượng vé phải >= 1")
        Integer quantity
) {}
