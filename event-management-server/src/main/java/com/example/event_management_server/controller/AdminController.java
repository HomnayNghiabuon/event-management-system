package com.example.event_management_server.controller;

import com.example.event_management_server.dto.*;
import com.example.event_management_server.model.User;
import com.example.event_management_server.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller quản lý Admin.
 *
 * Tất cả endpoints yêu cầu role ADMIN.
 *   - GET/PATCH /admin/events   → Duyệt sự kiện
 *   - CRUD      /admin/organizers → Quản lý Organizer
 */
@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // EVENT APPROVAL

    /**
     * Lấy danh sách sự kiện (có thể lọc theo approvalStatus).
     * GET /api/v1/admin/events?approvalStatus=PENDING&page=0&size=10
     */
    @GetMapping("/events")
    public Page<AdminEventSummaryResponse> getEvents(
            @RequestParam(required = false) String approvalStatus,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        return adminService.getEvents(approvalStatus, page, size);
    }

    /**
     * Duyệt hoặc từ chối sự kiện.
     * PATCH /api/v1/admin/events/{eventId}/approval
     * Body: { "action": "APPROVE" } hoặc { "action": "REJECT", "reason": "..." }
     */
    @PatchMapping("/events/{eventId}/approval")
    public AdminEventSummaryResponse reviewEvent(
            @PathVariable Integer eventId,
            @Valid @RequestBody ApprovalRequest request,
            @AuthenticationPrincipal User admin) {

        return adminService.reviewEvent(eventId, request, admin);
    }

    // ORGANIZER MANAGEMENT

    /**
     * Danh sách Organizer, hỗ trợ tìm kiếm.
     * GET /api/v1/admin/organizers?search=keyword&page=0&size=10
     */
    @GetMapping("/organizers")
    public Page<OrganizerResponse> getOrganizers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        return adminService.getOrganizers(search, page, size);
    }

    /**
     * Chi tiết một Organizer.
     * GET /api/v1/admin/organizers/{organizerId}
     */
    @GetMapping("/organizers/{organizerId}")
    public OrganizerResponse getOrganizer(@PathVariable UUID organizerId) {
        return adminService.getOrganizerById(organizerId);
    }

    /**
     * Tạo Organizer mới.
     * POST /api/v1/admin/organizers
     */
    @PostMapping("/organizers")
    @ResponseStatus(HttpStatus.CREATED)
    public OrganizerResponse createOrganizer(@Valid @RequestBody OrganizerRequest request) {
        return adminService.createOrganizer(request);
    }

    /**
     * Cập nhật Organizer.
     * PUT /api/v1/admin/organizers/{organizerId}
     */
    @PutMapping("/organizers/{organizerId}")
    public OrganizerResponse updateOrganizer(
            @PathVariable UUID organizerId,
            @Valid @RequestBody OrganizerRequest request) {

        return adminService.updateOrganizer(organizerId, request);
    }

    /**
     * Xóa Organizer.
     * DELETE /api/v1/admin/organizers/{organizerId}
     */
    @DeleteMapping("/organizers/{organizerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrganizer(@PathVariable UUID organizerId) {
        adminService.deleteOrganizer(organizerId);
    }
}
