package com.example.event_management_server.repository;

import com.example.event_management_server.model.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailLogRepository extends JpaRepository<EmailLog, Integer> {
}
