package com.event.management.server.controller;

import com.event.management.server.dto.ReservationRequestDTO;
import com.event.management.server.dto.ReservationResponseDTO;
import com.event.management.server.entity.TicketReservation;
import com.event.management.server.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    // Tự viết Constructor thay cho @RequiredArgsConstructor
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<ReservationResponseDTO> createReservation(
            @Valid @RequestBody ReservationRequestDTO request
    ) {

        TicketReservation reservation = reservationService.createReservation(request);

        ReservationResponseDTO response = mapToDTO(reservation);

        return ResponseEntity
                .created(URI.create("/api/reservations/" + reservation.getReservationId()))
                .body(response);
    }

    private ReservationResponseDTO mapToDTO(TicketReservation reservation) {
        // Dùng Constructor đầy đủ thay vì .builder()
        return new ReservationResponseDTO(
                reservation.getReservationId(),
                reservation.getTicketType().getTicketTypeId(),
                reservation.getQuantity(),
                reservation.getStatus(),
                reservation.getExpiresAt()
        );
    }
}