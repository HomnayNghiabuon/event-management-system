package com.example.event_management_server.service;

import com.example.event_management_server.model.Notification;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void send(User user, String title, String message, String type) {
        Notification n = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications =
                notificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId(), pageable);
        return notifications.map(NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public long countUnread(User user) {
        return notificationRepository.countByUser_IdAndIsRead(user.getId(), false);
    }

    public void markRead(Integer notificationId, User user) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thông báo không tồn tại"));
        if (!n.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền truy cập thông báo này");
        }
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    public void markAllRead(User user) {
        notificationRepository.markAllReadByUser(user.getId());
    }

    public record NotificationResponse(
            Integer notificationId,
            String title,
            String message,
            String type,
            Boolean isRead,
            java.time.Instant createdAt
    ) {
        static NotificationResponse from(Notification n) {
            return new NotificationResponse(
                    n.getNotificationId(), n.getTitle(), n.getMessage(),
                    n.getType(), n.getIsRead(), n.getCreatedAt());
        }
    }
}
