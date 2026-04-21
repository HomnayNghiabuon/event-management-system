package com.example.event_management_server.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record CommissionRequest(
        BigDecimal percent,
        Instant effectiveFrom,
        Boolean isActive
) {}
