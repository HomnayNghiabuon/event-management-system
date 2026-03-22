# Hướng dẫn cài đặt Backend Server

**Stack:** Spring Boot 4.0.4 · Java 25 · Maven · MySQL

---

## Yêu cầu

- Java JDK 25
- MySQL 8.0+
- Git

Maven không cần cài – project đã có sẵn `mvnw`.

---

## Các bước cài đặt

**1. Clone project**

```bash
git clone https://github.com/HomnayNghiabuon/event-management-system.git
cd event-management-system/event-management-server
```

**2. Tạo database**

```sql
CREATE DATABASE eventdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**3. Tạo file cấu hình**

```bash
copy .env.example .env
```

Mở `.env`, sửa dòng:

```env
DB_PASSWORD=password_mysql_cua_ban
```

Nếu MySQL không có password thì để trống.

**4. Chạy server**

```bash
run-dev.bat        # Windows
./run-dev.sh       # Mac / Linux
```

Server chạy tại `http://localhost:8081`

---

## Kiểm tra

Mở trình duyệt vào `http://localhost:8081/swagger-ui.html` để test API.

**Tài khoản test có sẵn (password: `123456`):**

| Email | Role |
|-------|------|
| admin@eventms.com | ADMIN |
| organizer@eventms.com | ORGANIZER |
| attendee@eventms.com | ATTENDEE |

---

## Lỗi thường gặp

**Connection refused / Communications link failure**
MySQL chưa chạy. Khởi động MySQL rồi thử lại.

**Access denied for user 'root'**
Sai password. Kiểm tra lại `DB_PASSWORD` trong `.env`.

**Unknown database 'eventdb'**
Chưa tạo database. Chạy lại lệnh ở bước 2.

**Port 8081 was already in use**

```bash
# Windows
netstat -ano | findstr :8081
taskkill /PID <pid> /F
```

Hoặc đổi `SERVER_PORT=8082` trong `.env`.
