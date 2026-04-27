# API Documentation – Event Management System

**Stack:** Spring Boot 3.4.5 (REST API) · Java 21 · Spring Security + JWT  
**Base URL:** `http://localhost:8080/api/v1`  
**Authentication:** `Authorization: Bearer <accessToken>` (trừ các endpoint PUBLIC)

---

## Mục lục

1. [Authentication](#1-authentication)
2. [User Profile](#2-user-profile)
3. [Categories](#3-categories)
4. [Events – Public](#4-events--public)
5. [Events – Organizer](#5-events--organizer)
6. [Ticket Reservation & Payment](#6-ticket-reservation--payment)
7. [Tickets & QR Code](#7-tickets--qr-code)
8. [Orders](#8-orders)
9. [Notifications](#9-notifications)
10. [Admin](#10-admin)
11. [Error Format](#11-error-format)
12. [Role Permission Matrix](#12-role-permission-matrix)

---

## 1. Authentication

### 1.1 Register

```
POST /auth/register
```

**Body – ATTENDEE:**
```json
{
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "password": "secret123",
  "role": "ATTENDEE"
}
```

**Body – ORGANIZER** *(phone + organizationName bắt buộc)*:
```json
{
  "fullName": "Tran Thi B",
  "email": "org@example.com",
  "password": "secret123",
  "role": "ORGANIZER",
  "phone": "0901234567",
  "organizationName": "Cong ty ABC"
}
```

> Không thể tự đăng ký role `ADMIN`.

**Response `201 Created`:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "ATTENDEE",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

### 1.2 Login

```
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Response `200 OK`:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "Nguyen Van A",
    "email": "user@example.com",
    "role": "ATTENDEE"
  }
}
```

> - `accessToken` hết hạn sau **1 giờ**.  
> - `refreshToken` hết hạn sau **7 ngày**.

---

### 1.3 Refresh Access Token

```
POST /auth/refresh-token
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response `200 OK`:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "expiresIn": 3600
}
```

---

## 2. User Profile

> **Role:** Mọi user đã đăng nhập

### 2.1 Xem profile

```
GET /users/me
```

**Response `200 OK`:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "role": "ATTENDEE",
  "phone": null,
  "organizationName": null,
  "createdAt": "2025-01-10T10:00:00"
}
```

---

### 2.2 Cập nhật profile

```
PATCH /users/me
```

**Body:**
```json
{
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "phone": "0901234567",
  "organizationName": null,
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

> - `currentPassword` + `newPassword` là tuỳ chọn – chỉ truyền khi muốn đổi mật khẩu.  
> - `newPassword` phải >= 6 ký tự.

**Response `200 OK`:** _(cùng format xem profile)_

---

## 3. Categories

> **Role:** PUBLIC (không cần auth)

### 3.1 Danh sách danh mục

```
GET /categories
```

**Response `200 OK`:**
```json
[
  { "categoryId": 1, "name": "Âm nhạc" },
  { "categoryId": 2, "name": "Công nghệ" }
]
```

---

## 4. Events – Public

### 4.1 Tìm kiếm / lọc sự kiện

> **Role:** PUBLIC – chỉ trả về sự kiện `PUBLISHED`

```
GET /events
```

**Query Parameters:**

| Param        | Type     | Mô tả                                        |
|-------------|----------|----------------------------------------------|
| `categoryId` | `int`    | Lọc theo danh mục                            |
| `location`   | `string` | Tìm kiếm theo địa điểm (contains, ignore case)|
| `date`       | `string` | Lọc đúng ngày `YYYY-MM-DD`                   |
| `search`     | `string` | Tìm theo title hoặc description              |
| `page`       | `int`    | Trang (default `0`)                          |
| `size`       | `int`    | Kích thước trang (default `10`)              |
| `sort`       | `string` | `price` / `name` / _(mặc định: createdAt mới nhất)_ |

**Response `200 OK`:**
```json
{
  "content": [
    {
      "eventId": 1,
      "title": "Tech Conference 2025",
      "category": "Công nghệ",
      "location": "Hội trường A, Hà Nội",
      "eventDate": "2025-06-15",
      "startTime": "09:00:00",
      "endTime": "18:00:00",
      "thumbnail": "https://cdn.example.com/img.jpg",
      "minPrice": 100000,
      "status": "PUBLISHED",
      "approvalStatus": "APPROVED",
      "createdAt": "2025-01-10T10:00:00Z"
    }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "size": 10,
  "number": 0
}
```

---

### 4.2 Xem chi tiết sự kiện

> **Role:** PUBLIC (chỉ thấy PUBLISHED). Organizer sở hữu hoặc Admin có thể xem cả DRAFT.

```
GET /events/{eventId}
```

**Response `200 OK`:**
```json
{
  "eventId": 1,
  "title": "Tech Conference 2025",
  "description": "Mô tả chi tiết sự kiện...",
  "category": "Công nghệ",
  "categoryId": 2,
  "location": "Hội trường A, Hà Nội",
  "eventDate": "2025-06-15",
  "startTime": "09:00:00",
  "endTime": "18:00:00",
  "thumbnail": "https://cdn.example.com/img.jpg",
  "minPrice": 100000,
  "status": "PUBLISHED",
  "organizer": {
    "organizerId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "TechCorp Vietnam"
  },
  "ticketTypes": [
    { "ticketTypeId": 1, "name": "Standard", "price": 100000, "quantity": 50 },
    { "ticketTypeId": 2, "name": "VIP",      "price": 500000, "quantity": 10 }
  ],
  "createdAt": "2025-01-10T10:00:00Z",
  "updatedAt": null
}
```

> `404` nếu event không tồn tại hoặc DRAFT mà không có quyền xem.

---

## 5. Events – Organizer

> **Role:** `ORGANIZER` cho tất cả endpoint trong mục này (trừ `/stats` và `/attendees` có thêm `ADMIN`)

### 5.1 Tạo sự kiện

```
POST /events
```

**Body:**
```json
{
  "title": "Tech Conference 2025",
  "description": "Mô tả chi tiết...",
  "categoryId": 2,
  "location": "Hội trường A, Hà Nội",
  "eventDate": "2025-06-15",
  "startTime": "09:00:00",
  "endTime": "18:00:00",
  "thumbnail": "https://cdn.example.com/img.jpg",
  "ticketTypes": [
    { "name": "Standard", "price": 100000, "quantity": 200 },
    { "name": "VIP",      "price": 500000, "quantity": 50  }
  ]
}
```

> - `eventDate` phải là hôm nay hoặc tương lai.  
> - `endTime` phải sau `startTime`.  
> - `price` >= 0 (0 = vé miễn phí).  
> - Sự kiện mới luôn ở trạng thái `DRAFT`, `approvalStatus = PENDING`.

**Response `201 Created`:** _(EventResponse – xem mục 4.2)_

---

### 5.2 Cập nhật sự kiện

> Chỉ cập nhật được khi event ở trạng thái `DRAFT`.

```
PUT /events/{eventId}
```

**Body:** _(cùng format tạo sự kiện)_

**Response `200 OK`:** _(EventResponse)_

> `409 Conflict` nếu event đang `PUBLISHED` – phải unpublish trước.

---

### 5.3 Publish / Unpublish sự kiện

> Chỉ publish được khi `approvalStatus = APPROVED`.

```
PATCH /events/{eventId}/publish
```

**Body:**
```json
{ "publish": true }
```

**Response `200 OK`:** _(EventResponse)_

> `403 Forbidden` nếu cố publish mà chưa được Admin duyệt.

---

### 5.4 Xoá sự kiện

> **Role:** `ORGANIZER` (chỉ event của mình) hoặc `ADMIN` (bất kỳ)

```
DELETE /events/{eventId}
```

**Response `204 No Content`**

---

### 5.5 Danh sách sự kiện của tôi

```
GET /events/my?page=0&size=10
```

**Response `200 OK`:** _(Page<EventSummaryResponse> – bao gồm cả DRAFT)_

---

### 5.6 Thống kê sự kiện

> **Role:** `ORGANIZER` (event của mình) hoặc `ADMIN`

```
GET /events/{eventId}/stats
```

**Response `200 OK`:**
```json
{
  "eventId": 1,
  "title": "Tech Conference 2025",
  "totalTicketsSold": 150,
  "totalTicketsAvailable": 50,
  "totalRevenue": 15000000,
  "commissionPercent": 10.00,
  "commissionAmount": 1500000,
  "netRevenue": 13500000,
  "totalOrders": 80,
  "checkedInCount": 120
}
```

> - `totalTicketsSold` và `checkedInCount` chỉ tính vé còn hiệu lực (`isValid = true`).  
> - `commissionPercent` lấy từ commission đang `active` mới nhất.

---

### 5.7 Danh sách người tham dự

> **Role:** `ORGANIZER` (event của mình) hoặc `ADMIN`

```
GET /events/{eventId}/attendees
```

**Response `200 OK`:**
```json
[
  {
    "ticketId": 1,
    "attendeeName": "Nguyen Van A",
    "qrCode": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "checkinStatus": false,
    "checkinTime": null,
    "isValid": true,
    "ticketTypeName": "Standard"
  }
]
```

---

## 6. Ticket Reservation & Payment

> **Role:** Mọi user đã đăng nhập (thường là `ATTENDEE`)

Luồng mua vé: **Bước 1 – Giữ chỗ** → **Bước 2 – Thanh toán**

> Vé miễn phí (`price = 0`): Bước 1 tự động hoàn thành cả 2 bước, trả về `status: "PAID"` ngay lập tức, không cần gọi Bước 2.

---

### 6.1 Bước 1 – Giữ chỗ (Reserve)

```
POST /reservations/reserve
```

**Body:**
```json
{
  "ticketTypeId": 1,
  "quantity": 2
}
```

> `quantity` từ 1 đến 10.

**Response `201 Created`:**
```json
{
  "reservationId": 42,
  "ticketTypeId": 1,
  "ticketTypeName": "Standard",
  "eventTitle": "Tech Conference 2025",
  "quantity": 2,
  "status": "PENDING",
  "expirationTime": "2025-06-15T09:10:00Z"
}
```

> - Reservation tự động hết hạn sau **10 phút** nếu không thanh toán; số vé được hoàn trả.  
> - Vé miễn phí: `status` trả về ngay là `"PAID"`.  
> - `400` nếu không đủ vé.

---

### 6.2 Bước 2 – Thanh toán (Purchase)

```
POST /reservations/purchase
```

**Body:**
```json
{
  "reservationId": 42,
  "paymentMethod": "VNPAY"
}
```

**Các giá trị `paymentMethod`:** `CASH` · `MOMO` · `VNPAY`

**Response `200 OK`:**
```json
{
  "orderId": 7,
  "totalPrice": 200000,
  "paymentStatus": "PAID",
  "paymentMethod": "VNPAY",
  "transactionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "createdAt": "2025-06-15T09:05:00Z",
  "tickets": [
    {
      "ticketId": 101,
      "qrCode": "a1b2c3d4-...",
      "attendeeName": "Nguyen Van A",
      "checkinStatus": false
    },
    {
      "ticketId": 102,
      "qrCode": "e5f6g7h8-...",
      "attendeeName": "Nguyen Van A",
      "checkinStatus": false
    }
  ]
}
```

> - `400` nếu reservation đã hết hạn (EXPIRED).  
> - `403` nếu reservation không thuộc user hiện tại.

---

### 6.3 Danh sách reservation của tôi

```
GET /reservations/my?page=0&size=10
```

**Response `200 OK`:** _(Page<ReservationResponseDTO>)_

---

### 6.4 Huỷ reservation

> Chỉ huỷ được khi `status = PENDING`. Số vé được hoàn trả ngay.

```
DELETE /reservations/{reservationId}
```

**Response `204 No Content`**

---

## 7. Tickets & QR Code

### 7.1 Vé của tôi

> **Role:** Mọi user đã đăng nhập

```
GET /tickets/my
```

**Response `200 OK`:**
```json
[
  {
    "ticketId": 101,
    "qrCode": "a1b2c3d4-5678-...",
    "attendeeName": "Nguyen Van A",
    "checkinStatus": false,
    "checkinTime": null,
    "isValid": true,
    "eventTitle": "Tech Conference 2025",
    "ticketTypeName": "Standard",
    "qrImageUrl": "/api/v1/tickets/a1b2c3d4-5678-.../qr-image"
  }
]
```

> `isValid = false` khi đơn hàng đã bị huỷ.

---

### 7.2 Ảnh QR Code (PNG)

> **Role:** Chủ vé (attendee), Organizer của sự kiện đó, hoặc Admin

```
GET /tickets/{qrCode}/qr-image
```

**Response `200 OK`:** Binary PNG image (`Content-Type: image/png`, kích thước 300×300 px)

> - `404` nếu QR code không tồn tại.  
> - `403` nếu không có quyền xem vé này.  
> - `410 Gone` nếu vé đã bị huỷ (`isValid = false`).

---

### 7.3 Check-in bằng QR Code

> **Role:** `ORGANIZER` (event của mình) hoặc `ADMIN`

```
POST /tickets/{qrCode}/checkin
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Check-in thành công",
  "checkinTime": "2025-06-15T09:15:00Z",
  "attendeeName": "Nguyen Van A"
}
```

**Các trường hợp `success = false`:**

| Tình huống                 | message                              |
|---------------------------|--------------------------------------|
| Vé đã bị huỷ              | `"Vé đã bị hủy, không thể check-in"` |
| Vé đã check-in trước đó   | `"Vé đã được check-in trước đó"`     |

> `403` nếu organizer cố check-in vé của sự kiện không thuộc mình.

---

## 8. Orders

> **Role:** Mọi user đã đăng nhập (chỉ xem được đơn của mình; Admin có thể xem bất kỳ)

### 8.1 Danh sách đơn hàng của tôi

```
GET /orders/my?page=0&size=10
```

**Response `200 OK`:** _(Page<OrderResponse>)_

---

### 8.2 Chi tiết đơn hàng

```
GET /orders/{orderId}
```

**Response `200 OK`:** _(OrderResponse – xem mục 6.2)_

---

### 8.3 Huỷ đơn hàng

> Chỉ huỷ được khi `paymentStatus = PAID`. Số vé được hoàn trả, tất cả vé trong đơn bị vô hiệu hóa (`isValid = false`).

```
POST /orders/{orderId}/cancel
```

**Response `204 No Content`**

---

## 9. Notifications

> **Role:** Mọi user đã đăng nhập

### 9.1 Danh sách thông báo

```
GET /notifications?page=0&size=20
```

**Response `200 OK`:**
```json
{
  "content": [
    {
      "notificationId": 1,
      "title": "Đặt vé thành công",
      "message": "Bạn đã đặt 2 vé cho sự kiện \"Tech Conference 2025\". Mã đơn hàng: #7",
      "type": "ORDER_CONFIRMED",
      "isRead": false,
      "createdAt": "2025-06-15T09:05:00Z"
    }
  ],
  "totalElements": 10,
  "totalPages": 1
}
```

**Các loại notification (`type`):**

| Type              | Khi nào gửi                          |
|------------------|--------------------------------------|
| `ORDER_CONFIRMED` | Thanh toán vé thành công             |
| `EVENT_APPROVED`  | Admin duyệt sự kiện của organizer    |
| `EVENT_REJECTED`  | Admin từ chối sự kiện của organizer  |

---

### 9.2 Số thông báo chưa đọc

```
GET /notifications/unread-count
```

**Response `200 OK`:**
```json
{ "unread": 3 }
```

---

### 9.3 Đánh dấu đã đọc (một thông báo)

```
PATCH /notifications/{id}/read
```

**Response `204 No Content`**

---

### 9.4 Đánh dấu tất cả đã đọc

```
PATCH /notifications/read-all
```

**Response `204 No Content`**

---

## 10. Admin

> **Role:** `ADMIN` – bắt buộc với tất cả endpoint trong mục này

### 10.1 Danh sách sự kiện (có lọc)

```
GET /admin/events?approvalStatus=PENDING&page=0&size=10
```

**`approvalStatus`:** `PENDING` · `APPROVED` · `REJECTED` · _(bỏ qua để lấy tất cả)_

**Response `200 OK`:**
```json
{
  "content": [
    {
      "eventId": 1,
      "title": "Tech Conference 2025",
      "location": "Hà Nội",
      "eventDate": "2025-06-15",
      "minPrice": 100000,
      "status": "DRAFT",
      "approvalStatus": "PENDING",
      "rejectionReason": null,
      "organizer": {
        "organizerId": "550e8400-...",
        "name": "TechCorp Vietnam",
        "email": "org@example.com"
      },
      "createdAt": "2025-01-10T10:00:00Z",
      "reviewedAt": null
    }
  ],
  "totalElements": 8,
  "totalPages": 1
}
```

---

### 10.2 Duyệt / Từ chối sự kiện

```
PATCH /admin/events/{eventId}/approval
```

**Body – Duyệt:**
```json
{ "action": "APPROVE" }
```

**Body – Từ chối:**
```json
{
  "action": "REJECT",
  "reason": "Thông tin không đầy đủ, thiếu lịch trình chi tiết."
}
```

> `reason` bắt buộc khi `action = REJECT`.

**Response `200 OK`:** _(AdminEventSummaryResponse)_

> Khi APPROVE: organizer nhận notification `EVENT_APPROVED`.  
> Khi REJECT: event về trạng thái `DRAFT`; organizer nhận notification `EVENT_REJECTED`.

---

### 10.3 Quản lý Organizer (CRUD)

#### Danh sách
```
GET /admin/organizers?search=keyword&page=0&size=10
```

#### Chi tiết
```
GET /admin/organizers/{organizerId}
```

**Response `200 OK`:**
```json
{
  "organizerId": "550e8400-e29b-41d4-a716-446655440000",
  "fullName": "Tran Thi B",
  "email": "org@example.com",
  "phone": "0901234567",
  "organizationName": "Cong ty ABC",
  "createdAt": "2025-01-01T00:00:00"
}
```

#### Tạo mới
```
POST /admin/organizers
```
```json
{
  "fullName": "Tran Thi B",
  "email": "org@example.com",
  "password": "secret123",
  "phone": "0901234567",
  "organizationName": "Cong ty ABC"
}
```
**Response `201 Created`:** _(OrganizerResponse)_

#### Cập nhật
```
PUT /admin/organizers/{organizerId}
```
```json
{
  "fullName": "Tran Thi B (Updated)",
  "email": "org@example.com",
  "phone": "0909999999",
  "organizationName": "Cong ty ABC moi",
  "password": "new_password"
}
```
> `password` tuỳ chọn khi cập nhật; nếu truyền thì sẽ được hash lại.

#### Xoá
```
DELETE /admin/organizers/{organizerId}
```
**Response `204 No Content`**

---

### 10.4 Khoá / Mở khoá User

```
PATCH /admin/users/{userId}/status?active=false
```

> `active=false` → khoá (user không thể đăng nhập).  
> `active=true`  → mở khoá.

**Response `204 No Content`**

---

### 10.5 Thống kê tổng quan hệ thống

```
GET /admin/stats
```

**Response `200 OK`:**
```json
{
  "totalEvents": 120,
  "pendingEvents": 8,
  "approvedEvents": 100,
  "rejectedEvents": 12,
  "totalOrganizers": 35,
  "totalAttendees": 5400,
  "totalOrders": 900,
  "totalRevenue": 850000000
}
```

---

### 10.6 Quản lý Commission (Hoa hồng)

#### Danh sách tất cả
```
GET /admin/commissions
```

**Response `200 OK`:**
```json
[
  {
    "commissionId": 1,
    "percent": 10.00,
    "effectiveFrom": "2025-01-01T00:00:00Z",
    "isActive": true
  }
]
```

#### Commission đang active
```
GET /admin/commissions/active
```

#### Tạo mới
```
POST /admin/commissions
```
```json
{
  "percent": 10.00,
  "effectiveFrom": "2025-07-01T00:00:00Z"
}
```
> `effectiveFrom` tuỳ chọn (mặc định là thời điểm hiện tại).

**Response `201 Created`:** _(Commission object)_

#### Cập nhật
```
PATCH /admin/commissions/{commissionId}
```
```json
{
  "percent": 8.00,
  "effectiveFrom": "2025-08-01T00:00:00Z",
  "isActive": false
}
```
> Tất cả field đều tuỳ chọn – chỉ truyền field cần thay đổi.

**Response `200 OK`:** _(Commission object)_

---

## 11. Error Format

### Lỗi thông thường
```json
{ "error": "Mô tả lỗi" }
```

### Lỗi validation (400)
```json
{
  "errors": {
    "title": "Tiêu đề sự kiện không được để trống",
    "eventDate": "Ngày tổ chức phải là hôm nay hoặc trong tương lai"
  }
}
```

### HTTP Status tham chiếu

| Status | Ý nghĩa                                                       |
|--------|---------------------------------------------------------------|
| `400`  | Request không hợp lệ (validation, business rule)             |
| `401`  | Thiếu hoặc sai JWT token                                     |
| `403`  | Không đủ quyền                                               |
| `404`  | Không tìm thấy resource                                      |
| `409`  | Conflict (email đã tồn tại, event đang PUBLISHED không sửa được) |
| `410`  | Gone – Vé đã bị huỷ, QR không còn hiệu lực                  |
| `500`  | Lỗi server không mong đợi                                    |

---

## 12. Role Permission Matrix

| Chức năng                              | PUBLIC | ATTENDEE | ORGANIZER | ADMIN |
|---------------------------------------|:------:|:--------:|:---------:|:-----:|
| Xem danh sách / chi tiết sự kiện       |   ✓    |    ✓     |     ✓     |   ✓   |
| Đăng ký / Đăng nhập                   |   ✓    |    ✓     |     ✓     |   ✓   |
| Xem / cập nhật profile của mình       |        |    ✓     |     ✓     |   ✓   |
| Đặt vé (reserve + purchase)           |        |    ✓     |           |       |
| Xem vé & QR của mình                  |        |    ✓     |     ✓*    |   ✓   |
| Xem lịch sử đơn hàng của mình         |        |    ✓     |     ✓     |   ✓   |
| Huỷ đơn hàng của mình                 |        |    ✓     |     ✓     |   ✓   |
| Tạo / sửa / xoá sự kiện              |        |          |     ✓     |   ✓*  |
| Publish / Unpublish sự kiện           |        |          |     ✓     |       |
| Xem thống kê sự kiện                  |        |          |     ✓     |   ✓   |
| Xem danh sách attendees               |        |          |     ✓     |   ✓   |
| Check-in bằng QR                      |        |          |     ✓     |   ✓   |
| Duyệt / Từ chối sự kiện              |        |          |           |   ✓   |
| Quản lý Organizer (CRUD)             |        |          |           |   ✓   |
| Khoá / Mở khoá user                  |        |          |           |   ✓   |
| Xem thống kê hệ thống                 |        |          |           |   ✓   |
| Quản lý Commission                    |        |          |           |   ✓   |

> \* `ORGANIZER` chỉ xem QR của sự kiện mình tổ chức.  
> \* `ADMIN` chỉ xoá sự kiện, không tạo/sửa.
