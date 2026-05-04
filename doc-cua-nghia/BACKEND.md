# Tài Liệu Backend — Event Management System

> Java 21 · Spring Boot 3.4.5 · Spring Security · JWT (jjwt) · JPA/Hibernate  
> Port: **8081** · Base: `/api/v1`

---

## 1. Cấu hình (application.yaml)

```yaml
server:
  port: ${SERVER_PORT:8081}           # Mặc định 8081

spring:
  datasource:
    url: ${DB_URL:jdbc:h2:mem:eventdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL;NON_KEYWORDS=VALUE}
    driver-class-name: ${DB_DRIVER:org.h2.Driver}
    username: ${DB_USERNAME:sa}
    password: ${DB_PASSWORD:}         # Bỏ trống với H2

  jpa:
    database-platform: ${JPA_PLATFORM:org.hibernate.dialect.H2Dialect}
    hibernate:
      ddl-auto: ${JPA_DDL_AUTO:create-drop}   # Tạo lại bảng mỗi lần restart!
    show-sql: ${JPA_SHOW_SQL:true}
    properties.hibernate.format_sql: true
    defer-datasource-initialization: true     # data.sql chạy SAU khi Hibernate tạo bảng

  sql.init:
    mode: always         # Luôn chạy data.sql
    encoding: UTF-8

  h2.console:
    enabled: true        # Bật H2 web console
    path: /h2-console    # Truy cập: http://localhost:8081/h2-console

  servlet.multipart:
    max-file-size: 10MB
    max-request-size: 10MB

  mail:                  # SMTP (tùy chọn)
    host: ${MAIL_HOST:}
    port: ${MAIL_PORT:587}
    username: ${MAIL_USERNAME:}
    password: ${MAIL_PASSWORD:}
    properties.mail.smtp:
      auth: true
      starttls.enable: true

app:
  jwt:
    secret: ${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
    expiration: ${JWT_EXPIRATION:3600000}            # 1 giờ (ms)
    refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800000}  # 7 ngày (ms)
  cloudinary:
    cloud-name: ${CLOUDINARY_CLOUD_NAME:}
    api-key: ${CLOUDINARY_API_KEY:}
    api-secret: ${CLOUDINARY_API_SECRET:}
```

**Chuyển sang MySQL:** Tạo file `.env` với:
```
DB_URL=jdbc:mysql://localhost:3306/eventdb?useSSL=false&serverTimezone=UTC
DB_DRIVER=com.mysql.cj.jdbc.Driver
DB_USERNAME=root
DB_PASSWORD=yourpassword
JPA_PLATFORM=org.hibernate.dialect.MySQL8Dialect
JPA_DDL_AUTO=update
H2_CONSOLE_ENABLED=false
```

---

## 2. Package Structure

```
com.example.event_management_server/
├── config/
│   ├── ApplicationConfig.java         ← @Bean PasswordEncoder(BCrypt), AuthenticationManager
│   ├── SecurityConfig.java            ← HttpSecurity filter chain
│   ├── CorsConfig.java                ← CORS cho localhost:5173
│   ├── JwtAuthenticationFilter.java   ← extends OncePerRequestFilter
│   └── DataInitializer.java           ← @Component, @PostConstruct seed data
│
├── controller/    (10 controllers – tất cả đều @RestController)
├── service/       (10 services/components)
├── model/         (11 @Entity + 3 enum)
├── repository/    (11 interface extends JpaRepository)
├── dto/           (22 record/class)
└── exception/
    ├── GlobalExceptionHandler.java    ← @ControllerAdvice
    ├── NotFoundException.java
    └── BadRequestException.java
```

---

## 3. Security — Chi tiết từng lớp

### 3.1 JwtAuthenticationFilter.java

```java
// Extends OncePerRequestFilter → chạy đúng 1 lần mỗi request
@Override
protected void doFilterInternal(HttpServletRequest request,
                                HttpServletResponse response,
                                FilterChain filterChain) throws ServletException, IOException {

    // Bước 1: Đọc header
    final String authHeader = request.getHeader("Authorization");

    // Nếu không có Bearer → bỏ qua, tiếp tục filter chain (public endpoint vẫn hoạt động)
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        filterChain.doFilter(request, response);
        return;
    }

    // Bước 2: Cắt "Bearer " lấy token
    final String jwt = authHeader.substring(7);

    // Bước 3: Extract email từ JWT claims (có thể ném exception nếu token lỗi)
    try {
        userEmail = jwtService.extractUsername(jwt);
    } catch (Exception e) {
        filterChain.doFilter(request, response);  // Token lỗi → bỏ qua
        return;
    }

    // Bước 4: Nếu chưa authenticated trong SecurityContext
    if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);  // Query DB

        if (jwtService.isTokenValid(jwt, userDetails)) {
            // Bước 5: Set Authentication vào SecurityContext
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
    }

    filterChain.doFilter(request, response);  // Tiếp tục
}
```

