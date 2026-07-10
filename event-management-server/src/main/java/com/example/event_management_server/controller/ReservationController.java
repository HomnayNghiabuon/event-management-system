package com.example.event_management_server.controller;

import com.example.event_management_server.dto.OrderResponse;
import com.example.event_management_server.dto.PurchaseRequestDTO;
import com.example.event_management_server.dto.ReservationRequestDTO;
import com.example.event_management_server.dto.ReservationResponseDTO;
import com.example.event_management_server.model.User;
import com.example.event_management_server.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    /**
     * Tạm giữ vé (bước 1 của luồng mua vé).
     * POST /api/v1/reservations/reserve
     * Trả 201 Created với Location header trỏ đến reservation mới tạo.
     * Vé được giữ tối đa 10 phút (expiresAt = now + 600s, set bởi @PrePersist).
     */
    @PostMapping("/reserve")
    public ResponseEntity<ReservationResponseDTO> reserve(
            @Valid @RequestBody ReservationRequestDTO request,
            @AuthenticationPrincipal User user
    ) {
        ReservationResponseDTO response = reservationService.reserveTicket(request, user);
        return ResponseEntity
                .created(URI.create("/api/v1/reservations/" + response.getReservationId()))
                .body(response);
    }

    /**
     * Thanh toán và xác nhận reservation (bước 2 của luồng mua vé).
     * POST /api/v1/reservations/purchase
     * Idempotent: gọi lại với cùng reservationId sẽ trả về order cũ thay vì tạo mới.
     */
    @PostMapping("/purchase")
    public ResponseEntity<OrderResponse> purchase(
            @Valid @RequestBody PurchaseRequestDTO request,
            @AuthenticationPrincipal User user
    ) {
        OrderResponse result = reservationService.processPayment(request, user);
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy danh sách reservation của user hiện tại (có phân trang).
     * GET /api/v1/reservations/my?page=0&size=10
     */
    @GetMapping("/my")
    public Page<ReservationResponseDTO> getMyReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user
    ) {
        return reservationService.getMyReservations(user, page, size);
    }

    /**
     * Hủy một reservation PENDING (trả lại số lượng vé).
     * DELETE /api/v1/reservations/{reservationId}
     * Trả 204 No Content khi thành công.
     */
    @DeleteMapping("/{reservationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelReservation(
            @PathVariable Integer reservationId,
            @AuthenticationPrincipal User user
    ) {
        reservationService.cancelReservation(reservationId, user);
    }
}
