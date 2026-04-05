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

    public RegisterResponse register(RegisterRequest request) {
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
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setPhone(request.phone());
        user.setOrganizationName(request.organizationName());

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved);

        return new RegisterResponse(
                saved.getId().toString(),
                saved.getEmail(),
                saved.getRole().name(),
                token
        );
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        String accessToken = jwtService.generateToken(user);

        return new LoginResponse(
                accessToken,
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

    public RefreshTokenResponse refreshToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Authorization header không hợp lệ");
        }

        String refreshToken = authHeader.substring(7);
        String email = jwtService.extractUsername(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new IllegalArgumentException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        String newAccessToken = jwtService.generateToken(user);
        return new RefreshTokenResponse(newAccessToken, 3600);
    }
}
