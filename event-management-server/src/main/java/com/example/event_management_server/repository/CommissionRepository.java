package com.example.event_management_server.repository;

import com.example.event_management_server.model.Commission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Integer> {
    Optional<Commission> findFirstByIsActiveTrueOrderByEffectiveFromDesc();

    @Modifying
    @Query("UPDATE Commission c SET c.isActive = false WHERE c.isActive = true AND c.commissionId <> :excludeId")
    void deactivateAllExcept(Integer excludeId);
}
