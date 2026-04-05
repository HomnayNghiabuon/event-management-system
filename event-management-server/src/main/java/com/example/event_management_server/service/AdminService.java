package com.example.event_management_server.service;

import com.example.event_management_server.dto.*;
import com.example.event_management_server.model.Event;
import com.example.event_management_server.model.Role;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.EventRepository;
import com.example.event_management_server.repository.TicketTypeRepository;
import com.example.event_management_server.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class AdminService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(EventRepository eventRepository,
                        UserRepository userRepository,
                        TicketTypeRepository ticketTypeRepository,
                        PasswordEncoder passwordEncoder) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.ticketTypeRepository = ticketTypeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // EVENT APPROVAL

    /**
     * Lấy danh sách tất cả sự kiện, có thể lọc theo approvalStatus.
     * GET /admin/events?approvalStatus=PENDING
     */
    @Transactional(readOnly = true)
    public Page<AdminEventSummaryResponse> getEvents(String approvalStatus, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return eventRepository.findByApprovalStatus(approvalStatus, pageable)
                .map(AdminEventSummaryResponse::from);
    }

    /**
     * Admin duyệt hoặc từ chối sự kiện.
     * PATCH /admin/events/{eventId}/approval
     * action: APPROVE | REJECT
     */
    public AdminEventSummaryResponse reviewEvent(Integer eventId, ApprovalRequest request, User admin) {
        String action = request.action();
        if (!"APPROVE".equalsIgnoreCase(action) && !"REJECT".equalsIgnoreCase(action)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "action phải là APPROVE hoặc REJECT");
        }
        if ("REJECT".equalsIgnoreCase(action)
                && (request.reason() == null || request.reason().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cần cung cấp reason khi từ chối sự kiện");
        }

        Event event = findEventOrThrow(eventId);

        if ("APPROVE".equalsIgnoreCase(action)) {
            event.setApprovalStatus("APPROVED");
            event.setRejectionReason(null);
        } else {
            event.setApprovalStatus("REJECTED");
            event.setRejectionReason(request.reason());
            // Trả event về DRAFT khi bị từ chối
            event.setStatus("DRAFT");
        }

        event.setReviewedBy(admin);
        event.setReviewedAt(Instant.now());

        return AdminEventSummaryResponse.from(eventRepository.save(event));
    }

    // ORGANIZER MANAGEMENT

    /**
     * Lấy danh sách Organizer, có thể tìm kiếm theo keyword.
     * GET /admin/organizers?search=keyword
     */
    @Transactional(readOnly = true)
    public Page<OrganizerResponse> getOrganizers(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        String keyword = (search == null || search.isBlank()) ? null : search.trim();
        return userRepository.findByRoleAndKeyword(Role.ORGANIZER, keyword, pageable)
                .map(OrganizerResponse::from);
    }

    /**
     * Xem chi tiết một Organizer.
     * GET /admin/organizers/{organizerId}
     */
    @Transactional(readOnly = true)
    public OrganizerResponse getOrganizerById(UUID organizerId) {
        User user = findOrganizerOrThrow(organizerId);
        return OrganizerResponse.from(user);
    }

    /**
     * Tạo Organizer mới.
     * POST /admin/organizers
     */
    public OrganizerResponse createOrganizer(OrganizerRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Email đã được sử dụng: " + request.email());
        }
        if (request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "password không được để trống khi tạo mới organizer");
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.ORGANIZER);
        user.setPhone(request.phone());
        user.setOrganizationName(request.organizationName());

        return OrganizerResponse.from(userRepository.save(user));
    }

    /**
     * Cập nhật thông tin Organizer.
     * PUT /admin/organizers/{organizerId}
     */
    public OrganizerResponse updateOrganizer(UUID organizerId, OrganizerRequest request) {
        User user = findOrganizerOrThrow(organizerId);

        // Kiểm tra email conflict nếu email bị thay đổi
        if (!user.getEmail().equalsIgnoreCase(request.email())
                && userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Email đã được sử dụng: " + request.email());
        }

        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setOrganizationName(request.organizationName());

        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        return OrganizerResponse.from(userRepository.save(user));
    }

    /**
     * Xóa Organizer.
     * DELETE /admin/organizers/{organizerId}
     */
    public void deleteOrganizer(UUID organizerId) {
        User user = findOrganizerOrThrow(organizerId);
        userRepository.delete(user);
    }

    // private helpers

    private Event findEventOrThrow(Integer eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Sự kiện không tồn tại: " + eventId));
    }

    private User findOrganizerOrThrow(UUID organizerId) {
        User user = userRepository.findById(organizerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Organizer không tồn tại: " + organizerId));
        if (user.getRole() != Role.ORGANIZER) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Người dùng không phải Organizer: " + organizerId);
        }
        return user;
    }
}
