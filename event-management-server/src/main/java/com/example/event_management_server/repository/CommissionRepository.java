package com.example.event_management_server.repository;

import com.example.event_management_server.model.Commission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Integer> {
    Optional<Commission> findFirstByIsActiveTrueOrderByEffectiveFromDesc();
}
