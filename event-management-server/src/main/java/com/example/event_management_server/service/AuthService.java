package com.example.event_management_server.service;

import com.example.event_management_server.dto.*;
import com.example.event_management_server.model.Role;
import com.example.event_management_server.model.User;
import com.example.event_management_server.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Đăng ký tài khoản mới (ATTENDEE hoặc ORGANIZER).
     * Không cho phép tự đăng ký ADMIN — admin chỉ được tạo bởi admin khác.
     * ORGANIZER bắt buộc có phone và organizationName.
     * Password được hash bằng BCrypt trước khi lưu.
     */
    public RegisterResponse register(RegisterRequest request) {
        if (request.role() == Role.ADMIN) {
            throw new IllegalArgumentException("Không thể tự đăng ký tài khoản ADMIN");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email đã được sử dụng: " + request.email());
        }

        if (request.role() == Role.ORGANIZER) {
            if (request.phone() == null || request.phone().isBlank()) {
                throw new IllegalArgumentException("phone là bắt buộc với ORGANIZER");
            }
            if (request.organizationName() == null || request.organizationName().isBlank()) {
                throw new IllegalArgumentException("organizationName là bắt buộc với ORGANIZER");
            }
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password())); // BCrypt hash, không lưu plain text
        user.setRole(request.role());
        user.setPhone(request.phone());
        user.setOrganizationName(request.organizationName());

        User saved = userRepository.save(user);
        String accessToken  = jwtService.generateToken(saved);
        String refreshToken = jwtService.generateRefreshToken(saved);

        return new RegisterResponse(
                saved.getId().toString(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getRole().name(),
                accessToken,
                refreshToken
        );
    }

    /**
     * Đăng nhập bằng email và password.
     * authenticationManager.authenticate() tự ném BadCredentialsException nếu sai thông tin.
     * Trả về cả access token (1h) và refresh token (7 ngày).
     */
    public LoginResponse login(LoginRequest request) {
        // Xác thực qua Spring Security — ném exception nếu sai email/password hoặc tài khoản bị khóa
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        String accessToken  = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new LoginResponse(
                accessToken,
                refreshToken,
                "Bearer",
                3600,
                new LoginResponse.UserInfo(
                        user.getId().toString(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole().name()
                )
        );
    }

    /**
     * Nhận refreshToken trong request body, trả về accessToken mới.
     * Body: { "refreshToken": "..." }
     */
    public RefreshTokenResponse refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("refreshToken không được để trống");
        }

        String email;
        try {
            email = jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new IllegalArgumentException("Refresh token không hợp lệ");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new IllegalArgumentException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        String newAccessToken = jwtService.generateToken(user);
        return new RefreshTokenResponse(newAccessToken, 3600);
    }
}
