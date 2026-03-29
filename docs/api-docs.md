# API Documentation – Event Management System

**Stack:** Spring Boot (REST API) + Next.js / TypeScript (Frontend)
**Base URL:** `http://localhost:8080/api/v1`  
**Authentication:** Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Events (Sự kiện)](#2-events)
3. [Ticket Reservation (Giữ chỗ)](#3-ticket-reservation)
4. [Tickets (Vé)](#4-tickets)
5. [Attendee – Người tham dự](#5-attendee)
6. [Organizer](#6-organizer)
7. [Admin](#7-admin)
8. [Notifications (Thông báo)](#8-notifications)
9. [Error Codes](#9-error-codes)

---

## 1. Authentication

### 1.1 Register

```
POST /auth/register
```

**Request Body – ATTENDEE:**
```json
{
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "password": "string",
  "role": "ATTENDEE"
}
```

**Request Body – ORGANIZER** *(thêm `phone` và `organizationName` bắt buộc)*:
```json
{
  "fullName": "Nguyen Van A",
  "email": "organizer@example.com",
  "password": "string",
  "role": "ORGANIZER",
  "phone": "0901234567",
  "organizationName": "Cong ty TNHH ABC"
}
```

> **Lưu ý:** Với `role = ORGANIZER`, các field `phone` và `organizationName` là **bắt buộc**. Với `role = ATTENDEE`, hai field này được bỏ qua.

**Response `201 Created`:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "ATTENDEE | ORGANIZER",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.2 Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "string"
}
```

**Response `200 OK`:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "userId": "uuid",
    "fullName": "Nguyen Van A",
    "email": "user@example.com",
    "role": "ATTENDEE"
  }
}
```

---

### 1.3 Refresh Token

```
POST /auth/refresh-token
```

**Headers:** `Authorization: Bearer <token>`

**Response `200 OK`:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

---

## 2. Events

### 2.1 Search / Filter Events

> **Role:** PUBLIC (no auth required)

```
GET /events
```

**Query Parameters:**

| Parameter  | Type     | Required | Description                         |
|------------|----------|----------|-------------------------------------|
| `category` | `string` | No       | Category slug (e.g. `music`, `tech`)|
| `location` | `string` | No       | City or venue name                  |
| `date`     | `string` | No       | ISO date `YYYY-MM-DD`               |
| `page`     | `int`    | No       | Page number, default `0`            |
| `size`     | `int`    | No       | Page size, default `10`             |
| `sort`     | `string` | No       | `date`, `price`, `name`             |

**Response `200 OK`:**
```json
{
  "content": [
    {
      "eventId": "uuid",
      "title": "Tech Conference 2025",
      "category": "Technology",
      "location": "Hanoi",
      "startDate": "2025-06-15T09:00:00",
      "endDate": "2025-06-15T18:00:00",
      "thumbnailUrl": "https://cdn.example.com/events/img.jpg",
      "minPrice": 100000,
      "status": "PUBLISHED"
    }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "size": 10,
  "number": 0
}
```

---

### 2.2 Get Event Detail

> **Role:** PUBLIC

```
GET /events/{eventId}
```

**Path Variables:**

| Variable  | Type   | Description |
|-----------|--------|-------------|
| `eventId` | `uuid` | Event ID    |

**Response `200 OK`:**
```json
{
  "eventId": "uuid",
  "title": "Tech Conference 2025",
  "description": "Mô tả chi tiết sự kiện...",
  "category": "Technology",
  "location": "Hội trường A, Hanoi",
  "startDate": "2025-06-15T09:00:00",
  "endDate": "2025-06-15T18:00:00",
  "thumbnailUrl": "https://cdn.example.com/events/img.jpg",
  "organizer": {
    "organizerId": "uuid",
    "name": "TechCorp Vietnam"
  },
  "ticketTypes": [
    {
      "ticketTypeId": "uuid",
      "name": "Standard",
      "price": 100000,
      "totalQuantity": 200,
      "remainingQuantity": 50
    },
    {
      "ticketTypeId": "uuid",
      "name": "VIP",
      "price": 500000,
      "totalQuantity": 50,
      "remainingQuantity": 10
    }
  ],
  "status": "PUBLISHED"
}
```

---

### 2.3 Create Event

> **Role:** `ORGANIZER`  
> **Headers:** `Authorization: Bearer <token>`

```
POST /events
```

**Request Body:**
```json
{
  "title": "Tech Conference 2025",
  "description": "Mô tả chi tiết...",
  "categoryId": "uuid",
  "location": "Hội trường A, Hanoi",
  "startDate": "2025-06-15T09:00:00",
  "endDate": "2025-06-15T18:00:00",
  "thumbnailUrl": "https://cdn.example.com/events/img.jpg",
  "ticketTypes": [
    {
      "name": "Standard",
      "price": 100000,
      "totalQuantity": 200
    },
    {
      "name": "VIP",
      "price": 500000,
      "totalQuantity": 50
    }
  ]
}
```

**Response `201 Created`:**
```json
{
  "eventId": "uuid",
  "title": "Tech Conference 2025",
  "status": "DRAFT",
  "createdAt": "2025-01-10T10:00:00"
}
```

---

### 2.4 Publish / Unpublish Event

> **Role:** `ORGANIZER`  
> **Headers:** `Authorization: Bearer <token>`

```
PATCH /events/{eventId}/publish
```

**Request Body:**
```json
{
  "publish": true
}
```

**Response `200 OK`:**
```json
{
  "eventId": "uuid",
  "status": "PUBLISHED",
  "updatedAt": "2025-01-10T12:00:00"
}
```

---

### 2.5 Update Event

> **Role:** `ORGANIZER`  
> **Headers:** `Authorization: Bearer <token>`

```
PUT /events/{eventId}
```

**Request Body:** _(same structure as Create Event)_

**Response `200 OK`:**
```json
{
  "eventId": "uuid",
  "title": "Tech Conference 2025 (Updated)",
  "updatedAt": "2025-01-10T12:00:00"
}
```

---

### 2.6 Delete Event

> **Role:** `ORGANIZER` or `ADMIN`  
> **Headers:** `Authorization: Bearer <token>`

```
DELETE /events/{eventId}
```

**Response `204 No Content`**

---

## 3. Ticket Reservation

> Luồng mua vé gồm 2 bước: **Giữ chỗ trước** → **Thanh toán sau**.  
> Reservation tự động hết hạn sau 10 phút nếu không thanh toán.

```
Bước 1: POST /reservations          → giữ chỗ, nhận reservationId
Bước 2: POST /tickets/purchase      → thanh toán, truyền reservationId vào
```

---

### 3.1 Create Reservation (Giữ chỗ)

> **Role:** `ATTENDEE`  
> **Headers:** `Authorization: Bearer <token>`

```
POST /reservations
```

**Request Body:**
```json
{
  "ticketTypeId": "uuid",
  "quantity": 2
}
```

**Response `201 Created`:**
```json
{
  "reservationId": "uuid",
  "ticketTypeId": "uuid",
  "ticketTypeName": "VIP",
  "eventTitle": "Tech Conference 2025",
  "quantity": 2,
  "unitPrice": 500000,
  "totalPrice": 1000000,
  "status": "HOLDING",
  "expiresAt": "2025-06-15T09:10:00",
  "createdAt": "2025-06-15T09:00:00"
}
```

> ⚠️ Nếu không đủ vé: `409 TICKET_SOLD_OUT`

---

### 3.2 Cancel Reservation (Hủy giữ chỗ)

> **Role:** `ATTENDEE`  
> **Headers:** `Authorization: Bearer <token>`  
> Gọi khi user thoát trang thanh toán để trả vé lại ngay, không cần chờ hết hạn.

```
DELETE /reservations/{reservationId}
```

**Response `200 OK`:**
```json
{
  "reservationId": "uuid",
  "status": "CANCELLED",
  "message": "Đã hủy giữ chỗ, vé đã được trả lại."
}
```

---

### 3.3 Get Reservation Status

> **Role:** `ATTENDEE`  
> **Headers:** `Authorization: Bearer <token>`  
> Frontend dùng để poll trạng thái và hiển thị đồng hồ đếm ngược.

```
GET /reservations/{reservationId}
```

**Response `200 OK`:**
```json
{
  "reservationId": "uuid",
  "status": "HOLDING",
  "expiresAt": "2025-06-15T09:10:00",
  "secondsRemaining": 347
}
```

**Các giá trị `status`:**

| Status      | Ý nghĩa                                      |
|-------------|----------------------------------------------|
| `HOLDING`   | Đang giữ chỗ, chờ thanh toán                 |
| `CONFIRMED` | Đã thanh toán thành công                     |
| `EXPIRED`   | Hết 10 phút, vé được trả lại tự động         |
| `CANCELLED` | User chủ động hủy                            |

---

## 4. Tickets

### 4.1 Purchase Ticket (Xác nhận thanh toán)

> **Role:** `ATTENDEE`  
> **Headers:** `Authorization: Bearer <token>`  
> Phải có `reservationId` hợp lệ (status = `HOLDING`) từ Bước 1.

```
POST /tickets/purchase
```

**Request Body:**
```json
{
  "reservationId": "uuid",
  "paymentMethod": "VNPAY | MOMO | STRIPE"
}
```

**Response `201 Created`:**
```json
{
  "orderId": "uuid",
  "status": "PENDING_PAYMENT",
  "totalAmount": 1000000,
  "paymentMethod": "VNPAY",
  "paymentUrl": "https://payment.gateway.com/pay?orderId=..."
}
```

> ⚠️ Nếu reservation đã `EXPIRED`: `409 RESERVATION_EXPIRED`  
> ⚠️ Nếu reservation không thuộc user hiện tại: `403 FORBIDDEN`

---

### 4.2 Get E-Ticket (QR Code)

> **Role:** `ATTENDEE`  
> **Headers:** `Authorization: Bearer <token>`

```
GET /tickets/{ticketId}/qr
```

**Response `200 OK`:**
```json
{
  "ticketId": "uuid",
  "qrCodeUrl": "https://cdn.example.com/qr/ticket-uuid.png",
  "qrCodeData": "BASE64_ENCODED_QR_STRING",
  "attendeeName": "Nguyen Van A",
  "eventName": "Tech Conference 2025",
  "ticketTypeName": "VIP",
  "location": "Hội trường A, Hanoi",
  "startTime": "2025-06-15T09:00:00",
  "endTime": "2025-06-15T18:00:00",
  "checkinStatus": false
}
```

---

### 4.3 Check-in by QR Code (Attendee self check-in)

> **Role:** `ATTENDEE`  
> **Headers:** `Authorization: Bearer <token>`

```
POST /tickets/checkin
```

**Request Body:**
```json
{
  "qrCodeData": "BASE64_ENCODED_QR_STRING"
}
```

**Response `200 OK`:**
```json
{
  "ticketId": "uuid",
  "status": "CHECKED_IN",
  "checkedInAt": "2025-06-15T09:15:00",
  "message": "Check-in thành công!"
}
```

---

### 4.4 View Registered Event History

> **Role:** `ATTENDEE`  
> **Headers:** `Authorization: Bearer <token>`

```
GET /tickets/my-history
```

**Query Parameters:**

| Parameter | Type     | Required | Description               |
|-----------|----------|----------|---------------------------|
| `page`    | `int`    | No       | Default `0`               |
| `size`    | `int`    | No       | Default `10`              |
| `status`  | `string` | No       | `UPCOMING`, `PAST`, `ALL` |

**Response `200 OK`:**
```json
{
  "content": [
    {
      "ticketId": "uuid",
      "eventName": "Tech Conference 2025",
      "eventDate": "2025-06-15T09:00:00",
      "location": "Hội trường A, Hanoi",
      "ticketTypeName": "Standard",
      "checkinStatus": true,
      "purchasedAt": "2025-01-10T10:30:00"
    }
  ],
  "totalElements": 5,
  "totalPages": 1
}
```

---

## 5. Attendee

### 5.1 Get Profile

> **Role:** `ATTENDEE`  
> **Headers:** `Authorization: Bearer <token>`

```
GET /attendees/me
```

**Response `200 OK`:**
```json
{
  "userId": "uuid",
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "phone": "0901234567",
  "avatarUrl": "https://cdn.example.com/avatars/user.jpg",
  "createdAt": "2024-01-01T00:00:00"
}
```

---

## 6. Organizer

### 6.1 Get Registrant List

> **Role:** `ORGANIZER`  
> **Headers:** `Authorization: Bearer <token>`

```
GET /organizer/events/{eventId}/registrants
```

**Query Parameters:**

| Parameter   | Type     | Required | Description                     |
|-------------|----------|----------|---------------------------------|
| `page`      | `int`    | No       | Default `0`                     |
| `size`      | `int`    | No       | Default `20`                    |
| `checkedIn` | `boolean`| No       | Filter by check-in status       |

**Response `200 OK`:**
```json
{
  "content": [
    {
      "ticketId": "uuid",
      "attendeeName": "Nguyen Van A",
      "email": "user@example.com",
      "ticketType": "VIP",
      "purchasedAt": "2025-01-10T10:30:00",
      "checkedIn": false
    }
  ],
  "totalElements": 150,
  "totalPages": 8
}
```

---

### 6.2 Check-in Attendee (Organizer scans QR)

> **Role:** `ORGANIZER`  
> **Headers:** `Authorization: Bearer <token>`

```
POST /organizer/events/{eventId}/checkin
```

**Request Body:**
```json
{
  "qrCodeData": "BASE64_ENCODED_QR_STRING"
}
```

**Response `200 OK`:**
```json
{
  "ticketId": "uuid",
  "attendeeName": "Nguyen Van A",
  "ticketType": "VIP",
  "status": "CHECKED_IN",
  "checkedInAt": "2025-06-15T09:20:00"
}
```

---

### 6.3 Send Email Notification

> **Role:** `ORGANIZER`  
> **Headers:** `Authorization: Bearer <token>`

```
POST /organizer/events/{eventId}/notify
```

**Request Body:**
```json
{
  "subject": "Thông tin quan trọng về sự kiện",
  "content": "Nội dung email thông báo...",
  "targetGroup": "ALL | CHECKED_IN | NOT_CHECKED_IN"
}
```

**Response `200 OK`:**
```json
{
  "message": "Email đã được gửi thành công",
  "recipientCount": 150,
  "sentAt": "2025-06-14T08:00:00"
}
```

---

### 6.4 Ticket Sales Report

> **Role:** `ORGANIZER`  
> **Headers:** `Authorization: Bearer <token>`

```
GET /organizer/events/{eventId}/reports/sales
```

**Response `200 OK`:**
```json
{
  "eventId": "uuid",
  "eventTitle": "Tech Conference 2025",
  "totalTicketsSold": 180,
  "totalRevenue": 25000000,
  "commission": 2500000,
  "netRevenue": 22500000,
  "breakdown": [
    {
      "ticketType": "Standard",
      "quantitySold": 150,
      "revenue": 15000000
    },
    {
      "ticketType": "VIP",
      "quantitySold": 30,
      "revenue": 10000000
    }
  ]
}
```

---

## 7. Admin

### 7.1 Approve / Reject Event

> **Role:** `ADMIN`  
> **Headers:** `Authorization: Bearer <token>`

```
PATCH /admin/events/{eventId}/approval
```

**Request Body:**
```json
{
  "action": "APPROVE | REJECT",
  "reason": "Lý do từ chối (required nếu REJECT)"
}
```

**Response `200 OK`:**
```json
{
  "eventId": "uuid",
  "status": "APPROVED",
  "reviewedAt": "2025-01-11T09:00:00",
  "reviewedBy": "admin@example.com"
}
```

---

### 7.2 Manage Organizers (CRUD)

> **Role:** `ADMIN`  
> **Headers:** `Authorization: Bearer <token>`

#### Get all organizers
```
GET /admin/organizers?page=0&size=10&search=keyword
```

#### Get organizer detail
```
GET /admin/organizers/{organizerId}
```

#### Create organizer
```
POST /admin/organizers
```
```json
{
  "fullName": "Tran Thi B",
  "email": "organizer@example.com",
  "phone": "0909123456",
  "organizationName": "TechCorp Vietnam"
}
```

#### Update organizer
```
PUT /admin/organizers/{organizerId}
```

#### Delete organizer
```
DELETE /admin/organizers/{organizerId}
```

**Response `204 No Content`**

---

### 7.3 Manage Categories

> **Role:** `ADMIN`  
> **Headers:** `Authorization: Bearer <token>`

#### Get all categories
```
GET /admin/categories
```
**Response `200 OK`:**
```json
[
  { "categoryId": "uuid", "name": "Technology", "slug": "technology" },
  { "categoryId": "uuid", "name": "Music", "slug": "music" }
]
```

#### Create category
```
POST /admin/categories
```
```json
{ "name": "Sports", "slug": "sports" }
```

#### Update category
```
PUT /admin/categories/{categoryId}
```

#### Delete category
```
DELETE /admin/categories/{categoryId}
```

---

### 7.4 Configure Commission

> **Role:** `ADMIN`  
> **Headers:** `Authorization: Bearer <token>`

```
PUT /admin/settings/commission
```

**Request Body:**
```json
{
  "commissionRate": 10.0,
  "effectiveFrom": "2025-02-01"
}
```

**Response `200 OK`:**
```json
{
  "commissionRate": 10.0,
  "effectiveFrom": "2025-02-01",
  "updatedBy": "admin@example.com",
  "updatedAt": "2025-01-15T08:00:00"
}
```

---

### 7.5 System-wide Report

> **Role:** `ADMIN`  
> **Headers:** `Authorization: Bearer <token>`

```
GET /admin/reports/overview
```

**Query Parameters:**

| Parameter   | Type     | Required | Description              |
|-------------|----------|----------|--------------------------|
| `from`      | `string` | No       | ISO date `YYYY-MM-DD`    |
| `to`        | `string` | No       | ISO date `YYYY-MM-DD`    |

**Response `200 OK`:**
```json
{
  "totalEvents": 120,
  "totalOrganizers": 35,
  "totalAttendees": 5400,
  "totalRevenue": 850000000,
  "totalCommission": 85000000,
  "pendingApprovalEvents": 8,
  "topEvents": [
    {
      "eventId": "uuid",
      "title": "Music Festival 2025",
      "ticketsSold": 900,
      "revenue": 90000000
    }
  ]
}
```

---

## 8. Notifications

### 8.1 Get User Notifications

> **Role:** `ATTENDEE` / `ORGANIZER`  
> **Headers:** `Authorization: Bearer <token>`

```
GET /notifications
```

**Response `200 OK`:**
```json
{
  "content": [
    {
      "notificationId": "uuid",
      "title": "Sự kiện sắp diễn ra",
      "message": "Tech Conference 2025 sẽ diễn ra vào ngày mai.",
      "type": "EVENT_REMINDER",
      "read": false,
      "createdAt": "2025-06-14T08:00:00"
    }
  ],
  "totalElements": 10,
  "unreadCount": 3
}
```

---

### 8.2 Mark Notification as Read

> **Role:** `ATTENDEE` / `ORGANIZER`  
> **Headers:** `Authorization: Bearer <token>`

```
PATCH /notifications/{notificationId}/read
```

**Response `200 OK`:**
```json
{
  "notificationId": "uuid",
  "read": true
}
```

---

## 9. Error Codes

| HTTP Status | Error Code              | Description                              |
|-------------|-------------------------|------------------------------------------|
| `400`       | `VALIDATION_ERROR`      | Request body validation failed           |
| `401`       | `UNAUTHORIZED`          | Missing or invalid JWT token             |
| `403`       | `FORBIDDEN`             | Insufficient role/permission             |
| `404`       | `RESOURCE_NOT_FOUND`    | Event, ticket, or user not found         |
| `409`       | `TICKET_SOLD_OUT`       | No tickets remaining for this type       |
| `409`       | `ALREADY_CHECKED_IN`    | Ticket has already been checked in       |
| `409`       | `RESERVATION_EXPIRED`   | Reservation hết hạn trước khi thanh toán |
| `409`       | `RESERVATION_NOT_FOUND` | reservationId không tồn tại hoặc đã hủy |
| `422`       | `PAYMENT_FAILED`        | Payment gateway returned failure         |
| `500`       | `INTERNAL_SERVER_ERROR` | Unexpected server-side error             |

**Error Response Format:**
```json
{
  "timestamp": "2025-01-10T10:00:00",
  "status": 404,
  "error": "RESOURCE_NOT_FOUND",
  "message": "Event with id 'uuid' not found",
  "path": "/api/v1/events/uuid"
}
```

---

## Appendix: Role Permission Matrix

Ma trận này mô tả quyền truy cập của từng vai trò vào các nhóm chức năng trong hệ thống.

**Ký hiệu:**
- `Y` — Được phép truy cập / thực hiện
- `N` — Không có quyền truy cập

### Bảng tổng quan quyền theo nhóm chức năng

| Nhóm chức năng                  | Mô tả ngắn                                              | PUBLIC | ATTENDEE | ORGANIZER | ADMIN |
|---------------------------------|---------------------------------------------------------|:------:|:--------:|:---------:|:-----:|
| Search / View Events            | Tìm kiếm và xem thông tin sự kiện công khai             |   Y    |    Y     |     Y     |   Y   |
| Reserve Ticket                  | Đặt chỗ giữ vé trước khi thanh toán                    |   N    |    Y     |     N     |   N   |
| Purchase Ticket                 | Thanh toán và mua vé sự kiện                            |   N    |    Y     |     N     |   N   |
| E-Ticket / QR / History         | Xem vé điện tử, mã QR check-in và lịch sử giao dịch    |   N    |    Y     |     N     |   N   |
| Create / Edit Event             | Tạo mới hoặc chỉnh sửa thông tin sự kiện               |   N    |    N     |     Y     |   N   |
| Registrants / Sales             | Xem danh sách người đăng ký và thống kê doanh thu       |   N    |    N     |     Y     |   Y   |
| Organizer Check-in              | Quét mã QR và xác nhận check-in người tham dự          |   N    |    N     |     Y     |   N   |
| Send Notifications              | Gửi thông báo tới người tham dự của sự kiện             |   N    |    N     |     Y     |   Y   |
| Approve Events                  | Duyệt hoặc từ chối sự kiện do organizer tạo             |   N    |    N     |     N     |   Y   |
| Manage Organizers               | Tạo, xem, khoá hoặc xoá tài khoản organizer            |   N    |    N     |     N     |   Y   |
| Manage Categories               | Thêm, sửa, xoá danh mục sự kiện                        |   N    |    N     |     N     |   Y   |
| Configure Commission            | Cấu hình tỷ lệ hoa hồng hệ thống thu trên mỗi vé       |   N    |    N     |     N     |   Y   |
| System Reports                  | Xem báo cáo doanh thu, tăng trưởng toàn hệ thống        |   N    |    N     |     N     |   Y   |

---

### Mô tả chi tiết từng vai trò

#### PUBLIC (Khách chưa đăng nhập)
- Có thể duyệt danh sách sự kiện và xem chi tiết sự kiện đã được duyệt.
- Không thể thực hiện bất kỳ giao dịch nào (đặt vé, mua vé).
- Cần đăng ký tài khoản và đăng nhập để thực hiện các thao tác khác.

#### ATTENDEE (Người tham dự)
- Tìm kiếm, lọc và xem chi tiết sự kiện.
- Đặt chỗ (reserve) và thanh toán mua vé.
- Xem vé điện tử, tải mã QR check-in.
- Tra cứu lịch sử giao dịch và đơn hàng của bản thân.
- Không được tạo sự kiện hoặc quản lý sự kiện của người khác.

#### ORGANIZER (Nhà tổ chức)
- Tạo, chỉnh sửa và xoá sự kiện do mình quản lý (phải qua duyệt của ADMIN trước khi công bố).
- Xem danh sách người đăng ký và báo cáo doanh thu của từng sự kiện.
- Thực hiện check-in người tham dự bằng cách quét mã QR tại sự kiện.
- Gửi thông báo đến toàn bộ người đã đăng ký sự kiện của mình.
- Không có quyền quản lý hệ thống, danh mục, hay tài khoản người dùng khác.

#### ADMIN (Quản trị viên hệ thống)
- Duyệt hoặc từ chối các sự kiện do organizer gửi lên.
- Quản lý toàn bộ tài khoản organizer (tạo, khoá, xoá).
- Thêm, sửa, xoá danh mục sự kiện trong hệ thống.
- Cấu hình tỷ lệ hoa hồng áp dụng trên từng giao dịch bán vé.
- Xem báo cáo tổng hợp về doanh thu, số lượng sự kiện, tăng trưởng người dùng toàn hệ thống.
- Gửi thông báo hệ thống diện rộng đến các organizer hoặc nhóm người dùng.