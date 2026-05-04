package com.example.event_management_server.service;

import com.example.event_management_server.model.ReservationStatus;
import com.example.event_management_server.model.TicketReservation;
import com.example.event_management_server.repository.TicketReservationRepository;
import com.example.event_management_server.repository.TicketTypeRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
public class ReservationCleanupTask {

    private final TicketReservationRepository reservationRepository;
    private final TicketTypeRepository ticketTypeRepository;

    public ReservationCleanupTask(TicketReservationRepository reservationRepository,
                                  TicketTypeRepository ticketTypeRepository) {
        this.reservationRepository = reservationRepository;
        this.ticketTypeRepository = ticketTypeRepository;
    }

    /**
     * Scheduled job chạy mỗi 60 giây để dọn dẹp reservation hết hạn.
     * fixedDelay: tính từ lúc lần chạy trước kết thúc (khác fixedRate tính từ lúc bắt đầu).
     * Hoàn trả quantity về TicketType để user khác có thể mua.
     * Đảm bảo vé không bị "kẹt" nếu user bỏ giữa chừng mà không hủy reservation.
     */
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void expireStaleReservations() {
        // Tìm tất cả reservation PENDING có expiresAt < now
        List<TicketReservation> expired =
                reservationRepository.findExpiredPendingReservations(Instant.now());

        for (TicketReservation r : expired) {
            r.setStatus(ReservationStatus.EXPIRED);
            var ticketType = r.getTicketType();
            ticketType.setQuantity(ticketType.getQuantity() + r.getQuantity()); // hoàn trả số lượng vé
            ticketTypeRepository.save(ticketType);
            reservationRepository.save(r);
        }

        if (!expired.isEmpty()) {
            System.out.printf("[Cleanup] Expired %d reservation(s), tickets returned.%n", expired.size());
        }
    }
}
