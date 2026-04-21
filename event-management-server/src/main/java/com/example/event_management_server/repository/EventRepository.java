package com.example.event_management_server.repository;

import com.example.event_management_server.model.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, Integer> {

    /**
     * Tìm kiếm sự kiện PUBLIC (đã publish) với các bộ lọc tuỳ chọn.
     */
    @Query("""
            SELECT e FROM Event e
            WHERE e.status = 'PUBLISHED'
              AND (:categoryId IS NULL OR e.category.categoryId = :categoryId)
              AND (:location   IS NULL OR LOWER(e.location) LIKE LOWER(CONCAT('%', :location, '%')))
              AND (:date       IS NULL OR e.eventDate = :date)
              AND (:keyword    IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                                      OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<Event> findPublished(
            @Param("categoryId") Integer categoryId,
            @Param("location")   String location,
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
}