### 3.2 JwtService.java — Generate & Validate JWT

```java
// buildToken() — tạo JWT với claims
private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
    extraClaims.put("jti", UUID.randomUUID().toString());  // JWT ID để unique
    return Jwts.builder()
            .claims(extraClaims)
            .subject(userDetails.getUsername())    // email làm subject
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey())             // HMAC-SHA256
            .compact();
}

// getSigningKey() — decode Base64 secret thành SecretKey
private SecretKey getSigningKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    return Keys.hmacShaKeyFor(keyBytes);
}

// isTokenValid() — kiểm tra username match + chưa hết hạn
public boolean isTokenValid(String token, UserDetails userDetails) {
    String username = extractUsername(token);
    return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
}

// extractUsername() — lấy email từ JWT.subject
public String extractUsername(String token) {
    return extractClaim(token, Claims::getSubject);
}
```

### 3.3 User.java — implements UserDetails

```java
// Spring Security dùng 4 method này để kiểm tra quyền đăng nhập:
@Override public boolean isAccountNonLocked() { return active; }  // ← active=false → bị khóa
@Override public boolean isEnabled() { return active; }
@Override public boolean isAccountNonExpired() { return true; }   // Không expire
@Override public boolean isCredentialsNonExpired() { return true; }

// Authority format: "ROLE_ADMIN", "ROLE_ORGANIZER", "ROLE_ATTENDEE"
@Override
public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
}

// Username là email (dùng để extract từ JWT)
@Override public String getUsername() { return email; }
```

### 3.4 SecurityConfig — Phân quyền route

```java
// Class-level @PreAuthorize("hasRole('ADMIN')") trên AdminController
// Method-level @PreAuthorize trên từng endpoint của EventController, TicketController

// Route-level (SecurityConfig):
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/auth/**").permitAll()              // Public
    .requestMatchers(HttpMethod.GET, "/api/v1/events/**").permitAll()
    .requestMatchers(HttpMethod.GET, "/api/v1/categories").permitAll()
    .requestMatchers("/h2-console/**").permitAll()
    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
    .anyRequest().authenticated()
)
```

---

## 4. Models (Entities) — Chi tiết từng field

### 4.1 User

```java
@Entity @Table(name = "users")
public class User implements UserDetails {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;                      // UUID, auto-generated

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;                 // Unique, dùng làm username trong JWT

    @Column(nullable = false)
    private String password;              // BCrypt hash (60 chars)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;                    // ATTENDEE | ORGANIZER | ADMIN (lưu dạng String trong DB)

    @Column(length = 20)
    private String phone;                 // Bắt buộc với ORGANIZER

    @Column(length = 255)
    private String organizationName;      // Bắt buộc với ORGANIZER

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;      // @PrePersist: LocalDateTime.now()

    @Column(name = "is_active", nullable = false)
    private boolean active = true;        // false = bị Admin khóa
}
```

### 4.2 Event

```java
@Entity @Table(name = "events",
    indexes = {
        @Index(name = "idx_events_title", columnList = "title"),     // Tối ưu search
        @Index(name = "idx_events_date", columnList = "event_date")  // Tối ưu filter date
    })
public class Event {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Integer eventId;             // Auto-increment INTEGER (không phải UUID!)

    @NotBlank(message = "Title không được để trống")
    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(length = 50)
    private String status;              // "DRAFT" | "PUBLISHED" — lưu String, không phải Enum

    @Column(length = 255)
    private String location;            // Văn bản địa chỉ

    private Double latitude;            // Tọa độ GPS
    private Double longitude;

    @Column(name = "address_detail", length = 255)
    private String addressDetail;       // Địa chỉ chi tiết

    private String thumbnail;           // URL Cloudinary

    @Column(name = "min_price", precision = 19, scale = 2)
    private BigDecimal minPrice;        // Giá thấp nhất (tính từ TicketTypes)

    @Column(name = "approval_status", length = 20)
    private String approvalStatus = "PENDING";  // "PENDING" | "APPROVED" | "REJECTED"

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;     // Lý do từ chối (chỉ khi REJECTED)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;            // Admin đã duyệt

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;             // Organizer tạo sự kiện

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;          // @PrePersist: Instant.now()

    @Column(name = "updated_at")
    private Instant updatedAt;          // @PreUpdate: Instant.now()

    // @PrePersist / @PreUpdate: kiểm tra startTime < endTime
    private void validateTime() {
        if (startTime != null && endTime != null && startTime.isAfter(endTime)) {
            throw new IllegalArgumentException("startTime phải trước endTime");
        }
    }

    // Static Builder pattern (không dùng Lombok)
    public static EventBuilder builder() { return new EventBuilder(); }
}
```

