# Tổng Quan Dự Án — Event Management System

## 1. Mô tả

Hệ thống quản lý sự kiện và bán vé trực tuyến full-stack.  
Ba vai trò: **Admin**, **Organizer**, **Attendee**.

---

## 2. Tech Stack

| Lớp | Công nghệ |
|-----|-----------|
| Backend | Java 21, Spring Boot 3.4.5, Spring Security, JWT (jjwt), JPA/Hibernate |
| Database | **H2 in-memory** (mặc định khi dev) hoặc MySQL 8 (qua env vars) |
| Frontend | React 18, Vite, React Router 7, Axios, Tailwind CSS 4 |
| Animation | `motion/react` (Framer Motion) |
| Image Upload | Cloudinary |
| Map | Leaflet / React-Leaflet |
| QR decode | jsQR (camera), ZXing (backend generate) |
| Icons | Lucide React |
| Build | Maven (backend), npm (frontend) |

---

## 3. Kiến trúc tổng thể

```
Browser (React :5173)
       │
       │  HTTP JSON — Authorization: Bearer <JWT>
       ▼
Spring Boot API (:8081)
   JwtAuthenticationFilter → SecurityConfig → Controller → Service → Repository
                                                                          │
                                                                     JPA/Hibernate
                                                                          │
                                                               H2 in-memory / MySQL
```

- Frontend và Backend tách biệt hoàn toàn (khác port, khác process).
- Giao tiếp qua REST API, toàn bộ data trả JSON.
- Auth dùng **JWT stateless**: server không lưu session.
  - Access token hết hạn sau **1 giờ** (`JWT_EXPIRATION=3600000`).
  - Refresh token hết hạn sau **7 ngày** (`JWT_REFRESH_EXPIRATION=604800000`).
- Frontend tự động refresh token khi nhận 401 — xử lý trong `client.js`.

---

## 4. Ba vai trò & quyền hạn

| Vai trò | Quyền |
|---------|-------|
| **Admin** | Duyệt/từ chối sự kiện, CRUD organizer, khóa/mở user, quản lý commission %, xem dashboard stats |
| **Organizer** | Tạo/sửa/xóa sự kiện, publish, check-in vé, xem stats sự kiện, gửi email attendees |
| **Attendee** | Xem sự kiện, đặt vé (3 bước), thanh toán, xem QR vé, download vé PNG, hủy đơn hàng |

Route `/notifications` và `/profile` dùng được cho cả 3 vai trò.  
Route `/my-tickets`, `/my-orders` chỉ dành cho **ATTENDEE**.

---

## 5. Workflow quan trọng

### 5.1 Vòng đời sự kiện

```
Organizer tạo sự kiện
    status = "DRAFT", approvalStatus = "PENDING"
            │
            ▼ EventService.createEvent()  [POST /events]

Organizer submit để duyệt
    status = "PUBLISHED", approvalStatus = "PENDING"
            │
            ▼ EventService.publishEvent()  [PATCH /events/{id}/publish]
            │   ⚠️ Chỉ được publish nếu approvalStatus = "APPROVED"
            │   (lần đầu tiên: admin phải duyệt trước)

Admin duyệt
    approvalStatus = "APPROVED"  →  Public thấy sự kiện
            │
            ▼ AdminService.reviewEvent()  [PATCH /admin/events/{id}/approval]

Admin từ chối
    approvalStatus = "REJECTED", status = "DRAFT"  →  Organizer phải sửa lại
    (Khi Organizer sửa sự kiện bị REJECTED → approvalStatus tự reset về PENDING)
```

**Lưu ý quan trọng về publish:**  
`EventService.publishEvent()` dòng 182: `if (Boolean.TRUE.equals(publish) && !"APPROVED".equals(event.getApprovalStatus()))` → ném lỗi 403. Tức là organizer **phải được admin duyệt trước** rồi mới publish được.

### 5.2 Booking Flow (3 bước + timeout 10 phút)

