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

    /**
     * Tạo và lưu một thông báo cho user.
     * Được gọi từ ReservationService (sau khi đặt vé / thanh toán thành công) và AdminService (duyệt sự kiện).
     */
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

    /** Lấy danh sách thông báo của user, sắp xếp mới nhất trước (readOnly để tối ưu transaction). */
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getMyNotifications(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications =
                notificationRepository.findByUser_IdOrderByCreatedAtDesc(user.getId(), pageable);
        return notifications.map(NotificationResponse::from);
    }

    /** Đếm số thông báo chưa đọc — dùng cho badge số trên UI. */
    @Transactional(readOnly = true)
    public long countUnread(User user) {
        return notificationRepository.countByUser_IdAndIsRead(user.getId(), false);
    }

    /**
     * Đánh dấu một thông báo đã đọc.
     * Kiểm tra quyền sở hữu (user chỉ được đánh dấu thông báo của chính mình) — 403 nếu vi phạm.
     */
    public void markRead(Integer notificationId, User user) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thông báo không tồn tại"));
        if (!n.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền truy cập thông báo này");
        }
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    /** Bulk UPDATE: đánh dấu tất cả thông báo của user là đã đọc trong một query duy nhất. */
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
