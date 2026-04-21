package com.example.event_management_server.controller;

import com.example.event_management_server.model.User;
import com.example.event_management_server.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** Lấy danh sách thông báo (có phân trang). */
    @GetMapping
    public Page<NotificationService.NotificationResponse> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal User user
    ) {
        return notificationService.getMyNotifications(user, page, size);
    }

    /** Số thông báo chưa đọc. */
    @GetMapping("/unread-count")
    public Map<String, Long> countUnread(@AuthenticationPrincipal User user) {
        return Map.of("unread", notificationService.countUnread(user));
    }

    /** Đánh dấu một thông báo đã đọc. */
    @PatchMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable Integer id, @AuthenticationPrincipal User user) {
        notificationService.markRead(id, user);
    }

    /** Đánh dấu tất cả đã đọc. */
    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(@AuthenticationPrincipal User user) {
        notificationService.markAllRead(user);
    }
}
