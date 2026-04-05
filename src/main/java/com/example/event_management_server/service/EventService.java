package com.example.event_management_server.service;

import com.example.event_management_server.dto.*;
import com.example.event_management_server.model.Category;
import com.example.event_management_server.model.Event;
import com.example.event_management_server.model.TicketType;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.CategoryRepository;
import com.example.event_management_server.repository.EventRepository;
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

    public EventService(EventRepository eventRepository,
                        CategoryRepository categoryRepository,
                        TicketTypeRepository ticketTypeRepository) {
        this.eventRepository = eventRepository;
        this.categoryRepository = categoryRepository;
        this.ticketTypeRepository = ticketTypeRepository;
    }

    @Transactional(readOnly = true)
    public Page<EventSummaryResponse> listPublishedEvents(
            Integer categoryId, String location, LocalDate date,
            int page, int size, String sort) {

        Sort sortBy = switch (sort == null ? "" : sort) {
            case "price"    -> Sort.by("minPrice");
            case "name"     -> Sort.by("title");
            default         -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        Pageable pageable = PageRequest.of(page, size, sortBy);
        return eventRepository.findPublished(categoryId, location, date, pageable)
                .map(EventSummaryResponse::from);
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(Integer eventId) {
        Event event = findEventOrThrow(eventId);
        List<TicketType> ticketTypes = ticketTypeRepository.findByEvent_EventId(eventId);
        return EventResponse.from(event, ticketTypes);
    }

    public EventResponse createEvent(EventRequest request, User organizer) {
        Category category = findCategoryOrThrow(request.categoryId());

        // Gọi builder tự chế trong Event.java
        Event event = Event.builder()
                .title(request.title())
                .description(request.description())
                .category(category)
                .organizer(organizer)
                .build();
        
        event.setLocation(request.location());
        event.setEventDate(request.eventDate());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setThumbnail(request.thumbnail());
        event.setStatus("DRAFT");

        Event saved = eventRepository.save(event);
        List<TicketType> ticketTypes = saveTicketTypes(request.ticketTypes(), saved);
        updateMinPrice(saved, ticketTypes);

        return EventResponse.from(saved, ticketTypes);
    }

    public EventResponse updateEvent(Integer eventId, EventRequest request, User organizer) {
        Event event = findEventOrThrow(eventId);
        checkOwnership(event, organizer.getId());

        if ("PUBLISHED".equals(event.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Không thể sửa khi đã PUBLISHED.");
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

        Event saved = eventRepository.save(event);
        ticketTypeRepository.deleteByEvent_EventId(eventId);
        List<TicketType> ticketTypes = saveTicketTypes(request.ticketTypes(), saved);
        updateMinPrice(saved, ticketTypes);

        return EventResponse.from(saved, ticketTypes);
    }

    public EventResponse publishEvent(Integer eventId, Boolean publish, User organizer) {
        Event event = findEventOrThrow(eventId);
        checkOwnership(event, organizer.getId());

        event.setStatus(Boolean.TRUE.equals(publish) ? "PUBLISHED" : "DRAFT");
        Event saved = eventRepository.save(event);

        List<TicketType> ticketTypes = ticketTypeRepository.findByEvent_EventId(eventId);
        return EventResponse.from(saved, ticketTypes);
    }

    public void deleteEvent(Integer eventId, User user) {
        Event event = findEventOrThrow(eventId);
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) checkOwnership(event, user.getId());

        ticketTypeRepository.deleteByEvent_EventId(eventId);
        eventRepository.delete(event);
    }

    @Transactional(readOnly = true)
    public Page<EventSummaryResponse> getMyEvents(User organizer, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return eventRepository.findByOrganizer_Id(organizer.getId(), pageable)
                .map(EventSummaryResponse::from);
    }

    private Event findEventOrThrow(Integer eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không thấy event"));
    }

    private Category findCategoryOrThrow(Integer categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không thấy category"));
    }

    private void checkOwnership(Event event, UUID organizerId) {
        if (event.getOrganizer() == null || !event.getOrganizer().getId().equals(organizerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền.");
        }
    }

    private List<TicketType> saveTicketTypes(List<TicketTypeRequest> requests, Event event) {
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