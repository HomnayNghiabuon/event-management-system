package com.example.event_management_server.controller;

import com.example.event_management_server.dto.*;
import com.example.event_management_server.model.User;
import com.example.event_management_server.service.EventService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST Controller quản lý sự kiện.
 *
 * Phân quyền theo role:
 *   PUBLIC     → GET /events, GET /events/{id}
 *   ORGANIZER  → POST, PUT, PATCH /events
 *   ORGANIZER hoặc ADMIN → DELETE /events/{id}
 */
@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // PUBLIC

    /**
     * Tìm kiếm / lọc danh sách sự kiện đã publish.
     * GET /api/v1/events?categoryId=1&location=HCM&date=2025-06-15&page=0&size=10&sort=date
     */
    @GetMapping
    public Page<EventSummaryResponse> listEvents(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false)    String sort) {

        return eventService.listPublishedEvents(categoryId, location, date, page, size, sort);
    }

    /**
     * Xem chi tiết một sự kiện.
     * GET /api/v1/events/{eventId}
     */
    @GetMapping("/{eventId}")
    public EventResponse getEvent(@PathVariable Integer eventId) {
        return eventService.getEventById(eventId);
    }

    // ORGANIZER

    /**
     * Tạo sự kiện mới (kèm loại vé).
     * POST /api/v1/events
     * Role: ORGANIZER
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ORGANIZER')")
    public EventResponse createEvent(
            @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal User organizer) {

        return eventService.createEvent(request, organizer);
    }

    /**
     * Cập nhật sự kiện (chỉ DRAFT mới chỉnh được).
     * PUT /api/v1/events/{eventId}
     * Role: ORGANIZER (sự kiện của mình)
     */
    @PutMapping("/{eventId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public EventResponse updateEvent(
            @PathVariable Integer eventId,
            @Valid @RequestBody EventRequest request,
            @AuthenticationPrincipal User organizer) {

        return eventService.updateEvent(eventId, request, organizer);
    }

    /**
     * Publish hoặc unpublish sự kiện.
     * PATCH /api/v1/events/{eventId}/publish
     * Role: ORGANIZER (sự kiện của mình)
     */
    @PatchMapping("/{eventId}/publish")
    @PreAuthorize("hasRole('ORGANIZER')")
    public EventResponse publishEvent(
            @PathVariable Integer eventId,
            @Valid @RequestBody PublishRequest request,
            @AuthenticationPrincipal User organizer) {

        return eventService.publishEvent(eventId, request.publish(), organizer);
    }

    /**
     * Xoá sự kiện.
     * DELETE /api/v1/events/{eventId}
     * Role: ORGANIZER (sự kiện của mình) hoặc ADMIN (bất kỳ)
     */
    @DeleteMapping("/{eventId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public void deleteEvent(
            @PathVariable Integer eventId,
            @AuthenticationPrincipal User user) {

        eventService.deleteEvent(eventId, user);
    }

    // ORGANIZER - quan ly su kien cua minh

    /**
     * Lấy danh sách sự kiện do organizer hiện tại tạo.
     * GET /api/v1/events/my
     * Role: ORGANIZER
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('ORGANIZER')")
    public Page<EventSummaryResponse> getMyEvents(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User organizer) {

        return eventService.getMyEvents(organizer, page, size);
    }
}
