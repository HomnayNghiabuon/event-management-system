package com.example.event_management_server.repository;

import com.example.event_management_server.model.TicketType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TicketTypeRepository extends JpaRepository<TicketType, Integer> {

    /**
     * SELECT ... FOR UPDATE: khóa pessimistic row TicketType trong transaction.
     * Các transaction khác phải WAIT cho đến khi transaction hiện tại commit/rollback.
     * Dùng trong ReservationService.reserveTicket() để tránh oversell khi nhiều user mua cùng lúc.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TicketType t WHERE t.ticketTypeId = :id")
    Optional<TicketType> findByIdForUpdate(@Param("id") Integer id);

    List<TicketType> findByEvent_EventId(Integer eventId);
    void deleteByEvent_EventId(Integer eventId);

    /**
     * Tính tổng số vé còn lại của sự kiện (dùng cho thống kê).
     * COALESCE(..., 0) đảm bảo trả 0 thay vì null khi chưa có loại vé nào.
     */
    @Query("SELECT COALESCE(SUM(tt.quantity), 0) FROM TicketType tt WHERE tt.event.eventId = :eventId")
    long sumAvailableQuantityByEventId(@Param("eventId") Integer eventId);

    /**
     * JOIN FETCH t.event: eager load event cùng lúc để tránh N+1 query.
     * Dùng khi cần kiểm tra event của ticketType mà không muốn thêm query riêng.
     */
    @Query("SELECT t FROM TicketType t JOIN FETCH t.event WHERE t.ticketTypeId = :id")
    Optional<TicketType> findByIdWithEvent(@Param("id") Integer id);
}
