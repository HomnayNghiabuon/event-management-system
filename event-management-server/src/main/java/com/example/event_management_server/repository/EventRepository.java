package com.example.event_management_server.repository;

import com.example.event_management_server.model.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, Integer> {

    /**
     * Tìm kiếm sự kiện PUBLIC (đã publish) với các bộ lọc tuỳ chọn.
     * location được tách thành tối đa 3 token (loc1/loc2/loc3) và dùng AND LIKE,
     * để địa chỉ càng cụ thể thì kết quả càng chính xác (không OR rộng).
     */
    @Query("""
            SELECT e FROM Event e
            WHERE e.status = 'PUBLISHED'
              AND (:categoryId IS NULL OR e.category.categoryId = :categoryId)
              AND (:loc1 IS NULL OR LOWER(e.location) LIKE LOWER(CONCAT('%', :loc1, '%')))
              AND (:loc2 IS NULL OR LOWER(e.location) LIKE LOWER(CONCAT('%', :loc2, '%')))
              AND (:loc3 IS NULL OR LOWER(e.location) LIKE LOWER(CONCAT('%', :loc3, '%')))
              AND (:date    IS NULL OR e.eventDate = :date)
              AND (:keyword IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                                   OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<Event> findPublished(
            @Param("categoryId") Integer categoryId,
            @Param("loc1")       String loc1,
            @Param("loc2")       String loc2,
            @Param("loc3")       String loc3,
            @Param("date")       LocalDate date,
            @Param("keyword")    String keyword,
            Pageable pageable);

    /**
     * Lấy tất cả sự kiện của một organizer (để organizer quản lý).
     */
    Page<Event> findByOrganizer_Id(UUID organizerId, Pageable pageable);

    /**
     * Kiểm tra sự kiện có thuộc về organizer không.
     */
    boolean existsByEventIdAndOrganizer_Id(Integer eventId, UUID organizerId);

    /**
     * Admin: lấy tất cả sự kiện, có thể lọc theo approvalStatus.
     */
    @Query("""
            SELECT e FROM Event e
            WHERE (:approvalStatus IS NULL OR e.approvalStatus = :approvalStatus)
            """)
    Page<Event> findByApprovalStatus(
            @Param("approvalStatus") String approvalStatus,
            Pageable pageable);

    long countByApprovalStatus(String approvalStatus);

    long countByCategory_CategoryId(Integer categoryId);

    /** Tìm sự kiện PUBLISHED trong ngày có startTime nằm trong khoảng [from, to] — dùng cho reminder 2 giờ trước. */
    @Query("SELECT e FROM Event e WHERE e.eventDate = :date AND e.status = 'PUBLISHED' AND e.startTime BETWEEN :from AND :to")
    List<Event> findPublishedByDateAndTimeRange(
            @Param("date") LocalDate date,
            @Param("from") LocalTime from,
            @Param("to") LocalTime to);
}
