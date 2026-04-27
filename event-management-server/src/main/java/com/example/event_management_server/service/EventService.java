package com.example.event_management_server.service;

import com.example.event_management_server.dto.*;
import com.example.event_management_server.model.Category;
import com.example.event_management_server.model.Event;
import com.example.event_management_server.model.TicketType;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.CategoryRepository;
import com.example.event_management_server.repository.EventRepository;
import com.example.event_management_server.repository.OrderDetailRepository;
import com.example.event_management_server.repository.TicketReservationRepository;
import com.example.event_management_server.repository.TicketTypeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final CategoryRepository categoryRepository;
    private final TicketTypeRepository ticketTypeRepository;
    private final TicketReservationRepository ticketReservationRepository;
    private final OrderDetailRepository orderDetailRepository;

    public EventService(EventRepository eventRepository,
                        CategoryRepository categoryRepository,
                        TicketTypeRepository ticketTypeRepository,
                        TicketReservationRepository ticketReservationRepository,
                        OrderDetailRepository orderDetailRepository) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.ticketTypeRepository = ticketTypeRepository;
        this.ticketReservationRepository = ticketReservationRepository;
        this.orderDetailRepository = orderDetailRepository;
    }

    // PUBLIC

    /**
     * Tìm kiếm / lọc sự kiện đã publish (PUBLIC).
     */
    @Transactional(readOnly = true)
    public Page<EventSummaryResponse> listPublishedEvents(
            Integer categoryId, String location, LocalDate date, String keyword,
            int page, int size, String sort) {

        Sort sortBy = switch (sort == null ? "" : sort) {
            case "price"    -> Sort.by("minPrice");
            case "name"     -> Sort.by("title");
            default         -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        Pageable pageable = PageRequest.of(page, size, sortBy);
        return eventRepository.findPublished(categoryId, location, date, kw, pageable)
                .map(EventSummaryResponse::from);
    }

    /**
     * Lấy chi tiết sự kiện theo ID.
     * - Public: chỉ thấy PUBLISHED
     * - Organizer/Admin: truyền requestingUser để xem cả DRAFT
     */
    @Transactional(readOnly = true)
    public EventResponse getEventById(Integer eventId, User requestingUser) {
        Event event = findEventOrThrow(eventId);

        boolean isPublished = "PUBLISHED".equals(event.getStatus());
        if (!isPublished) {
            if (requestingUser == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sự kiện không tồn tại");
            }
            boolean isAdmin = requestingUser.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            boolean isOwner = event.getOrganizer() != null
                    && event.getOrganizer().getId().equals(requestingUser.getId());
            if (!isAdmin && !isOwner) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sự kiện không tồn tại");
            }
        }

        List<TicketType> ticketTypes = ticketTypeRepository.findByEvent_EventId(eventId);
        return EventResponse.from(event, ticketTypes);
    }

    // ORGANIZER

    /**
     * Tạo sự kiện mới (ORGANIZER).
     */
    public EventResponse createEvent(EventRequest request, User organizer) {
        validateEventTimes(request);
        Category category = findCategoryOrThrow(request.categoryId());

        Event event = Event.builder()
                .title(request.title())
                .description(request.description())
                .category(category)
                .location(request.location())
                .eventDate(request.eventDate())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .thumbnail(request.thumbnail())
                .status("DRAFT")
                .organizer(organizer)
                .build();

        Event saved = eventRepository.save(event);

        List<TicketType> ticketTypes = saveTicketTypes(request.ticketTypes(), saved);
        updateMinPrice(saved, ticketTypes);

        return EventResponse.from(saved, ticketTypes);
    }

    /**
     * Cập nhật sự kiện (ORGANIZER – chỉ sự kiện của mình, trạng thái DRAFT).
     */
    public EventResponse updateEvent(Integer eventId, EventRequest request, User organizer) {
        validateEventTimes(request);
        Event event = findEventOrThrow(eventId);
        checkOwnership(event, organizer.getId());

        if ("PUBLISHED".equals(event.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể chỉnh sửa sự kiện đang PUBLISHED. Hãy unpublish trước.");
        }

        Category category = findCategoryOrThrow(request.categoryId());

        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setCategory(category);
        event.setLocation(request.location());
        event.setEventDate(request.eventDate());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setThumbnail(request.thumbnail());

        // Reset về PENDING nếu event bị REJECTED để admin biết cần duyệt lại
        if ("REJECTED".equals(event.getApprovalStatus())) {
            event.setApprovalStatus("PENDING");
            event.setRejectionReason(null);
        }

        Event saved = eventRepository.save(event);

        // Thay thế toàn bộ ticket types
        ticketTypeRepository.deleteByEvent_EventId(eventId);
        List<TicketType> ticketTypes = saveTicketTypes(request.ticketTypes(), saved);
        updateMinPrice(saved, ticketTypes);

        return EventResponse.from(saved, ticketTypes);
    }

    /**
     * Publish / Unpublish sự kiện (ORGANIZER – chỉ sự kiện của mình).
     * Chỉ sự kiện có approvalStatus = APPROVED mới được publish.
     */
    public EventResponse publishEvent(Integer eventId, Boolean publish, User organizer) {
        Event event = findEventOrThrow(eventId);
        checkOwnership(event, organizer.getId());

        if (Boolean.TRUE.equals(publish) && !"APPROVED".equals(event.getApprovalStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Sự kiện phải được Admin duyệt (APPROVED) trước khi publish.");
        }

        event.setStatus(Boolean.TRUE.equals(publish) ? "PUBLISHED" : "DRAFT");
        Event saved = eventRepository.save(event);

        List<TicketType> ticketTypes = ticketTypeRepository.findByEvent_EventId(eventId);
        return EventResponse.from(saved, ticketTypes);
    }

    /**
     * Xoá sự kiện (ORGANIZER – chỉ sự kiện của mình; ADMIN – bất kỳ).
     * Logic phân quyền giữa ORGANIZER và ADMIN được xử lý ở Controller.
     */
    public void deleteEvent(Integer eventId, User user) {
        Event event = findEventOrThrow(eventId);

        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            checkOwnership(event, user.getId());
        }

        if (ticketReservationRepository.countByTicketType_Event_EventId(eventId) > 0
                || orderDetailRepository.countByEventId(eventId) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể xóa sự kiện đã có đơn đặt vé hoặc giữ chỗ.");
        }

        ticketTypeRepository.deleteByEvent_EventId(eventId);
        eventRepository.delete(event);
    }

    /**
     * Lấy danh sách sự kiện của organizer hiện tại.
     */
    @Transactional(readOnly = true)
    public Page<EventSummaryResponse> getMyEvents(User organizer, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return eventRepository.findByOrganizer_Id(organizer.getId(), pageable)
                .map(EventSummaryResponse::from);
    }

    // private helpers

    private void validateEventTimes(EventRequest request) {
        if (request.startTime() != null && request.endTime() != null
                && !request.endTime().isAfter(request.startTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Giờ kết thúc phải sau giờ bắt đầu");
        }
    }

    private Event findEventOrThrow(Integer eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Sự kiện không tồn tại: " + eventId));
    }

    private Category findCategoryOrThrow(Integer categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Danh mục không tồn tại: " + categoryId));
    }

    private void checkOwnership(Event event, UUID organizerId) {
        if (event.getOrganizer() == null || !event.getOrganizer().getId().equals(organizerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền thực hiện thao tác này trên sự kiện đã chọn.");
        }
    }

    private List<TicketType> saveTicketTypes(
            List<TicketTypeRequest> requests, Event event) {

        List<TicketType> list = requests.stream()
                .map(r -> {
                    TicketType tt = new TicketType();
                    tt.setEvent(event);
                    tt.setName(r.name());
                    tt.setPrice(r.price());
                    tt.setQuantity(r.quantity());
                    return tt;
                })
                .toList();

        return ticketTypeRepository.saveAll(list);
    }

    private void updateMinPrice(Event event, List<TicketType> ticketTypes) {
        BigDecimal min = ticketTypes.stream()
                .map(TicketType::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
        event.setMinPrice(min);
        eventRepository.save(event);
    }
}