### 4.3 TicketType

```java
@Entity
public class TicketType {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer ticketTypeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;

    private String name;                // "VIP", "General", "Economy"...
    private BigDecimal price;
    private int quantity;               // Số vé còn lại — giảm khi reserve, tăng khi cancel/expire
}
```

### 4.4 TicketReservation

```java
@Entity @Table(name = "ticket_reservations")
public class TicketReservation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reservationId;

    @ManyToOne User user;
    @ManyToOne TicketType ticketType;
    private int quantity;
    private LocalDateTime reservedAt;
    private LocalDateTime expiresAt;    // = reservedAt + 10 phút

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;   // PENDING | PAID | COMPLETED | CANCELLED | EXPIRED

    // Helper check hết hạn
    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
}
```

### 4.5 Order

```java
@Entity @Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderId;

    @ManyToOne User user;
    private BigDecimal totalPrice;
    private String paymentStatus;       // "PAID" | "CANCELLED"
    private String paymentMethod;       // "MOMO" | "VNPAY" | "CASH"
    private String transactionId;       // UUID.random() — mỗi order có 1 mã riêng

    @OneToOne
    @JoinColumn(name = "reservation_id")
    private TicketReservation ticketReservation;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order")
    private List<OrderDetail> orderDetails;
}
```

### 4.6 OrderDetail

```java
@Entity @Table(name = "order_details")
public class OrderDetail {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer orderDetailId;

    @ManyToOne Order order;
    @ManyToOne TicketType ticketType;
    private int quantity;
    private BigDecimal price;    // Giá tại thời điểm mua (snapshot, không đổi sau)
}
```

### 4.7 Ticket (vé thực tế)

```java
@Entity @Table(name = "tickets")
public class Ticket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer ticketId;            // Auto-increment INTEGER

    @ManyToOne OrderDetail orderDetail;
    @ManyToOne User attendee;            // User mua vé

    @Column(unique = true)
    private String qrCode;               // UUID.randomUUID().toString() — unique, làm mã QR

    private String attendeeName;         // Tên người dùng vé (có thể khác user mua)
    private Boolean checkinStatus = false;
    private Instant checkinTime;         // Null nếu chưa check-in
    private Boolean isValid = true;      // False khi order bị cancel
}
```

**Quan hệ quan trọng:** Ticket → OrderDetail → TicketType → Event  
→ Để lấy tên sự kiện từ ticket: `t.getOrderDetail().getTicketType().getEvent().getTitle()`

### 4.8 Notification

```java
@Entity
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer notificationId;

    @ManyToOne User user;
    private String type;            // "ORDER_CONFIRMED", "EVENT_APPROVED", "EVENT_REJECTED"
    private String message;
    private boolean isRead = false;
    private LocalDateTime createdAt;
}
```

### 4.9 Commission

```java
@Entity
public class Commission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer commissionId;

    private BigDecimal percent;     // VD: 10.00 = 10%
    private Instant effectiveFrom;
    private Boolean isActive;       // Chỉ 1 commission được isActive=true tại 1 thời điểm
}
```

### 4.10 Category & EmailLog

```java
@Entity
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer categoryId;
    private String name;
    private String description;
}

// EmailLog: lưu lịch sử email đã gửi (to, subject, body, status, sentAt)
```

### 4.11 Enums

```java
public enum Role { ATTENDEE, ORGANIZER, ADMIN }

public enum ReservationStatus { PENDING, PAID, COMPLETED, CANCELLED, EXPIRED }

// PaymentMethod được lưu dạng String trong Order.paymentMethod
// Giá trị: "MOMO", "VNPAY", "CASH"
```

---

## 5. Services — Chi tiết logic

### 5.1 AuthService

