# BuyTicket – Hệ thống quản lý sự kiện & bán vé

Ứng dụng web full-stack cho phép tổ chức sự kiện, bán vé trực tuyến và check-in người tham dự bằng mã QR.

## Tính năng chính

**Người tham dự (Attendee)**
- Đăng ký, đăng nhập, quản lý hồ sơ
- Xem danh sách sự kiện, lọc theo danh mục
- Đặt vé nhiều loại (VIP / Standard / Economy) với giỏ hàng tạm giữ 10 phút
- Thanh toán qua MoMo, VNPay, hoặc tiền mặt
- Xem & tải xuống vé (ảnh PNG có mã QR)
- Nhận email xác nhận đặt vé tự động

**Ban tổ chức (Organizer)**
- Tạo và quản lý sự kiện (tiêu đề, mô tả, địa điểm, bản đồ, ảnh thumbnail)
- Tạo nhiều loại vé với giá và số lượng riêng
- Gửi email thông báo hàng loạt đến người tham dự
- Check-in bằng mã QR: nhập thủ công hoặc quét camera trực tiếp
- Xem thống kê doanh thu và tỷ lệ check-in

**Quản trị viên (Admin)**
- Duyệt / từ chối sự kiện của organizer
- Quản lý toàn bộ người dùng và sự kiện
- Xem dashboard tổng quan hệ thống

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Backend | Java 21, Spring Boot 3.4.5, Spring Security, JWT |
| Database | MySQL 8, JPA/Hibernate |
| Frontend | React 18, Vite, React Router 7, Tailwind CSS 4 |
| Lưu trữ ảnh | Cloudinary |
| Email | JavaMailSender (SMTP Gmail) |
| Build | Maven (backend), npm (frontend) |

## Cài đặt & chạy

### Yêu cầu
- Java 21+
- Node.js 18+
- MySQL 8

### 1. Tạo database

```sql
CREATE DATABASE eventdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Cấu hình backend

```bash
cd event-management-server
cp .env.example .env
```

Điền các biến trong `.env`:

```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_jwt_secret

# Cloudinary (tùy chọn – để upload ảnh thumbnail)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email SMTP (tùy chọn – để gửi xác nhận đặt vé)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

### 3. Chạy backend

```bash
# Windows
.\run-dev.bat

# Mac / Linux
./run-dev.sh
```

Backend khởi động tại `http://localhost:8081`  
Swagger UI: `http://localhost:8081/swagger-ui.html`

### 4. Chạy frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại `http://localhost:5173`

## Cấu trúc dự án

```
event-management-system/
├── event-management-server/        # Spring Boot API
│   └── src/main/java/.../
│       ├── controller/             # REST endpoints
│       ├── service/                # Business logic
│       ├── repository/             # JPA repositories
│       ├── model/                  # Entities (User, Event, Ticket, Order, ...)
│       ├── dto/                    # Request / Response DTOs
│       ├── config/                 # Security, CORS, JWT
│       └── exception/              # Custom exception handlers
├── frontend/                       # React SPA
│   └── src/
│       ├── pages/
│       │   ├── public/             # Trang công khai (Home, Login, Register, EventDetail)
│       │   ├── attendee/           # Vé, đơn hàng, hồ sơ
│       │   ├── organizer/          # Quản lý sự kiện, check-in, thống kê
│       │   └── admin/              # Dashboard quản trị
│       ├── components/             # UI dùng chung (Header, BookingFlow, ...)
│       ├── api/                    # Axios modules
│       └── contexts/               # AuthContext
└── database/                       # Scripts SQL
```

## API

- Base URL: `http://localhost:8081/api/v1`
- Xác thực: JWT Bearer token (tự động refresh qua interceptor)
- Tài liệu đầy đủ: Swagger UI tại `/swagger-ui.html`

## Luồng đặt vé

1. Người dùng chọn sự kiện → chọn loại vé và số lượng
2. Hệ thống tạm giữ vé 10 phút (`PENDING`)
3. Nhập thông tin người tham dự
4. Chọn phương thức thanh toán → xác nhận
5. Hệ thống tạo vé với mã QR, gửi email xác nhận
6. Organizer check-in tại sự kiện bằng cách quét QR

## Luồng duyệt sự kiện

`DRAFT` → Organizer submit → `PENDING` → Admin duyệt → `PUBLISHED` / `REJECTED`
