package com.example.event_management_server.dto;

import java.math.BigDecimal;

public record EventStatsResponse(
        Integer eventId,
        String title,
        long totalTicketsSold,
        long totalTicketsAvailable,
        BigDecimal totalRevenue,
        long totalOrders,
        long checkedInCount
) {}