```java
// register() — dòng 30-68
public RegisterResponse register(RegisterRequest request) {
    // 1. Chặn không cho tự đăng ký ADMIN
    if (request.role() == Role.ADMIN) throw new IllegalArgumentException("...");

    // 2. Kiểm tra email đã tồn tại
    if (userRepository.existsByEmail(request.email())) throw new IllegalArgumentException("...");

    // 3. Validate thêm nếu role = ORGANIZER (phone + organizationName bắt buộc)
    if (request.role() == Role.ORGANIZER) {
        if (request.phone() == null || request.phone().isBlank()) throw ...
        if (request.organizationName() == null || ...) throw ...
    }

    // 4. Tạo User, encode password bằng BCrypt
    User user = new User();
    user.setPassword(passwordEncoder.encode(request.password()));
    User saved = userRepository.save(user);

    // 5. Generate cả 2 token rồi trả về
    String accessToken  = jwtService.generateToken(saved);     // 1 giờ
    String refreshToken = jwtService.generateRefreshToken(saved);  // 7 ngày
    return new RegisterResponse(...);
}

// login() — dòng 70-93
public LoginResponse login(LoginRequest request) {
    // 1. Spring Security xác thực email + password (gọi UserDetailsService.loadByEmail + BCrypt)
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.email(), request.password())
    );
    // Nếu sai → AuthenticationException → GlobalExceptionHandler → 401

    // 2. Load user, generate tokens
    User user = userRepository.findByEmail(request.email()).orElseThrow(...);
    return new LoginResponse(accessToken, refreshToken, "Bearer", 3600,
        new UserInfo(id, fullName, email, role));
}

// refreshToken() — dòng 99-120
public RefreshTokenResponse refreshToken(String refreshToken) {
    // 1. Extract email từ refreshToken
    String email = jwtService.extractUsername(refreshToken);
    // 2. Load user, validate token
    if (!jwtService.isTokenValid(refreshToken, user)) throw new IllegalArgumentException("...");
    // 3. Cấp accessToken mới (không cấp refreshToken mới)
    return new RefreshTokenResponse(newAccessToken, 3600);
}
```

### 5.2 EventService

```java
// @Service @Transactional — tất cả methods đều nằm trong transaction

// createEvent() — dòng 103-129
public EventResponse createEvent(EventRequest request, User organizer) {
    validateEventTimes(request);       // startTime < endTime
    Category category = findCategoryOrThrow(request.categoryId());

    Event event = Event.builder()
            .status("DRAFT")           // Luôn tạo với DRAFT
            .approvalStatus sẽ là "PENDING" (mặc định trong Event)
            .organizer(organizer)
            ...build();

    Event saved = eventRepository.save(event);
    List<TicketType> ticketTypes = saveTicketTypes(request.ticketTypes(), saved);
    updateMinPrice(saved, ticketTypes);  // Tính min(price) từ các TicketType
    return EventResponse.from(saved, ticketTypes);
}

// updateEvent() — dòng 134-172
// ⚠️ Chỉ được update khi status = "DRAFT"
if ("PUBLISHED".equals(event.getStatus())) throw 409 CONFLICT
// ⚠️ Nếu REJECTED → tự reset approvalStatus = "PENDING"
if ("REJECTED".equals(event.getApprovalStatus())) {
    event.setApprovalStatus("PENDING");
    event.setRejectionReason(null);
}
// ⚠️ Xóa và tạo lại toàn bộ TicketTypes
ticketTypeRepository.deleteByEvent_EventId(eventId);
List<TicketType> ticketTypes = saveTicketTypes(request.ticketTypes(), saved);

// publishEvent() — dòng 178-192
// ⚠️ Phải APPROVED trước mới publish được
if (Boolean.TRUE.equals(publish) && !"APPROVED".equals(event.getApprovalStatus())) {
    throw 403 FORBIDDEN "Sự kiện phải được Admin duyệt (APPROVED) trước khi publish."
}
event.setStatus(Boolean.TRUE.equals(publish) ? "PUBLISHED" : "DRAFT");

// deleteEvent() — dòng 198-216
// ⚠️ Không xóa được nếu đã có đơn đặt vé
if (ticketReservationRepository.countByTicketType_Event_EventId(eventId) > 0
        || orderDetailRepository.countByEventId(eventId) > 0) {
    throw 409 CONFLICT "Không thể xóa sự kiện đã có đơn đặt vé"
}

// listPublishedEvents() — dòng 55-69
Sort sortBy = switch (sort) {
    case "price" -> Sort.by("minPrice");
    case "name"  -> Sort.by("title");
    default      -> Sort.by(DESC, "createdAt");  // Mới nhất lên đầu
};
// Query: status=PUBLISHED + approvalStatus=APPROVED + filters
return eventRepository.findPublished(categoryId, location, date, kw, pageable).map(EventSummaryResponse::from);

// updateMinPrice() — private helper, dòng 274-280
BigDecimal min = ticketTypes.stream()
        .map(TicketType::getPrice)
        .min(BigDecimal::compareTo)
        .orElse(BigDecimal.ZERO);
event.setMinPrice(min);
```

