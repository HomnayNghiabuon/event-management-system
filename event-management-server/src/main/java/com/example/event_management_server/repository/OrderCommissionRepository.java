package com.example.event_management_server.repository;

import com.example.event_management_server.model.OrderCommission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Repository
public interface OrderCommissionRepository extends JpaRepository<OrderCommission, Integer> {

    boolean existsByOrder_OrderId(Integer orderId);

    @Query("""
            SELECT COALESCE(SUM(oc.grossAmount), 0)
            FROM OrderCommission oc
            WHERE oc.organizer.id = :organizerId
              AND oc.createdAt BETWEEN :from AND :to
            """)
    BigDecimal sumGrossByOrganizerBetween(@Param("organizerId") UUID organizerId,
                                          @Param("from") Instant from,
                                          @Param("to") Instant to);

    @Query("""
            SELECT COALESCE(SUM(oc.commissionAmount), 0)
            FROM OrderCommission oc
            WHERE oc.organizer.id = :organizerId
              AND oc.createdAt BETWEEN :from AND :to
            """)
    BigDecimal sumCommissionByOrganizerBetween(@Param("organizerId") UUID organizerId,
                                               @Param("from") Instant from,
                                               @Param("to") Instant to);

    @Query("""
            SELECT COALESCE(SUM(oc.netAmount), 0)
            FROM OrderCommission oc
            WHERE oc.organizer.id = :organizerId
              AND oc.createdAt BETWEEN :from AND :to
            """)
    BigDecimal sumNetByOrganizerBetween(@Param("organizerId") UUID organizerId,
                                        @Param("from") Instant from,
                                        @Param("to") Instant to);

    @Query("""
            SELECT COALESCE(SUM(oc.commissionAmount), 0)
            FROM OrderCommission oc
            WHERE oc.createdAt BETWEEN :from AND :to
            """)
    BigDecimal sumCommissionBetween(@Param("from") Instant from, @Param("to") Instant to);
}
