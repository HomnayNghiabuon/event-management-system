package com.example.event_management_server.controller;

import com.example.event_management_server.model.Event;
import com.example.event_management_server.model.Order;
import com.example.event_management_server.model.Ticket;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.EventRepository;
import com.example.event_management_server.repository.OrderRepository;
import com.example.event_management_server.repository.TicketRepository;
import com.example.event_management_server.service.QrCodeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    private final OrderRepository orderRepository;
    private final QrCodeService qrCodeService;

    public TicketController(TicketRepository ticketRepository,
                            EventRepository eventRepository,
                            OrderRepository orderRepository,
                            QrCodeService qrCodeService) {
        this.ticketRepository = ticketRepository;
        this.eventRepository = eventRepository;
        this.orderRepository = orderRepository;
        this.qrCodeService = qrCodeService;
    }

    /**
     * Attendee xem danh sách vé của mình (kèm QR code string).
     * GET /api/v1/tickets/my
     */
    @GetMapping("/tickets/my")
    public List<MyTicketInfo> getMyTickets(@AuthenticationPrincipal User user) {
        return ticketRepository.findByAttendee_Id(user.getId()).stream()
                .map(MyTicketInfo::from)
                .toList();
    }

    /**
     * Lấy ảnh QR code PNG theo mã QR của vé.
     * GET /api/v1/tickets/{qrCode}/qr-image
     * Chỉ chủ sở hữu vé hoặc organizer/admin của sự kiện đó mới được xem.
     */
    @GetMapping(value = "/tickets/{qrCode}/qr-image", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQrImage(
            @PathVariable String qrCode,
            @AuthenticationPrincipal User user
    ) {
        Ticket ticket = ticketRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "QR code không hợp lệ"));

        boolean isAdmin = isAdmin(user);
        boolean isOwner = ticket.getAttendee() != null && ticket.getAttendee().getId().equals(user.getId());
        boolean isOrganizer = false;
        if (!isAdmin && !isOwner) {
            Event event = ticket.getOrderDetail().getTicketType().getEvent();
            isOrganizer = event.getOrganizer() != null && event.getOrganizer().getId().equals(user.getId());
        }

        if (!isAdmin && !isOwner && !isOrganizer) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem QR code này");
        }

        // Vé đã bị vô hiệu hóa (đơn hàng bị hủy)
        if (Boolean.FALSE.equals(ticket.getIsValid())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Vé đã bị hủy và không còn hiệu lực");
        }

        byte[] png = qrCodeService.generatePng(qrCode);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(png);
    }

    /**
     * Check-in người tham dự bằng QR code string.
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

        if (Boolean.FALSE.equals(ticket.getIsValid())) {
            return new CheckinResponse(false, "Vé đã bị hủy, không thể check-in", null, ticket.getAttendeeName());
        }

        if (Boolean.TRUE.equals(ticket.getCheckinStatus())) {
            return new CheckinResponse(false, "Vé đã được check-in trước đó", ticket.getCheckinTime(), ticket.getAttendeeName());
        }

        boolean isAdmin = isAdmin(user);
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

    /**
     * Organizer xem danh sách attendees của sự kiện.
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

        boolean isAdmin = isAdmin(user);
        if (!isAdmin && (event.getOrganizer() == null || !event.getOrganizer().getId().equals(user.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem thông tin này");
        }

        return ticketRepository.findByEventId(eventId).stream()
                .map(AttendeeInfo::from)
                .toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private boolean isAdmin(User user) {
        return user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    // ── inner records ─────────────────────────────────────────────────────────

    record MyTicketInfo(
            Integer ticketId,
            String qrCode,
            String attendeeName,
            Boolean checkinStatus,
            Instant checkinTime,
            Boolean isValid,
            String eventTitle,
            String ticketTypeName,
            String qrImageUrl
    ) {
        static MyTicketInfo from(Ticket t) {
            String eventTitle = null;
            String ticketTypeName = null;
            if (t.getOrderDetail() != null && t.getOrderDetail().getTicketType() != null) {
                ticketTypeName = t.getOrderDetail().getTicketType().getName();
                if (t.getOrderDetail().getTicketType().getEvent() != null) {
                    eventTitle = t.getOrderDetail().getTicketType().getEvent().getTitle();
                }
            }
            return new MyTicketInfo(
                    t.getTicketId(),
                    t.getQrCode(),
                    t.getAttendeeName(),
                    t.getCheckinStatus(),
                    t.getCheckinTime(),
                    t.getIsValid(),
                    eventTitle,
                    ticketTypeName,
                    "/api/v1/tickets/" + t.getQrCode() + "/qr-image"
            );
        }
    }

    record AttendeeInfo(
            Integer ticketId,
            String attendeeName,
            String qrCode,
            Boolean checkinStatus,
            Instant checkinTime,
            Boolean isValid,
            String ticketTypeName
    ) {
        static AttendeeInfo from(Ticket t) {
            return new AttendeeInfo(
                    t.getTicketId(),
                    t.getAttendeeName(),
                    t.getQrCode(),
                    t.getCheckinStatus(),
                    t.getCheckinTime(),
                    t.getIsValid(),
                    t.getOrderDetail() != null ? t.getOrderDetail().getTicketType().getName() : null
            );
        }
    }

    record CheckinResponse(Boolean success, String message, Instant checkinTime, String attendeeName) {}
}