### 5.3 ReservationService

```java
// reserveTicket() — dòng 48-83
@Transactional(rollbackFor = Exception.class)
public ReservationResponseDTO reserveTicket(ReservationRequestDTO request, User user) {
    // 1. SELECT FOR UPDATE — lock row tránh race condition đặt vé đồng thời
    TicketType ticketType = ticketTypeRepository.findByIdForUpdate(request.getTicketTypeId())...

    // 2. Kiểm tra đủ vé
    if (ticketType.getQuantity() < request.getQuantity()) {
        throw new BadRequestException("Không đủ vé: chỉ còn " + ticketType.getQuantity() + " vé");
    }

    // 3. Giảm quantity ngay (giữ chỗ)
    ticketType.setQuantity(ticketType.getQuantity() - request.getQuantity());
    ticketTypeRepository.save(ticketType);

    // 4. Tạo Reservation với expiresAt = reservedAt + 10 phút (trong ReservationBuilder)
    TicketReservation reservation = new TicketReservation.ReservationBuilder()
            .status(ReservationStatus.PENDING)
            .build();
    TicketReservation saved = ticketReservationRepository.save(reservation);
    return new ReservationResponseDTO(saved.getReservationId(), ..., saved.getExpiresAt());
}

// processPayment() — dòng 85-165
@Transactional(rollbackFor = Exception.class)
public OrderResponse processPayment(PurchaseRequestDTO request, User user) {
    // 1. Lock reservation (SELECT FOR UPDATE)
    TicketReservation reservation = ticketReservationRepository.findByIdForUpdate(...)

    // 2. Kiểm tra chủ sở hữu
    if (!reservation.getUser().getId().equals(user.getId())) throw 403 FORBIDDEN

    // 3. Xử lý idempotent: nếu đã PAID rồi → trả Order cũ (không tạo mới)
    if (reservation.getStatus() == ReservationStatus.PAID ...) {
        return buildOrderResponse(existingOrder);
    }

    // 4. Kiểm tra hết hạn
    if (reservation.isExpired()) {
        handleExpiredReservation(reservation);  // set EXPIRED, hoàn trả quantity
        throw new BadRequestException("Reservation đã hết hạn, vé đã được hoàn trả.");
    }

    // 5. Tính tổng tiền
    BigDecimal totalPrice = reservation.getTicketType().getPrice()
            .multiply(BigDecimal.valueOf(reservation.getQuantity()));

    // 6. Tạo Order
    Order order = new Order();
    order.setPaymentStatus("PAID");
    order.setTransactionId(UUID.randomUUID().toString());
    Order savedOrder = orderRepository.save(order);

    // 7. Tạo OrderDetail
    OrderDetail detail = new OrderDetail();
    detail.setPrice(reservation.getTicketType().getPrice());  // Snapshot giá
    OrderDetail savedDetail = orderDetailRepository.save(detail);

    // 8. Tạo từng Ticket (1 ticket per người)
    for (int i = 0; i < reservation.getQuantity(); i++) {
        Ticket ticket = new Ticket();
        // attendeeName: lấy từ attendeeNames[i], fallback user.fullName
        String name = (attendeeNames != null && i < attendeeNames.size() && !blank)
                ? attendeeNames.get(i).trim()
                : user.getFullName();
        ticket.setAttendeeName(name);
        ticket.setQrCode(UUID.randomUUID().toString());  // UUID làm mã QR
        ticketRepository.save(ticket);
    }

    // 9. Cập nhật reservation status
    reservation.setStatus(ReservationStatus.PAID);

    // 10. Gửi Notification in-app
    notificationService.send(user, "Đặt vé thành công", "...", "ORDER_CONFIRMED");

    // 11. Gửi email xác nhận (không block response)
    emailService.sendOrderConfirmation(user, eventTitle, qty, orderId, qrCodes);
}

// cancelReservation() — dòng 187-203
// Chỉ cancel được khi status = PENDING
if (reservation.getStatus() != ReservationStatus.PENDING) throw BadRequestException
restoreTicketQuantity(reservation);  // Cộng lại quantity
reservation.setStatus(ReservationStatus.CANCELLED);

// restoreTicketQuantity() — private, dòng 211-215
private void restoreTicketQuantity(TicketReservation reservation) {
    TicketType ticketType = reservation.getTicketType();
    ticketType.setQuantity(ticketType.getQuantity() + reservation.getQuantity());
    ticketTypeRepository.save(ticketType);
}
```

### 5.4 AdminService

