package com.example.event_management_server.dto;

import java.math.BigDecimal;

public record EventStatsResponse(
        Integer eventId,
        String title,
        long totalTicketsSold,
        long totalTicketsAvailable,
        BigDecimal totalRevenue,
        BigDecimal commissionPercent,
        BigDecimal commissionAmount,
        BigDecimal netRevenue,
        long totalOrders,
        long checkedInCount
) {}
