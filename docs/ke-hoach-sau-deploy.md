# Kế hoạch sau deploy production

Cập nhật: 12/07/2026

## Trạng thái hiện tại

Hệ thống đã deploy production hoàn chỉnh ngày 11–12/07/2026 và được kiểm tra hoạt động đầu-cuối (danh sách sự kiện, đăng nhập cả 3 vai trò, CORS):

| Thành phần | Nền tảng | Địa chỉ |
|---|---|---|
| Frontend | Vercel | https://event-management-system-nghia.vercel.app |
| Backend | Render (Docker, gói Free 512MB) | https://event-management-system-fj77.onrender.com |
| Database | Railway MySQL (database `railway`) | đã seed 24 event, 3 tài khoản, 5 category, commission 5% |

Chi tiết cấu hình từng bước: xem [DEPLOYMENT.md](../DEPLOYMENT.md).

Lưu ý kỹ thuật quan trọng đã xử lý trong quá trình deploy (tránh lặp lại):
- Render Free chỉ có 512MB RAM → **bắt buộc** biến `JAVA_TOOL_OPTIONS=-Xmx300m -Xss512k -XX:+UseSerialGC`
- HQL có ngoặc lồng sâu làm parser ANTLR của Hibernate 6 ngốn heap → đã làm phẳng query `findPublished`
- `mvnw` commit từ Windows mất execute bit → Dockerfile đã có `chmod +x mvnw`
- `VITE_API_URL` phải có đuôi `/api/v1` và chỉ có hiệu lực sau khi **Redeploy** trên Vercel

## Việc cần làm

### Bảo mật (ưu tiên cao)
- [ ] Đổi mật khẩu 3 tài khoản seed (`admin/organizer/attendee@eventms.com` — đang là `123456`, công khai trong repo)
- [ ] Đổi `JPA_DDL_AUTO` từ `update` → `validate` trên Render (sau khi chạy ổn định vài ngày, tránh Hibernate tự sửa schema production)

### Vận hành
- [ ] Tạo monitor miễn phí trên uptimerobot.com ping `https://event-management-system-fj77.onrender.com/api/v1/events` mỗi 10 phút — chống cold start khi demo
- [ ] Bật Backups cho MySQL trên Railway (Settings của service)
- [ ] **Hạn chót ~10/08/2026:** trial Railway ($5/30 ngày, bắt đầu ~10/07/2026) sẽ hết — nạp $5 hoặc chuyển DB sang Aiven (gói MySQL free vĩnh viễn); nếu chuyển, export data bằng `mysqldump` rồi cập nhật `DB_URL` trên Render

### Dọn dẹp hạ tầng
- [ ] Chuyển project Vercel về connect repo chính `nguyenichnghia/event-management-system` (Settings → Git → Disconnect repo `-nghia` → Connect repo chính, Root Directory = `frontend`) — hiện đang dùng repo phụ `event-management-system-nghia`, phải push 2 nơi mỗi khi sửa frontend
- [ ] Xóa repo phụ `event-management-system-nghia` sau khi chuyển xong

### Tính năng / demo
- [ ] Test thanh toán Momo end-to-end trên production (IPN giờ về thẳng Render, không cần ngrok)
- [ ] Đăng ký credentials VNPay sandbox và điền `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET` trên Render (hiện để trống → VNPay chưa dùng được, Momo hoạt động bình thường)
- [ ] Tạo vài event mới có ngày trong tương lai bằng tài khoản organizer (nhiều event seed có ngày quá khứ, demo kém đẹp)