```java
// reviewEvent() — dòng 79-122
public AdminEventSummaryResponse reviewEvent(Integer eventId, ApprovalRequest request, User admin) {
    // Validate action
    if (!"APPROVE".equalsIgnoreCase(action) && !"REJECT".equalsIgnoreCase(action)) throw 400
    if ("REJECT" và reason trống) throw 400

    Event event = findEventOrThrow(eventId);

    if ("APPROVE") {
        event.setApprovalStatus("APPROVED");
        event.setRejectionReason(null);
    } else {
        event.setApprovalStatus("REJECTED");
        event.setRejectionReason(request.reason());
        event.setStatus("DRAFT");      // ← Trả về DRAFT khi bị từ chối
    }

    event.setReviewedBy(admin);
    event.setReviewedAt(Instant.now());
    eventRepository.save(event);

    // Gửi Notification cho Organizer
    notificationService.send(event.getOrganizer(), ..., "EVENT_APPROVED" / "EVENT_REJECTED");
}

// createOrganizer() — dòng 152-170
// Admin tạo Organizer, không qua flow đăng ký thông thường
// Bắt buộc có password trong request
if (request.password() == null || blank) throw 400
user.setRole(Role.ORGANIZER);
user.setPassword(passwordEncoder.encode(request.password()));

// updateOrganizer() — dòng 177-196
// Nếu đổi email → kiểm tra email mới chưa bị dùng
if (!user.getEmail().equalsIgnoreCase(request.email()) && userRepository.existsByEmail(request.email())) throw 409
// Chỉ update password nếu request có gửi password mới (không bắt buộc khi update)
if (request.password() != null && !blank) {
    user.setPassword(passwordEncoder.encode(request.password()));
}

// getDashboardStats() — dòng 211-222
// Dùng trực tiếp repository count queries, không join phức tạp
return new DashboardStats(
    eventRepository.count(),
    eventRepository.countByApprovalStatus("PENDING"),
    eventRepository.countByApprovalStatus("APPROVED"),
    eventRepository.countByApprovalStatus("REJECTED"),
    userRepository.countByRole(Role.ORGANIZER),
    userRepository.countByRole(Role.ATTENDEE),
    orderRepository.count(),
    orderRepository.sumTotalRevenue()
);

// createCommission() — dòng 246-252
// Không tự động deactivate commission cũ — Admin phải làm thủ công qua updateCommission
Commission c = new Commission();
c.setPercent(percent);
c.setEffectiveFrom(effectiveFrom != null ? effectiveFrom : Instant.now());
c.setIsActive(true);
```

### 5.5 ReservationCleanupTask

```java
@Component
public class ReservationCleanupTask {
    @Scheduled(fixedDelay = 60_000)  // Chạy mỗi 60 giây (fixedDelay = sau khi xong mới đếm)
    @Transactional
    public void expireStaleReservations() {
        // Query: status=PENDING AND expiresAt < now()
        List<TicketReservation> expired =
                reservationRepository.findExpiredPendingReservations(Instant.now());

        for (TicketReservation r : expired) {
            r.setStatus(ReservationStatus.EXPIRED);  // Không phải CANCELLED
            // Hoàn trả quantity
            var ticketType = r.getTicketType();
            ticketType.setQuantity(ticketType.getQuantity() + r.getQuantity());
            ticketTypeRepository.save(ticketType);
            reservationRepository.save(r);
        }

        if (!expired.isEmpty()) {
            // Log ra console: "[Cleanup] Expired N reservation(s), tickets returned."
        }
    }
}
```

---

## 6. Controllers — API Endpoints chi tiết

### 6.1 AuthController — `/api/v1/auth` (Public)

```
POST /register
  Body: { fullName, email, password, role("ATTENDEE"|"ORGANIZER"), phone?, organizationName? }
  Response 200: { userId, fullName, email, role, accessToken, refreshToken }
  Lỗi: 400 nếu email trùng / ORGANIZER thiếu phone / tự đăng ký ADMIN

POST /login
  Body: { email, password }
  Response 200: { accessToken, refreshToken, tokenType:"Bearer", expiresIn:3600, user:{id,fullName,email,role} }
  Lỗi: 401 nếu sai thông tin

POST /refresh-token
  Body: { refreshToken: "eyJ..." }
  Response 200: { accessToken, expiresIn:3600 }
  Lỗi: 400 nếu token invalid/expired
```

### 6.2 EventController — `/api/v1/events`

