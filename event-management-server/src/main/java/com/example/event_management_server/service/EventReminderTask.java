package com.example.event_management_server.service;

import com.example.event_management_server.model.Event;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.EventRepository;
import com.example.event_management_server.repository.NotificationRepository;
import com.example.event_management_server.repository.TicketRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class EventReminderTask {

    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public EventReminderTask(EventRepository eventRepository,
                             TicketRepository ticketRepository,
                             NotificationRepository notificationRepository,
                             NotificationService notificationService,
                             EmailService emailService) {
        this.eventRepository = eventRepository;
        this.ticketRepository = ticketRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    /**
     * Chạy mỗi 30 phút.
     * Tìm các sự kiện bắt đầu trong khoảng 60–150 phút tới và gửi nhắc nhở "sắp diễn ra".
     * Window 90 phút + interval 30 phút đảm bảo mỗi sự kiện được phủ ít nhất 1 lần mà không bị bỏ sót.
     * Idempotent: kiểm tra type "EVENT_REMINDER_2H_{eventId}" trước khi gửi.
     */
    @Scheduled(cron = "0 0/30 * * * *", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void send2HourReminder() {
        LocalDateTime now = LocalDateTime.now(VN);
        LocalDate today = now.toLocalDate();
        LocalTime windowStart = now.toLocalTime().plusMinutes(60);
        LocalTime windowEnd = now.toLocalTime().plusMinutes(150);

        // Bỏ qua nếu window vượt qua nửa đêm (tránh query sai ngày)
        if (windowEnd.isBefore(windowStart)) return;

        List<Event> events = eventRepository.findPublishedByDateAndTimeRange(today, windowStart, windowEnd);

        int sent = 0;
        for (Event event : events) {
            String type = "EVENT_REMINDER_2H_" + event.getEventId();
            String timeStr = event.getStartTime() != null ? event.getStartTime().format(TIME_FMT) : "?";

            List<User> attendees = ticketRepository.findAttendeesByEventId(event.getEventId());
            for (User user : attendees) {
                if (!notificationRepository.existsByUser_IdAndType(user.getId(), type)) {
                    notificationService.send(user,
                            "Sự kiện sắp bắt đầu",
                            "\"" + event.getTitle() + "\" sẽ bắt đầu lúc " + timeStr + " hôm nay"
                                    + (event.getLocation() != null ? " tại " + event.getLocation() : "") + ". Đừng quên check-in!",
                            type);
                    emailService.sendEventReminder(user, event.getTitle(), timeStr, event.getLocation());
                    sent++;
                }
            }
        }
        if (sent > 0) {
            System.out.printf("[Reminder-2H] Sent %d notification(s) for %d upcoming event(s).%n",
                    sent, events.size());
        }
    }
}
