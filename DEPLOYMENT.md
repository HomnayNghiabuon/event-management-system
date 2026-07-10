# Hướng dẫn Deploy Production

Kiến trúc production:

| Thành phần | Nền tảng | Chi phí |
|-----------|----------|---------|
| Frontend (React + Vite) | [Vercel](https://vercel.com) | Miễn phí |
| Backend (Spring Boot, Docker) | [Render](https://render.com) | Miễn phí (có cold start) |
| Database (MySQL 8) | [Railway](https://railway.app) | ~$5 credit trial |

```
Người dùng ──► Vercel (React SPA) ──► Render (Spring Boot API) ──► Railway (MySQL)
                                            │
                     VNPay/Momo IPN ────────┘ (gọi thẳng, không cần ngrok)
```

> Code đã được chuẩn bị sẵn cho production:
> - Frontend đọc API URL từ biến `VITE_API_URL` (`frontend/src/api/client.js`)
> - CORS đọc từ biến `APP_CORS_ALLOWED_ORIGINS` (`CorsConfig.java`)
> - Server tự nhận biến `PORT` do Render inject (`application.yaml`)
> - `frontend/vercel.json` rewrite mọi route về `index.html` (React Router)

---

## Bước 1 — Tạo MySQL trên Railway

1. Đăng nhập [railway.app](https://railway.app) (bằng GitHub).
2. **New Project → Deploy MySQL**.
3. Vào service MySQL → tab **Variables**, ghi lại: `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE` (mặc định là `railway`).
4. (Tùy chọn) Tạo database riêng tên `eventdb`: tab **Data** → Query:
   ```sql
   CREATE DATABASE eventdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   Nếu bỏ qua bước này, dùng luôn database `railway` có sẵn.

`DB_URL` sẽ có dạng:

```
jdbc:mysql://<MYSQLHOST>:<MYSQLPORT>/eventdb?useSSL=true&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true
```

Bảng và dữ liệu mẫu sẽ được tạo tự động ở lần khởi động backend đầu tiên (Hibernate `ddl-auto=update` + `data.sql` + `DataInitializer`).

---

## Bước 2 — Deploy Backend lên Render

1. Push code lên GitHub.
2. Đăng nhập [render.com](https://render.com) → **New → Web Service** → connect repo.
3. Cấu hình:
   - **Root Directory:** `event-management-server`
   - **Runtime:** Docker (Render tự nhận `Dockerfile`)
   - **Instance Type:** Free
4. Thêm **Environment Variables**:

| Biến | Giá trị |
|------|--------|
| `DB_URL` | JDBC URL ở Bước 1 |
| `DB_DRIVER` | `com.mysql.cj.jdbc.Driver` |
| `DB_USERNAME` | `MYSQLUSER` từ Railway (thường là `root`) |
| `DB_PASSWORD` | `MYSQLPASSWORD` từ Railway |
| `JPA_PLATFORM` | `org.hibernate.dialect.MySQLDialect` |
| `JPA_DDL_AUTO` | `update` — sau khi chạy ổn định, đổi thành `validate` |
| `JPA_SHOW_SQL` | `false` |
| `H2_CONSOLE_ENABLED` | `false` |
| `JWT_SECRET` | **Tạo mới**: `openssl rand -base64 64` (KHÔNG dùng secret dev) |
| `JWT_EXPIRATION` | `3600000` |
| `JWT_REFRESH_EXPIRATION` | `604800000` |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | Như tài khoản Cloudinary đang dùng |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | Như cấu hình Gmail SMTP local |
| `APP_CORS_ALLOWED_ORIGINS` | URL Vercel — điền sau Bước 3, ví dụ `https://event-ms.vercel.app` |
| `APP_RETURN_BASE_URL` | URL Vercel — điền sau Bước 3 |
| `APP_IPN_BASE_URL` | Chính URL Render của backend, ví dụ `https://event-ms-api.onrender.com` |
| `VNPAY_TMN_CODE` / `VNPAY_HASH_SECRET` | Như sandbox local |
| `MOMO_PARTNER_CODE` / `MOMO_ACCESS_KEY` / `MOMO_SECRET_KEY` | Như sandbox local |

   > Không cần đặt `SERVER_PORT` — Render tự inject `PORT` và app tự nhận.

5. **Create Web Service** → chờ build (~5-10 phút lần đầu).
6. Kiểm tra: mở `https://<tên-app>.onrender.com/swagger-ui.html`.

### Lưu ý gói Free của Render

- Server **ngủ sau 15 phút** không có traffic; request đầu sau đó mất ~50 giây.
- Khi demo: mở trang trước vài phút để server "thức".
- IPN thanh toán có thể timeout nếu server đang ngủ → khi test thanh toán, đảm bảo backend đang chạy.
- Muốn hết cold start: nâng lên gói Starter ($7/tháng) hoặc dùng dịch vụ ping định kỳ (UptimeRobot, cron-job.org — ping `/swagger-ui.html` mỗi 10 phút).

---

## Bước 3 — Deploy Frontend lên Vercel

1. Đăng nhập [vercel.com](https://vercel.com) (bằng GitHub) → **Add New → Project** → chọn repo.
2. Cấu hình:
   - **Root Directory:** `frontend`
   - Framework tự nhận **Vite** (build: `npm run build`, output: `dist`)
3. Thêm **Environment Variable**:
   - `VITE_API_URL` = `https://<tên-app>.onrender.com/api/v1`
4. **Deploy** → nhận URL dạng `https://<tên-app>.vercel.app`.
5. **Quay lại Render**, cập nhật 2 biến rồi để Render tự redeploy:
   - `APP_CORS_ALLOWED_ORIGINS` = `https://<tên-app>.vercel.app`
   - `APP_RETURN_BASE_URL` = `https://<tên-app>.vercel.app`

> Lưu ý: biến `VITE_*` được **nhúng lúc build**. Nếu đổi giá trị, phải Redeploy trên Vercel mới có hiệu lực.

---

## Bước 4 — Kiểm tra sau deploy

- [ ] Mở trang Vercel, danh sách event hiển thị (API + CORS hoạt động)
- [ ] Đăng nhập `admin@eventms.com` / `123456` (data seed thành công)
- [ ] Đăng ký tài khoản mới → nhận email (SMTP hoạt động)
- [ ] Tạo event có ảnh (Cloudinary hoạt động)
- [ ] Đặt vé CASH → xem QR ticket (luồng reservation + ZXing)
- [ ] Thanh toán VNPay sandbox end-to-end (IPN gọi về Render, không cần ngrok)
- [ ] F5 ở trang con (ví dụ `/events/1`) không bị 404 (vercel.json rewrite)

## Bước 5 — Siết chặt sau khi ổn định

- Đổi `JPA_DDL_AUTO` từ `update` → `validate` trên Render (tránh Hibernate tự sửa schema).
- Đổi mật khẩu các tài khoản seed hoặc xóa chúng nếu không dùng để demo.
- Bật **Backups** cho MySQL trên Railway (Settings của service).

## Cập nhật phiên bản mới

Chỉ cần `git push` — cả Render và Vercel đều auto-deploy khi có commit mới trên branch đã kết nối.
