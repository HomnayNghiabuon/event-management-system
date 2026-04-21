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

    // Chạy mỗi 60 giây
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void expireStaleReservations() {
        List<TicketReservation> expired =
                reservationRepository.findExpiredPendingReservations(Instant.now());

        for (TicketReservation r : expired) {
            r.setStatus(ReservationStatus.EXPIRED);
            var ticketType = r.getTicketType();
            ticketType.setQuantity(ticketType.getQuantity() + r.getQuantity());
            ticketTypeRepository.save(ticketType);
            reservationRepository.save(r);
        }

        if (!expired.isEmpty()) {
            System.out.printf("[Cleanup] Expired %d reservation(s), tickets returned.%n", expired.size());
        }
    }
}
