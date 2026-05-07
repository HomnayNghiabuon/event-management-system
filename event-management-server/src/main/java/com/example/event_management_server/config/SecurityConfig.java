package com.example.event_management_server.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    /**
     * Cấu hình Security Filter Chain cho toàn bộ ứng dụng.
     * Thứ tự matcher quan trọng: Spring Security dùng first-match.
     */
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource)) // cho phép request từ localhost:5173
            .csrf(AbstractHttpConfigurer::disable) // tắt CSRF vì dùng JWT stateless (không có cookie session)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()    // login, register, refresh: không cần token
                .requestMatchers(HttpMethod.GET, "/api/v1/events", "/api/v1/events/{eventId}").permitAll() // xem sự kiện public
                .requestMatchers(HttpMethod.GET, "/api/v1/categories").permitAll() // danh mục public
                .requestMatchers(HttpMethod.GET, "/api/v1/tickets/*/qr-image").authenticated() // xem QR cần đăng nhập
                .requestMatchers("/api/v1/payments/vnpay/return", "/api/v1/payments/vnpay/ipn",
                                 "/api/v1/payments/momo/return", "/api/v1/payments/momo/ipn").permitAll() // gateway callback
                .requestMatchers("/h2-console/**").permitAll()     // H2 console cho dev
                .requestMatchers("/error").permitAll()             // Spring error page
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll() // Swagger UI
                .anyRequest().authenticated()                      // mọi endpoint khác cần JWT
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) ->
                    res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
                // Trả 401 JSON thay vì redirect về trang login mặc định của Spring
            )
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                // STATELESS: không tạo HttpSession → mọi request phải kèm JWT
            )
            .headers(headers ->
                headers.frameOptions(frame -> frame.disable())
                // Tắt X-Frame-Options để H2 console chạy trong iframe được
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            // JWT filter chạy TRƯỚC UsernamePasswordAuthenticationFilter (form login)
            // Thứ tự: JwtAuthFilter → UsernamePasswordAuthFilter → ...

        return http.build();
    }
}
