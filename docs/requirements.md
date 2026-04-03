# Hệ Thống Quản Lý Sự Kiện (Event Management)

## Mô tả

**Bối cảnh:** Các tổ chức muốn tổ chức hội thảo, workshop nhưng việc bán vé, quản lý đăng ký, check-in thủ công rất mất thời gian và dễ sai sót.

**Giải pháp:** Xây dựng platform cho phép người tham dự tìm kiếm sự kiện, mua vé và thanh toán online, nhận e-ticket QR code và check-in. Organizer tạo sự kiện với nhiều loại vé, quản lý đăng ký, quét QR check-in và gửi email thông báo.

**Điểm thú vị:** E-ticket với QR code, check-in bằng quét mã, báo cáo bán vé theo loại, gửi email thông báo hàng loạt.

---

## Đối tượng sử dụng

| Đối tượng | Vai trò |
|-----------|---------|
| **Người tham dự (End User)** | Tìm sự kiện, mua vé, nhận QR, check-in |
| **Organizer (Business User)** | Tạo sự kiện, quản lý vé, check-in, email |
| **Admin** | Duyệt sự kiện, quản lý organizer, báo cáo |

---

## Tính năng chính

### NGƯỜI THAM DỰ (6 tính năng)

| # | Tính năng |
|---|-----------|
| 1 | Tìm kiếm sự kiện (category, location, date) |
| 2 | Xem chi tiết sự kiện |
| 3 | Mua vé và thanh toán online |
| 4 | Nhận e-ticket (QR Code) |
| 5 | Check-in bằng QR Code |
| 6 | Xem lịch sự kiện đã đăng ký |

### ORGANIZER (6 tính năng)

| # | Tính năng |
|---|-----------|
| 1 | Tạo sự kiện (thông tin, loại vé, giá) |
| 2 | Publish/unpublish sự kiện |
| 3 | Xem danh sách người đăng ký |
| 4 | Check-in người tham dự (quét QR) |
| 5 | Gửi email thông báo |
| 6 | Báo cáo bán vé |

### ADMIN (6 tính năng)

| # | Tính năng |
|---|-----------|
| 1 | Duyệt sự kiện mới |
| 2 | Quản lý organizer (CRUD) |
| 3 | Quản lý categories |
| 4 | Cấu hình commission |
| 5 | Báo cáo toàn hệ thống |
| 6 | Quản lý thông báo |
