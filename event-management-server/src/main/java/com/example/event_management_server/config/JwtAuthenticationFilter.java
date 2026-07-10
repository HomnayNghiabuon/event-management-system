package com.example.event_management_server.config;

import com.example.event_management_server.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    /**
     * Chạy một lần mỗi request (OncePerRequestFilter đảm bảo điều này).
     * Luồng xử lý:
     * 1. Đọc header Authorization: Bearer <token>
     * 2. Nếu không có → bỏ qua (public endpoint tự xử lý bởi SecurityConfig)
     * 3. Parse JWT → lấy email
     * 4. Nếu email hợp lệ và chưa có authentication → tạo UsernamePasswordAuthenticationToken
     * 5. Set vào SecurityContextHolder → Spring Security biết request đã xác thực
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Không có token → tiếp tục chain, SecurityConfig sẽ quyết định cho phép hay từ chối
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7); // cắt bỏ "Bearer " (7 ký tự)
        String userEmail;

        try {
            userEmail = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // Token bị malformed, hết hạn hoặc chữ ký sai → bỏ qua, không set authentication
            filterChain.doFilter(request, response);
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Chỉ xử lý nếu chưa có authentication (tránh override authentication đã có)
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                // Token hợp lệ → tạo authentication object với đầy đủ authorities (ROLE_ADMIN, v.v.)
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities() // credentials=null vì JWT stateless
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                // Lưu thông tin request (IP, session ID) vào authentication
                SecurityContextHolder.getContext().setAuthentication(authToken);
                // Từ đây, @AuthenticationPrincipal trong controller sẽ trả về userDetails
            }
        }

        filterChain.doFilter(request, response);
    }
}
