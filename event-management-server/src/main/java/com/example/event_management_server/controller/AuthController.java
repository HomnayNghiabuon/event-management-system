package com.example.event_management_server.controller;

import com.example.event_management_server.dto.*;
import com.example.event_management_server.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Đăng ký tài khoản mới (ATTENDEE hoặc ORGANIZER).
     * POST /api/v1/auth/register
     * Không cho phép tự đăng ký ADMIN. ORGANIZER bắt buộc có phone + organizationName.
     * Trả về 201 Created kèm access token và refresh token.
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    /**
     * Đăng nhập bằng email và mật khẩu.
     * POST /api/v1/auth/login
     * Trả về access token (1h) và refresh token (7 ngày).
     */
    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * Đổi refresh token lấy access token mới.
     * Body: { "refreshToken": "eyJ..." }
     */
    @PostMapping("/refresh-token")
    public RefreshTokenResponse refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refreshToken(request.refreshToken());
    }

    record RefreshTokenRequest(
            @NotBlank(message = "refreshToken không được để trống")
            String refreshToken
    ) {}
}
