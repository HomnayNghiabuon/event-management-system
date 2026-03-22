# Hướng dẫn cài đặt Backend Server

**Stack:** Spring Boot 4.0.4 · Java 25 · Maven · MySQL

---

## Yêu cầu

- Java JDK 25
- MySQL 8.0+
- Git

Maven không cần cài – project đã có sẵn `mvnw`.

---

## Lấy code

**Chưa có repo:**

```bash
git clone https://github.com/HomnayNghiabuon/event-management-system.git
cd event-management-system
git checkout dev
```

**Đã có repo (thành viên trong nhóm):**

```bash
git checkout dev
git pull origin dev
```

---

## Cài đặt

**1. Tạo database**

```sql
CREATE DATABASE eventdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**2. Tạo file cấu hình**

```bash
cd event-management-server
copy .env.example .env
```

Mở `.env`, sửa dòng:

```env
DB_PASSWORD=password_mysql_cua_ban
```

Nếu MySQL không có password thì để trống.

**3. Chạy server**

```bash
run-dev.bat        # Windows
./run-dev.sh       # Mac / Linux
```

Server chạy tại `http://localhost:8081`

---

## Kiểm tra

Mở `http://localhost:8081/swagger-ui.html` để test API.

**Tài khoản test có sẵn (password: `123456`):**

| Email | Role |
|-------|------|
| admin@eventms.com | ADMIN |
| organizer@eventms.com | ORGANIZER |
| attendee@eventms.com | ATTENDEE |

---

## Lỗi thường gặp

**Connection refused** – MySQL chưa chạy, khởi động lại MySQL.

**Access denied** – Sai password, kiểm tra lại `DB_PASSWORD` trong `.env`.

**Unknown database 'eventdb'** – Chưa tạo database, chạy lại lệnh ở bước 1.

**Port 8081 was already in use** – Đổi `SERVER_PORT=8082` trong `.env` hoặc tắt process đang chiếm port.