```
GET /
  Params: categoryId(int)?, location?, date(ISO_DATE)?, search?, page=0, size=10, sort?
  sort: "price" | "name" | default="createdAt desc"
  Response: Page<EventSummaryResponse>
  Note: Chỉ trả PUBLISHED + APPROVED

GET /{eventId}
  Response: EventResponse (kèm ticketTypes[])
  Note: Public thấy PUBLISHED; Organizer/Admin thấy DRAFT của mình

POST /   [ORGANIZER]
  @PreAuthorize("hasRole('ORGANIZER')")
  Body: EventRequest { title, description, categoryId(int), eventDate, startTime, endTime,
                       location, latitude, longitude, addressDetail, thumbnail, ticketTypes[] }
  ticketTypes[]: [{ name, price, quantity }]
  Response 201: EventResponse

PUT /{eventId}   [ORGANIZER]
  Chỉ update được khi status="DRAFT"
  ⚠️ Xóa và tạo lại toàn bộ TicketTypes
  Response: EventResponse

PATCH /{eventId}/publish   [ORGANIZER]
  Body: { "publish": true | false }   (PublishRequest record)
  ⚠️ Phải APPROVED mới publish được
  Response: EventResponse

DELETE /{eventId}   [ORGANIZER hoặc ADMIN]
  @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
  ⚠️ Lỗi 409 nếu đã có reservation/order
  Response 204 No Content

GET /my   [ORGANIZER]
  Params: page=0, size=10
  Response: Page<EventSummaryResponse> — chỉ sự kiện của organizer hiện tại

GET /{eventId}/stats   [ORGANIZER hoặc ADMIN]
  Response: EventStatsResponse {
    eventId, eventTitle,
    ticketsSold, ticketsAvailable,
    revenue, commissionPercent, commissionAmount, netRevenue,
    totalOrders, checkedInCount
  }
  Logic tính: revenue = SUM(order.totalPrice WHERE PAID)
              commissionPct = commission.isActive=true, mới nhất
              commissionAmt = revenue × pct / 100
              netRevenue = revenue - commissionAmt

POST /{eventId}/notify   [ORGANIZER — sự kiện của mình]
  Body: { subject, message }
  Response: { sent: N, total: M }  ← số email gửi thành công / tổng số attendees
```

### 6.3 AdminController — `/api/v1/admin` (class-level `@PreAuthorize("hasRole('ADMIN')")`)

```
GET /events
  Params: approvalStatus("PENDING"|"APPROVED"|"REJECTED")?, page=0, size=10
  Response: Page<AdminEventSummaryResponse>

PATCH /events/{eventId}/approval
  Body: { "action": "APPROVE" } | { "action": "REJECT", "reason": "..." }
  ⚠️ REJECT bắt buộc có reason
  Gửi Notification cho Organizer
  Response: AdminEventSummaryResponse

GET /organizers
  Params: search?, page=0, size=10
  Response: Page<OrganizerResponse>

GET /organizers/{organizerId}   (UUID)
  Response: OrganizerResponse

POST /organizers
  Body: { fullName, email, password(bắt buộc), phone, organizationName }
  Response 201: OrganizerResponse

PUT /organizers/{organizerId}
  Body: { fullName, email, phone, organizationName, password? }
  password optional — chỉ update nếu được gửi
  Response: OrganizerResponse

DELETE /organizers/{organizerId}
  Response 204 No Content

GET /stats
  Response: DashboardStats record {
    totalEvents, pendingEvents, approvedEvents, rejectedEvents,
    totalOrganizers, totalAttendees, totalOrders, totalRevenue
  }

PATCH /users/{userId}/status?active=true|false
  ⚠️ Dùng query param, không phải body!
  Response 204 No Content

GET /commissions
  Response: List<Commission>

GET /commissions/active
  Response: Commission (isActive=true, mới nhất)

POST /commissions
  Body: { "percent": 10.00, "effectiveFrom": "2025-08-01T00:00:00Z" }
  Response 201: Commission

PATCH /commissions/{commissionId}
  Body: { "percent"?: ..., "effectiveFrom"?: ..., "isActive"?: true|false }
  Tất cả field optional
  Response: Commission
```

### 6.4 ReservationController — `/api/v1/reservations`

```
POST /reserve   (Authenticated)
  Body: { ticketTypeId: int, quantity: int }
  Response 201: ReservationResponseDTO {
    reservationId, ticketTypeId, ticketTypeName, eventTitle,
    quantity, status:"PENDING", expiresAt
  }

POST /purchase   (Authenticated)
  Body: { reservationId: int, paymentMethod: "MOMO"|"VNPAY"|"CASH",
          attendeeNames: ["Tên 1", "Tên 2"] }
  Response: OrderResponse { orderId, totalPrice, paymentStatus, tickets[] }

GET /my
  Params: page=0, size=10
  Response: Page<ReservationResponseDTO>

DELETE /{reservationId}
  Chỉ cancel được PENDING
  Response 204 No Content
```