```
[Bước 1 - select] Attendee chọn loại vé + số lượng (tối đa 10/loại)
        │
        ▼ BookingFlow.handleReserve()
  Gọi POST /reservations/reserve cho từng loại vé đã chọn
  ReservationService.reserveTicket():
    - findByIdForUpdate() → SELECT FOR UPDATE (tránh race condition)
    - Kiểm tra quantity đủ → ném BadRequestException nếu không
    - Giảm ticketType.quantity đi đúng số lượng
    - Tạo TicketReservation: status=PENDING, expiresAt = now + 10 phút
  Frontend: set expiresAt → bắt đầu countdown timer

[Bước 2 - attendee] Nhập tên từng người (điền sẵn tên user hiện tại)
  Đồng hồ đếm ngược hiển thị, đổi màu: xanh (>60s) → vàng (>30s) → đỏ (<30s)
  Nếu hết giờ → step = 'expired'

[Bước 3 - payment] Chọn phương thức: MOMO, VNPAY, CASH
        │
        ▼ BookingFlow.handleConfirmPayment()
  Gọi POST /reservations/purchase cho từng reservation
  ReservationService.processPayment():
    - Kiểm tra reservation.isExpired() → hoàn trả quantity nếu hết hạn
    - Tính totalPrice = price × quantity
    - Tạo Order (paymentStatus="PAID", transactionId=UUID.random)
    - Tạo OrderDetail (link Order → TicketType)
    - Vòng lặp tạo Ticket: mỗi vé có qrCode = UUID.random().toString()
      - attendeeName lấy từ attendeeNames[i], fallback là user.fullName
    - Cập nhật reservation.status = PAID
    - Gửi Notification trong app
    - Gọi emailService.sendOrderConfirmation() (không block response)
  Frontend → step = 'success'

[Nếu reserve thất bại] Rollback tất cả reservation đã tạo được:
  for (r of made) cancelReservation(r.reservationId)
```

### 5.3 ReservationCleanupTask (chạy background mỗi 60 giây)

```java
// ReservationCleanupTask.java dòng 27
@Scheduled(fixedDelay = 60_000)
public void expireStaleReservations() {
    List<TicketReservation> expired =
        reservationRepository.findExpiredPendingReservations(Instant.now());
    for (TicketReservation r : expired) {
        r.setStatus(ReservationStatus.EXPIRED);
        ticketType.setQuantity(ticketType.getQuantity() + r.getQuantity()); // hoàn vé
    }
}
```
→ Đảm bảo vé không bị "kẹt" nếu user bỏ giữa chừng.

### 5.4 Check-in (2 chế độ)

```
Mode 'manual':
  Organizer nhập UUID vào input (font-mono) → submit form
  doCheckin(code) → POST /tickets/{qrCode}/checkin

Mode 'camera':
  startCamera() → navigator.mediaDevices.getUserMedia({ facingMode: 'environment' })
  scanFrame() chạy bằng requestAnimationFrame (rAF loop):
    - drawImage(video) vào canvas ẩn
    - jsQR(imageData) → decode QR
    - Nếu phát hiện QR && !cooldownRef.current:
        cooldownRef.current = true
        doCheckin(code.data)
        setTimeout(() => cooldownRef.current = false, 2000)  // cooldown 2 giây
  Overlay visual: 4 góc bracket xanh lá + thanh pulse ở giữa

Backend TicketController.checkin():
  - Tìm ticket by qrCode
  - Nếu isValid=false → trả { success: false, message: "Vé đã bị hủy" }
  - Nếu checkinStatus=true → trả { success: false, message: "Đã check-in trước đó" }
  - Kiểm tra organizer sở hữu sự kiện (trừ Admin bypass)
  - Set checkinStatus=true, checkinTime=Instant.now()
  - Trả { success: true, attendeeName, checkinTime }
```

### 5.5 Download vé PNG (canvas rendering)

```js
// MyTicketsPage.jsx dòng 43-145
downloadTicket() {
  canvas 700×280px
  // Gradient background: #4F46E5 → #7C3AED (trái sang phải)
  // White left panel: roundRect(16,16,440,248)
  // Semi-transparent right panel: rgba(255,255,255,0.15)
  // Brand label "BuyTicket" màu tím
  // Tiêu đề sự kiện (cắt bớt nếu quá dài)
  // Ticket type badge
  // Tên người tham dự
  // Mã vé: #ticketId
  // Status badge (Đã check-in = xanh lá / Hợp lệ = xanh dương)
  // Dashed divider đứng giữa
  // QR image vẽ vào canvas (await img.onload)
  // QR code text (monospace, truncated)
  canvas.toDataURL('image/png') → <a download> → click()
}
```

