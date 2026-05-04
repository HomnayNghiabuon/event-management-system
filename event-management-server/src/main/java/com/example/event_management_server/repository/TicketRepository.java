package com.example.event_management_server.repository;

import com.example.event_management_server.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {

    /**
     * Lấy tất cả vé của một attendee, kèm JOIN FETCH để tránh N+1 query.
     * Trả về đầy đủ thông tin: ticket → orderDetail → ticketType → event.
     */
    @Query("""
        SELECT t FROM Ticket t
        JOIN FETCH t.orderDetail od
        JOIN FETCH od.ticketType tt
        JOIN FETCH tt.event
        WHERE t.attendee.id = :attendeeId
        ORDER BY t.ticketId DESC
        """)
    List<Ticket> findByAttendee_Id(@Param("attendeeId") java.util.UUID attendeeId);

    /** Tìm vé theo mã QR — dùng khi check-in để xác minh vé hợp lệ. */
    @Query("SELECT t FROM Ticket t JOIN FETCH t.orderDetail od JOIN FETCH od.ticketType tt JOIN FETCH tt.event WHERE t.qrCode = :qrCode")
    Optional<Ticket> findByQrCode(@Param("qrCode") String qrCode);

    /** Lấy tất cả vé của một sự kiện (qua chuỗi join: ticket → orderDetail → order → reservation → ticketType → event). */
    @Query("""
        SELECT t FROM Ticket t
        JOIN t.orderDetail od
        JOIN od.order o
        JOIN o.ticketReservation r
        JOIN r.ticketType tt
        WHERE tt.event.eventId = :eventId
        """)
    List<Ticket> findByEventId(@Param("eventId") Integer eventId);

    /** Đếm số vé hợp lệ (isValid=true) của sự kiện — dùng cho thống kê ticketsSold. */
    @Query("""
        SELECT COUNT(t) FROM Ticket t
        JOIN t.orderDetail od
        JOIN od.order o
        JOIN o.ticketReservation r
        JOIN r.ticketType tt
        WHERE tt.event.eventId = :eventId AND t.isValid = true
        """)
    long countByEventId(@Param("eventId") Integer eventId);

    /** Đếm số vé đã check-in và còn hợp lệ — dùng cho thống kê checkedIn. */
    @Query("""
        SELECT COUNT(t) FROM Ticket t
        JOIN t.orderDetail od
        JOIN od.order o
        JOIN o.ticketReservation r
        JOIN r.ticketType tt
        WHERE tt.event.eventId = :eventId AND t.checkinStatus = true AND t.isValid = true
        """)
    long countCheckedInByEventId(@Param("eventId") Integer eventId);

    @Query("SELECT t FROM Ticket t WHERE t.orderDetail.order.orderId = :orderId")
    List<Ticket> findByOrderId(@Param("orderId") Integer orderId);

    /**
     * Bulk UPDATE: đánh dấu toàn bộ vé của một order là isValid=false trong một câu query duy nhất.
     * @Modifying bắt buộc với UPDATE/DELETE JPQL. Hiệu quả hơn load từng ticket rồi set từng cái.
     */
    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Ticket t SET t.isValid = false WHERE t.orderDetail.order.orderId = :orderId")
    int invalidateByOrderId(@Param("orderId") Integer orderId);

    /**
     * Lấy danh sách DISTINCT attendee (User) có vé hợp lệ của sự kiện.
     * Dùng bởi EventController.sendNotification() để gửi email hàng loạt.
     * AND t.attendee IS NOT NULL: bỏ qua vé ẩn danh (không có tài khoản).
     */
    @Query("""
        SELECT DISTINCT t.attendee FROM Ticket t
        JOIN t.orderDetail od
        JOIN od.order o
        JOIN o.ticketReservation r
        JOIN r.ticketType tt
        WHERE tt.event.eventId = :eventId
          AND t.attendee IS NOT NULL
          AND t.isValid = true
        """)
    List<com.example.event_management_server.model.User> findAttendeesByEventId(@Param("eventId") Integer eventId);
}
