package com.example.event_management_server.controller;

import com.example.event_management_server.dto.*;
import com.example.event_management_server.exception.NotFoundException;
import com.example.event_management_server.model.Commission;
import com.example.event_management_server.model.Event;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.CommissionRepository;
import com.example.event_management_server.repository.EventRepository;
import com.example.event_management_server.repository.OrderRepository;
import com.example.event_management_server.repository.TicketRepository;
import com.example.event_management_server.repository.TicketTypeRepository;
import com.example.event_management_server.service.EventService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;
    private final EventRepository eventRepository;
    private final OrderRepository orderRepository;
    private final TicketRepository ticketRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final CommissionRepository commissionRepository;

    public EventController(EventService eventService,
                           EventRepository eventRepository,
                           OrderRepository orderRepository,
                           TicketRepository ticketRepository,
                           TicketTypeRepository ticketTypeRepository,
                           CommissionRepository commissionRepository) {
        this.eventService = eventService;
        this.eventRepository = eventRepository;
        this.orderRepository = orderRepository;
        this.ticketRepository = ticketRepository;
        this.ticketTypeRepository = ticketTypeRepository;
        this.commissionRepository = commissionRepository;
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
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false)    String sort) {

        return eventService.listPublishedEvents(categoryId, location, date, search, page, size, sort);
    }

    /**
     * Xem chi tiết một sự kiện.
     * GET /api/v1/events/{eventId}
     * Public chỉ thấy PUBLISHED. Organizer/Admin xem được DRAFT của mình.
     */
    @GetMapping("/{eventId}")
    public EventResponse getEvent(
            @PathVariable Integer eventId,
            @AuthenticationPrincipal User user) {
        return eventService.getEventById(eventId, user);
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

    /**
     * Thống kê sự kiện theo ID.
     * GET /api/v1/events/{eventId}/stats
     * Role: ORGANIZER (sự kiện của mình) hoặc ADMIN
     */
    @GetMapping("/{eventId}/stats")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public EventStatsResponse getEventStats(
            @PathVariable Integer eventId,
            @AuthenticationPrincipal User user) {

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found: " + eventId));

        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !event.getOrganizer().getId().equals(user.getId())) {
            throw new com.example.event_management_server.exception.BadRequestException("Access denied");
        }

        long ticketsSold      = ticketRepository.countByEventId(eventId);
        long ticketsAvailable = ticketTypeRepository.sumAvailableQuantityByEventId(eventId);
        java.math.BigDecimal revenue   = orderRepository.sumRevenueByEventId(eventId);
        long totalOrders      = orderRepository.countPaidOrdersByEventId(eventId);
        long checkedIn        = ticketRepository.countCheckedInByEventId(eventId);

        // Tính commission từ rate đang active
        java.math.BigDecimal commissionPct = commissionRepository
                .findFirstByIsActiveTrueOrderByEffectiveFromDesc()
                .map(Commission::getPercent)
                .orElse(java.math.BigDecimal.ZERO);

        java.math.BigDecimal commissionAmt = revenue
                .multiply(commissionPct)
                .divide(java.math.BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        java.math.BigDecimal netRevenue = revenue.subtract(commissionAmt);

        return new EventStatsResponse(
                eventId,
                event.getTitle(),
                ticketsSold,
                ticketsAvailable,
                revenue,
                commissionPct,
                commissionAmt,
                netRevenue,
                totalOrders,
                checkedIn
        );
    }
}