### 6.5 TicketController — `/api/v1` (base khác các controller khác!)

```
GET /tickets/my   (Authenticated)
  Response: List<MyTicketInfo> {
    ticketId(int), qrCode(UUID string), attendeeName, checkinStatus,
    checkinTime, isValid, eventTitle, ticketTypeName,
    qrImageUrl: "/api/v1/tickets/{qrCode}/qr-image"
  }

GET /tickets/{qrCode}/qr-image   (Authenticated)
  produces: image/png
  Auth: Owner | Organizer của event | Admin
  Nếu isValid=false → 410 Gone "Vé đã bị hủy"
  Response: byte[] PNG (QR code 300×300px)

POST /tickets/{qrCode}/checkin   [ORGANIZER hoặc ADMIN]
  @PreAuthorize("hasRole('ORGANIZER') or hasRole('ADMIN')")
  Logic:
    - isValid=false → { success:false, message:"Vé đã bị hủy" }
    - checkinStatus=true → { success:false, message:"Đã check-in trước đó", checkinTime }
    - Organizer chỉ check-in sự kiện của mình (trừ Admin bypass)
    - Thành công: checkinStatus=true, checkinTime=Instant.now()
  Response: CheckinResponse { success, message, checkinTime, attendeeName }

GET /events/{eventId}/attendees   [ORGANIZER hoặc ADMIN]
  Response: List<AttendeeInfo> {
    ticketId, attendeeName, qrCode, checkinStatus, checkinTime, isValid, ticketTypeName
  }
```

### 6.6 OrderController — `/api/v1/orders`

```
GET /my   (Authenticated)
  Response: Page<OrderResponse>

GET /{orderId}   (Authenticated)
  Response: OrderResponse { orderId, totalPrice, paymentStatus, paymentMethod,
                            transactionId, createdAt, tickets[] }

POST /{orderId}/cancel   (Authenticated)
  Logic: order.paymentStatus="CANCELLED", tất cả ticket.isValid=false
  Response: OrderResponse
```

### 6.7 Các Controller khác

```
UserController /api/v1/users:
  GET /me → UserInfo (id, fullName, email, role, phone, orgName, createdAt)
  PUT /me → update fullName, phone, organizationName
  PUT /me/password → { oldPassword, newPassword } → verify old, encode new

CategoryController /api/v1/categories:
  GET / → List<Category>  (Public)
  POST / → Create  (Admin)
  PUT /{id} → Update  (Admin)
  DELETE /{id} → Delete  (Admin)

NotificationController /api/v1/notifications:
  GET / → Page<Notification> (page, size)
  GET /unread-count → { count: N }
  PATCH /{id}/read → mark 1 notification as read
  PATCH /read-all → mark all user's notifications as read

UploadController /api/v1/upload:
  POST /image → multipart/form-data (field "file")
              → Cloudinary.upload() → { url: "https://res.cloudinary.com/..." }
```

---

## 7. Exception Handling

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    // IllegalArgumentException → 400
    // BadRequestException → 400
    // NotFoundException → 404
    // ResponseStatusException → HTTP status từ exception
    // AccessDeniedException → 403
    // AuthenticationException → 401
    // MethodArgumentNotValidException → 400 + field errors
    // Exception (catch-all) → 500
}
```

Response format lỗi:
```json
{
  "error": "Mô tả lỗi",
  "status": 400,
  "timestamp": "2025-08-15T09:30:00Z"
}
```

---

## 8. DataInitializer

```java
@Component
public class DataInitializer {
    @PostConstruct  // Chạy sau khi Spring context khởi động
    public void init() {
        // Kiểm tra nếu chưa có admin
        if (!userRepository.existsByEmail("admin@eventms.com")) {
            // Tạo Admin, Organizer, Attendee mẫu
            // Tạo các Category: Âm nhạc, Thể thao, Công nghệ, ...
            // Tạo Commission mặc định: 10%, isActive=true
        }
    }
}
```

---

## 9. CORS Config

```java
// Cho phép frontend React dev server gọi API
allowedOrigins = ["http://localhost:5173"]
allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
allowedHeaders = ["*"]
allowCredentials = true
maxAge = 3600
```

---

## 10. QrCodeService

```java
// Dùng ZXing (com.google.zxing) generate QR
public byte[] generatePng(String content) {
    // content = UUID string của ticket.qrCode
    // Tạo BitMatrix 300×300
    // Render thành PNG byte[]
    // Controller set Content-Type: image/png
}
```
