package com.example.event_management_server.controller;

import com.example.event_management_server.dto.PurchaseRequestDTO;
import com.example.event_management_server.dto.ReservationRequestDTO;
import com.example.event_management_server.dto.ReservationResponseDTO;
import com.example.event_management_server.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }


    @PostMapping("/reserve")
    public ResponseEntity<ReservationResponseDTO> reserve(
            @Valid @RequestBody ReservationRequestDTO request
    ) {

        ReservationResponseDTO response = reservationService.reserveTicket(request);

        return ResponseEntity
                .created(URI.create("/api/reservations/" + response.getReservationId()))
                .body(response);
    }

    @PostMapping("/purchase")
    public ResponseEntity<String> purchase(
            @Valid @RequestBody PurchaseRequestDTO request
    ) {
        String result = reservationService.processPayment(request);
        return ResponseEntity.ok(result);
    }
}