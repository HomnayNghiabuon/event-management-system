package com.example.event_management_server.controller;

import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.OrderCommissionRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

/**
 * Báo cáo doanh thu / hoa hồng dựa trên bảng order_commissions.
 * Mỗi Order PAID có 1 row snapshot ở đó (xem CommissionCalculatorService).
 */
@RestController
@RequestMapping("/api/v1")
public class RevenueController {

    private final OrderCommissionRepository orderCommissionRepository;

    public RevenueController(OrderCommissionRepository orderCommissionRepository) {
        this.orderCommissionRepository = orderCommissionRepository;
    }

    public record RevenueSummary(
            BigDecimal grossAmount,
            BigDecimal commissionAmount,
            BigDecimal netAmount,
            Instant from,
            Instant to
    ) {}

    /** Doanh thu của Organizer hiện tại (mặc định 30 ngày gần nhất). */
    @GetMapping("/organizer/revenue")
    @PreAuthorize("hasRole('ORGANIZER')")
    public RevenueSummary organizerRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal User user) {
        Instant[] range = resolveRange(from, to);
        return new RevenueSummary(
                orderCommissionRepository.sumGrossByOrganizerBetween(user.getId(), range[0], range[1]),
                orderCommissionRepository.sumCommissionByOrganizerBetween(user.getId(), range[0], range[1]),
                orderCommissionRepository.sumNetByOrganizerBetween(user.getId(), range[0], range[1]),
                range[0], range[1]
        );
    }

    /** Doanh thu hoa hồng toàn hệ thống (Admin). */
    @GetMapping("/admin/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public RevenueSummary adminRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Instant[] range = resolveRange(from, to);
        BigDecimal commission = orderCommissionRepository.sumCommissionBetween(range[0], range[1]);
        // Admin "gross" = tổng commission (vì đây là doanh thu của platform)
        return new RevenueSummary(commission, commission, BigDecimal.ZERO, range[0], range[1]);
    }

    private Instant[] resolveRange(LocalDate from, LocalDate to) {
        LocalDate end = to != null ? to : LocalDate.now();
        LocalDate start = from != null ? from : end.minusDays(30);
        return new Instant[]{
                start.atStartOfDay().toInstant(ZoneOffset.UTC),
                end.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC) // exclusive end
        };
    }
}
