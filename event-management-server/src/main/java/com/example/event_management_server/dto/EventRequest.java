package com.example.event_management_server.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record EventRequest(
        @NotBlank(message = "Tiêu đề sự kiện không được để trống")
        String title,

        String description,

        @NotNull(message = "Danh mục không được để trống")
        Integer categoryId,

        @NotBlank(message = "Địa điểm không được để trống")
        String location,

        @NotNull(message = "Ngày tổ chức không được để trống")
        @FutureOrPresent(message = "Ngày tổ chức phải là hôm nay hoặc trong tương lai")
        LocalDate eventDate,

        @NotNull(message = "Giờ bắt đầu không được để trống")
        LocalTime startTime,

        @NotNull(message = "Giờ kết thúc không được để trống")
        LocalTime endTime,

        String thumbnail,

        @NotEmpty(message = "Phải có ít nhất một loại vé")
        @Valid
        List<TicketTypeRequest> ticketTypes
) {}