---

## 6. Cấu trúc thư mục

```
event-management-system/
├── event-management-server/
│   └── src/main/
│       ├── java/.../
│       │   ├── config/
│       │   │   ├── ApplicationConfig.java         ← BCrypt bean, AuthManager bean
│       │   │   ├── SecurityConfig.java             ← Filter chain, route permissions
│       │   │   ├── CorsConfig.java                 ← Allow localhost:5173
│       │   │   ├── JwtAuthenticationFilter.java    ← OncePerRequestFilter, parse JWT
│       │   │   └── DataInitializer.java            ← Seed users, categories, commission
│       │   ├── controller/
│       │   │   ├── AuthController.java             ← /api/v1/auth
│       │   │   ├── EventController.java            ← /api/v1/events
│       │   │   ├── AdminController.java            ← /api/v1/admin
│       │   │   ├── ReservationController.java      ← /api/v1/reservations
│       │   │   ├── TicketController.java           ← /api/v1/tickets
│       │   │   ├── OrderController.java            ← /api/v1/orders
│       │   │   ├── UserController.java             ← /api/v1/users
│       │   │   ├── CategoryController.java         ← /api/v1/categories
│       │   │   ├── NotificationController.java     ← /api/v1/notifications
│       │   │   └── UploadController.java           ← /api/v1/upload
│       │   ├── service/
│       │   │   ├── AuthService.java
│       │   │   ├── EventService.java
│       │   │   ├── ReservationService.java
│       │   │   ├── AdminService.java
│       │   │   ├── JwtService.java
│       │   │   ├── NotificationService.java
│       │   │   ├── EmailService.java
│       │   │   ├── QrCodeService.java
│       │   │   ├── CloudinaryService.java
│       │   │   └── ReservationCleanupTask.java     ← @Scheduled, chạy mỗi 60s
│       │   ├── model/                              ← 11 entities + 3 enums
│       │   ├── repository/                         ← Spring Data JPA interfaces
│       │   ├── dto/                                ← 22 DTOs
│       │   └── exception/
│       │       ├── GlobalExceptionHandler.java
│       │       ├── NotFoundException.java          ← → HTTP 404
│       │       └── BadRequestException.java        ← → HTTP 400
│       └── resources/
│           ├── application.yaml
│           └── data.sql                            ← Seed data chạy sau Hibernate init
│
└── frontend/src/
    ├── api/
    │   ├── client.js                               ← Axios + auto refresh interceptor
    │   ├── auth.js, events.js, categories.js
    │   ├── tickets.js, orders.js, reservations.js
    │   ├── notifications.js, users.js, admin.js, upload.js
    ├── contexts/AuthContext.jsx                    ← user state + login/logout
    ├── components/
    │   ├── Header.jsx, Footer.jsx
    │   ├── ProtectedRoute.jsx                      ← Guard by role
    │   ├── EventCard.jsx, EventGrid.jsx
    │   ├── BookingFlow.jsx                         ← Modal 3 bước đặt vé
    │   ├── CategoryTabs.jsx, HeroSearch.jsx
    │   ├── LoadingSpinner.jsx, LocationPickerMap.jsx
    ├── pages/public/     ← HomePage, EventDetailPage, LoginPage, RegisterPage
    ├── pages/attendee/   ← MyTicketsPage, MyOrdersPage, NotificationsPage, ProfilePage
    ├── pages/organizer/  ← CreateEventPage, EditEventPage, MyEventsPage,
    │                        EventAttendeesPage, EventStatsPage, CheckInPage
    ├── pages/admin/      ← AdminDashboardPage, AdminEventsPage, AdminOrganizersPage,
    │                        AdminCommissionsPage, AdminCategoriesPage
    └── routes.jsx
```

---

## 7. Tài khoản test

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@eventms.com | 123456 |
| Organizer | organizer@eventms.com | 123456 |
| Attendee | attendee@eventms.com | 123456 |

---

## 8. Endpoints & Cổng

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8081/api/v1 |
| H2 Console (dev) | http://localhost:8081/h2-console |
| Swagger UI | http://localhost:8081/swagger-ui.html |
| Frontend | http://localhost:5173 |

---

> Chi tiết code: [BACKEND.md](BACKEND.md) · [FRONTEND.md](FRONTEND.md)
