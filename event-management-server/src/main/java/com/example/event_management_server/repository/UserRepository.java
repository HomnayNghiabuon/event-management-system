package com.example.event_management_server.repository;

import com.example.event_management_server.model.Role;
import com.example.event_management_server.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    /** Tìm danh sách Organizer, có thể filter theo keyword (tên hoặc email). */
    @Query("""
            SELECT u FROM User u
            WHERE u.role = :role
              AND (:keyword IS NULL
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<User> findByRoleAndKeyword(
            @Param("role") Role role,
            @Param("keyword") String keyword,
            Pageable pageable);
}
