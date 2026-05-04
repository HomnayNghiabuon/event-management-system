package com.example.event_management_server.controller;

import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Lấy thông tin profile của user đang đăng nhập. GET /api/v1/users/me */
    @GetMapping("/me")
    public UserProfileResponse getProfile(@AuthenticationPrincipal User user) {
        return UserProfileResponse.from(user);
    }

    /**
     * Cập nhật profile. PATCH /api/v1/users/me
     * Đổi mật khẩu chỉ khi newPassword được cung cấp và currentPassword đúng.
     * Email mới phải chưa tồn tại trong hệ thống (trừ email hiện tại của user).
     */
    @PatchMapping("/me")
    public UserProfileResponse updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User user
    ) {
        // Cho phép giữ nguyên email cũ; chỉ kiểm tra conflict khi email thực sự thay đổi
        if (!user.getEmail().equalsIgnoreCase(request.email()) &&
                userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được sử dụng: " + request.email());
        }

        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setOrganizationName(request.organizationName());

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            // Bắt buộc phải xác nhận mật khẩu hiện tại trước khi đổi mật khẩu mới
            if (request.currentPassword() == null ||
                    !passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
            }
            user.setPassword(passwordEncoder.encode(request.newPassword())); // BCrypt hash mật khẩu mới
        }

        return UserProfileResponse.from(userRepository.save(user));
    }

    record UserProfileResponse(
            String userId,
            String fullName,
            String email,
            String role,
            String phone,
            String organizationName,
            LocalDateTime createdAt
    ) {
        static UserProfileResponse from(User u) {
            return new UserProfileResponse(
                    u.getId().toString(),
                    u.getFullName(),
                    u.getEmail(),
                    u.getRole().name(),
                    u.getPhone(),
                    u.getOrganizationName(),
                    u.getCreatedAt()
            );
        }
    }

    record UpdateProfileRequest(
            @NotBlank(message = "fullName không được trống") String fullName,
            @NotBlank(message = "email không được trống") String email,
            String phone,
            String organizationName,
            String currentPassword,
            @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự") String newPassword
    ) {}
}
