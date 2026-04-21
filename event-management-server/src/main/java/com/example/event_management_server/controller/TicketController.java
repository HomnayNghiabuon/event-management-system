package com.example.event_management_server.controller;

import com.example.event_management_server.model.Event;
import com.example.event_management_server.model.Ticket;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.EventRepository;
import com.example.event_management_server.repository.TicketRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Transactional
public class TicketController {

    private final TicketRepository ticketRepository;
    private final EventRepository eventRepository;

    public TicketController(TicketRepository ticketRepository, EventRepository eventRepository) {
        this.ticketRepository = ticketRepository;
        this.eventRepository = eventRepository;
    }

    /**
     * Organizer xem danh sách vé đã bán của sự kiện.
     * GET /api/v1/events/{eventId}/attendees
     */
    @GetMapping("/events/{eventId}/attendees")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public List<AttendeeInfo> getAttendees(
            @PathVariable Integer eventId,
            @AuthenticationPrincipal User user
    ) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sự kiện không tồn tại"));

        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && (event.getOrganizer() == null || !event.getOrganizer().getId().equals(user.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem thông tin này");
        }

        return ticketRepository.findByEventId(eventId).stream()
                .map(AttendeeInfo::from)
                .toList();
    }

    /**
     * Check-in người tham dự bằng QR code.
     * POST /api/v1/tickets/{qrCode}/checkin
     */
    @PostMapping("/tickets/{qrCode}/checkin")
    @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
    public CheckinResponse checkin(
            @PathVariable String qrCode,
            @AuthenticationPrincipal User user
    ) {
        Ticket ticket = ticketRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "QR code không hợp lệ"));

        if (Boolean.TRUE.equals(ticket.getCheckinStatus())) {
            return new CheckinResponse(false, "Vé đã được check-in trước đó", ticket.getCheckinTime(), ticket.getAttendeeName());
        }

        // Kiểm tra organizer có sở hữu sự kiện này không
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            Event event = ticket.getOrderDetail().getTicketType().getEvent();
            if (event.getOrganizer() == null || !event.getOrganizer().getId().equals(user.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền check-in cho sự kiện này");
            }
        }

        ticket.setCheckinStatus(true);
        ticket.setCheckinTime(Instant.now());
        ticketRepository.save(ticket);

        return new CheckinResponse(true, "Check-in thành công", ticket.getCheckinTime(), ticket.getAttendeeName());
    }

    record AttendeeInfo(
            Integer ticketId,
            String attendeeName,
            String qrCode,
            Boolean checkinStatus,
            Instant checkinTime,
            String ticketTypeName
    ) {
        static AttendeeInfo from(Ticket t) {
            return new AttendeeInfo(
                    t.getTicketId(),
                    t.getAttendeeName(),
                    t.getQrCode(),
                    t.getCheckinStatus(),
                    t.getCheckinTime(),
                    t.getOrderDetail() != null ? t.getOrderDetail().getTicketType().getName() : null
            );
        }
    }

    record CheckinResponse(Boolean success, String message, Instant checkinTime, String attendeeName) {}
}
