package com.example.event_management_server.config;

import com.example.event_management_server.model.Role;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Tạo tài khoản test mặc định nếu chưa tồn tại.
 * Password mặc định: 123456
 */
@Configuration
public class DataInitializer {

    @Bean
    ApplicationRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            seedUser(userRepository, passwordEncoder,
                    "Admin System", "admin@eventms.com", Role.ADMIN, null, null);
            seedUser(userRepository, passwordEncoder,
                    "Nguyen Van Organizer", "organizer@eventms.com", Role.ORGANIZER,
                    "0901234567", "Cong ty Su Kien ABC");
            seedUser(userRepository, passwordEncoder,
                    "Tran Thi Attendee", "attendee@eventms.com", Role.ATTENDEE, null, null);
        };
    }

    private void seedUser(UserRepository repo, PasswordEncoder enc,
                          String fullName, String email, Role role,
                          String phone, String organizationName) {
        if (repo.existsByEmail(email)) return;
        User u = new User();
        u.setFullName(fullName);
        u.setEmail(email);
        u.setPassword(enc.encode("123456"));
        u.setRole(role);
        u.setPhone(phone);
        u.setOrganizationName(organizationName);
        repo.save(u);
    }
}
