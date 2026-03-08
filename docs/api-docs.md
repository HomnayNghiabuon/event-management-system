# Tài liệu API – Hệ thống Quản lý Sự kiện

**Base URL:** `http://localhost:8080/api`
**Xác thực:** JWT Bearer Token – đính kèm header `Authorization: Bearer <token>` cho các endpoint yêu cầu đăng nhập

---

## Mục lục

1. [Xác thực](#1-xác-thực)
2. [Sự kiện – dành cho người tham dự](#2-sự-kiện--dành-cho-người-tham-dự)
3. [Mua vé & Thanh toán](#3-mua-vé--thanh-toán)
4. [E-ticket & Check-in](#4-e-ticket--check-in)
5. [Organizer – Quản lý sự kiện](#5-organizer--quản-lý-sự-kiện)
6. [Admin](#6-admin)

---

## 1. Xác thực

### Đăng ký tài khoản
```
POST /auth/register
```
**Body:**
```json
{
  "hoTen": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "matKhau": "Abc@1234",
  "vaiTro": "ATTENDEE"
}
```
> `vaiTro` nhận một trong ba giá trị: `ATTENDEE`, `ORGANIZER`, `ADMIN`

**Response 201:**
```json
{
  "id": 1,
  "hoTen": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "vaiTro": "ATTENDEE"
}
```

---

### Đăng nhập
```
POST /auth/login
```
**Body:**
```json
{
  "email": "nguyenvana@gmail.com",
  "matKhau": "Abc@1234"
}
```
**Response 200:**
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "dGhpcyBp...",
  "loaiToken": "Bearer",
  "thoiHanMs": 86400000
}
```

---

### Làm mới token
```
POST /auth/refresh-token
```
**Body:**
```json
{
  "refreshToken": "dGhpcyBp..."
}
```
**Response 200:** trả về `accessToken` mới

---

### Đăng xuất
```
POST /auth/logout
```
*Yêu cầu đăng nhập.* Server sẽ vô hiệu hoá refresh token hiện tại.

---

## 2. Sự kiện – dành cho người tham dự

### Tìm kiếm sự kiện
```
GET /events
```
**Query params:**

| Tham số | Kiểu | Mô tả |
|---|---|---|
| `tuKhoa` | string | Tìm theo tên sự kiện |
| `danhMucId` | number | Lọc theo danh mục |
| `diaDiem` | string | Lọc theo địa điểm (tỉnh/thành) |
| `tuNgay` | date | Từ ngày (`yyyy-MM-dd`) |
| `denNgay` | date | Đến ngày (`yyyy-MM-dd`) |
| `trang` | number | Số trang, mặc định `0` |
| `kichThuoc` | number | Số bản ghi/trang, mặc định `12` |

**Response 200:**
```json
{
  "tongSo": 48,
  "trang": 0,
  "danhSach": [
    {
      "id": 10,
      "tenSuKien": "Hội thảo Công nghệ 2026",
      "danhMuc": "Công nghệ",
      "diaDiem": "Hà Nội",
      "ngayToChuc": "2026-04-15",
      "giaTuKhoang": 150000,
      "anhDaiDien": "https://...",
      "trangThai": "DANG_MO_BAN"
    }
  ]
}
```

---

### Xem chi tiết sự kiện
```
GET /events/{id}
```
**Response 200:**
```json
{
  "id": 10,
  "tenSuKien": "Hội thảo Công nghệ 2026",
  "moTa": "Sự kiện thường niên quy tụ các chuyên gia...",
  "diaDiem": "Trung tâm Hội nghị Quốc gia, Hà Nội",
  "ngayToChuc": "2026-04-15T08:00:00",
  "ngayKetThuc": "2026-04-15T17:00:00",
  "danhMuc": "Công nghệ",
  "organizer": {
    "id": 3,
    "tenToChuc": "Tech Community VN"
  },
  "loaiVe": [
    {
      "id": 1,
      "tenLoai": "Vé thường",
      "gia": 150000,
      "soLuongConLai": 200
    },
    {
      "id": 2,
      "tenLoai": "Vé VIP",
      "gia": 500000,
      "soLuongConLai": 30
    }
  ]
}
```

---

### Lịch sự kiện đã đăng ký
```
GET /users/me/su-kien
```
*Yêu cầu đăng nhập (ATTENDEE)*

**Response 200:**
```json
[
  {
    "donHangId": 55,
    "tenSuKien": "Workshop UI/UX cơ bản",
    "ngayToChuc": "2026-03-20T09:00:00",
    "diaDiem": "TP. Hồ Chí Minh",
    "trangThaiDonHang": "DA_THANH_TOAN",
    "soVe": 2
  }
]
```

---

## 3. Mua vé & Thanh toán

### Tạo đơn hàng
```
POST /orders
```
*Yêu cầu đăng nhập (ATTENDEE)*

**Body:**
```json
{
  "suKienId": 10,
  "chiTiet": [
    { "loaiVeId": 1, "soLuong": 2 },
    { "loaiVeId": 2, "soLuong": 1 }
  ]
}
```
**Response 201:**
```json
{
  "donHangId": 55,
  "tongTien": 800000,
  "trangThai": "CHO_THANH_TOAN",
  "thoiHanThanhToan": "2026-03-08T15:30:00"
}
```

---

### Thanh toán đơn hàng
```
POST /orders/{donHangId}/thanh-toan
```
*Yêu cầu đăng nhập (ATTENDEE)*

**Body:**
```json
{
  "phuongThuc": "VNPAY"
}
```
> `phuongThuc` hỗ trợ: `VNPAY`, `MOMO`, `ZALOPAY`

**Response 200:**
```json
{
  "urlThanhToan": "https://sandbox.vnpayment.vn/...",
  "maGiaoDich": "TXN20260308001"
}
```

---

### Callback thanh toán (webhook)
```
POST /orders/callback
```
Endpoint nhận kết quả từ cổng thanh toán. Hệ thống tự xử lý, không cần gọi từ client.

---

## 4. E-ticket & Check-in

### Lấy e-ticket (QR Code)
```
GET /orders/{donHangId}/tickets
```
*Yêu cầu đăng nhập (ATTENDEE)*

**Response 200:**
```json
[
  {
    "ticketId": "TK-20260308-001",
    "tenNguoiTham": "Nguyễn Văn A",
    "loaiVe": "Vé VIP",
    "qrCode": "data:image/png;base64,iVBORw0KGgo...",
    "trangThai": "CHUA_CHECK_IN"
  }
]
```
> `qrCode` là ảnh PNG encode base64, frontend render trực tiếp vào thẻ `<img>`.

---

### Check-in bằng QR Code
```
POST /checkin
```
*Yêu cầu đăng nhập (ORGANIZER)*

**Body:**
```json
{
  "maQR": "TK-20260308-001"
}
```
**Response 200:**
```json
{
  "thanhCong": true,
  "tenNguoiTham": "Nguyễn Văn A",
  "loaiVe": "Vé VIP",
  "thoiGianCheckIn": "2026-04-15T08:35:00"
}
```
**Response 400** (đã check-in rồi):
```json
{
  "loi": "Vé này đã được sử dụng lúc 08:20:00"
}
```

---

## 5. Organizer – Quản lý sự kiện

> Tất cả endpoint trong mục này yêu cầu đăng nhập với vai trò `ORGANIZER`.

### Tạo sự kiện
```
POST /organizer/events
```
**Body:**
```json
{
  "tenSuKien": "Workshop Thiết kế UI/UX 2026",
  "moTa": "Khoá học thực hành dành cho designer...",
  "danhMucId": 2,
  "diaDiem": "268 Lý Thường Kiệt, Q.10, TP.HCM",
  "ngayToChuc": "2026-05-10T08:30:00",
  "ngayKetThuc": "2026-05-10T17:00:00",
  "loaiVe": [
    { "tenLoai": "Early Bird", "gia": 200000, "soLuong": 50 },
    { "tenLoai": "Vé thường", "gia": 350000, "soLuong": 150 }
  ]
}
```
**Response 201:** trả về toàn bộ thông tin sự kiện vừa tạo, `trangThai: "CHO_DUYET"`.

---

### Publish / Unpublish sự kiện
```
PATCH /organizer/events/{id}/trang-thai
```
**Body:**
```json
{
  "trangThai": "DANG_MO_BAN"
}
```
> `trangThai` hợp lệ: `DANG_MO_BAN`, `TAM_DUNG`, `HUY`
> Chỉ sự kiện đã được admin duyệt mới có thể chuyển sang `DANG_MO_BAN`.

---

### Danh sách người đăng ký
```
GET /organizer/events/{id}/dang-ky
```
**Query params:** `trang`, `kichThuoc`, `trangThaiVe` (`CHUA_CHECK_IN` | `DA_CHECK_IN`)

**Response 200:**
```json
{
  "tongSo": 320,
  "danhSach": [
    {
      "ticketId": "TK-20260308-001",
      "hoTen": "Trần Thị B",
      "email": "tranthib@gmail.com",
      "loaiVe": "Early Bird",
      "ngayMua": "2026-03-01T10:15:00",
      "trangThai": "CHUA_CHECK_IN"
    }
  ]
}
```

---

### Gửi email thông báo
```
POST /organizer/events/{id}/thong-bao
```
**Body:**
```json
{
  "tieuDe": "Nhắc nhở: Sự kiện diễn ra vào ngày mai!",
  "noiDung": "Xin chào, sự kiện Workshop UI/UX sẽ bắt đầu lúc 8h30 ngày mai...",
  "guiDen": "TAT_CA"
}
```
> `guiDen` nhận: `TAT_CA`, `CHUA_CHECK_IN`, `DA_CHECK_IN`

**Response 200:**
```json
{
  "soEmailDaGui": 318,
  "trangThai": "DANG_GUI"
}
```
> Email được gửi bất đồng bộ qua queue, frontend có thể polling trạng thái nếu cần.

---

### Báo cáo bán vé
```
GET /organizer/events/{id}/bao-cao
```
**Response 200:**
```json
{
  "tongDoanhThu": 78500000,
  "tongVeDaBan": 318,
  "tongVeConLai": 32,
  "theoPhanLoai": [
    {
      "loaiVe": "Early Bird",
      "daBan": 50,
      "conLai": 0,
      "doanhThu": 10000000
    },
    {
      "loaiVe": "Vé thường",
      "daBan": 268,
      "conLai": 32,
      "doanhThu": 68500000
    }
  ],
  "bienDongTheoNgay": [
    { "ngay": "2026-03-01", "soBan": 45 },
    { "ngay": "2026-03-02", "soBan": 30 }
  ]
}
```

---

## 6. Admin

> Tất cả endpoint trong mục này yêu cầu đăng nhập với vai trò `ADMIN`.

### Danh sách sự kiện chờ duyệt
```
GET /admin/events/cho-duyet
```
**Response 200:** danh sách sự kiện có `trangThai: "CHO_DUYET"`, phân trang tương tự mục 2.

---

### Duyệt / Từ chối sự kiện
```
PATCH /admin/events/{id}/duyet
```
**Body:**
```json
{
  "quyetDinh": "CHAP_THUAN",
  "lyDo": ""
}
```
> `quyetDinh`: `CHAP_THUAN` hoặc `TU_CHOI`. Nếu từ chối, `lyDo` là bắt buộc.

---

### Quản lý Organizer

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/organizers` | Danh sách organizer (phân trang) |
| GET | `/admin/organizers/{id}` | Chi tiết một organizer |
| PATCH | `/admin/organizers/{id}/trang-thai` | Khoá / mở khoá tài khoản |
| DELETE | `/admin/organizers/{id}` | Xoá organizer |

---

### Quản lý danh mục

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/danh-muc` | Lấy toàn bộ danh mục |
| POST | `/admin/danh-muc` | Tạo danh mục mới |
| PUT | `/admin/danh-muc/{id}` | Cập nhật danh mục |
| DELETE | `/admin/danh-muc/{id}` | Xoá danh mục |

**Body tạo/sửa:**
```json
{
  "tenDanhMuc": "Âm nhạc",
  "icon": "music-note"
}
```

---

### Cấu hình commission
```
PUT /admin/cau-hinh/commission
```
**Body:**
```json
{
  "phanTramHoaHong": 5.0,
  "apDungTuNgay": "2026-04-01"
}
```
**Response 200:** trả về cấu hình hiện tại sau khi cập nhật.

---

### Báo cáo toàn hệ thống
```
GET /admin/bao-cao
```
**Query params:** `tuNgay`, `denNgay`

**Response 200:**
```json
{
  "tongSuKien": 142,
  "tongNguoiDung": 3850,
  "tongDoanhThu": 1245000000,
  "tongHoaHong": 62250000,
  "suKienTheoThang": [
    { "thang": "2026-01", "soSuKien": 18, "doanhThu": 210000000 },
    { "thang": "2026-02", "soSuKien": 24, "doanhThu": 380000000 }
  ]
}
```

---

### Quản lý thông báo hệ thống

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/thong-bao` | Danh sách thông báo đã gửi |
| POST | `/admin/thong-bao` | Gửi thông báo tới tất cả người dùng |
| DELETE | `/admin/thong-bao/{id}` | Xoá thông báo |

**Body gửi thông báo:**
```json
{
  "tieuDe": "Bảo trì hệ thống",
  "noiDung": "Hệ thống sẽ bảo trì từ 23h00 đến 01h00 ngày 10/04/2026.",
  "doiTuong": "TAT_CA"
}
```
> `doiTuong`: `TAT_CA`, `ATTENDEE`, `ORGANIZER`

---

## Mã lỗi chung

| HTTP | Mã lỗi | Ý nghĩa |
|---|---|---|
| 400 | `DU_LIEU_KHONG_HOP_LE` | Request body sai định dạng hoặc thiếu trường bắt buộc |
| 401 | `CHUA_DANG_NHAP` | Token không có hoặc đã hết hạn |
| 403 | `KHONG_CO_QUYEN` | Tài khoản không đủ quyền thực hiện hành động |
| 404 | `KHONG_TIM_THAY` | Tài nguyên không tồn tại |
| 409 | `XUNG_DOT_DU_LIEU` | Dữ liệu đã tồn tại (ví dụ: email trùng) |
| 500 | `LOI_HE_THONG` | Lỗi server, liên hệ admin |