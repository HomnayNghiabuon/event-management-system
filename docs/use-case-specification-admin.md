# Actor: Admin

- Mô tả: Người quản trị hệ thống, có toàn quyền kiểm soát dữ liệu và hoạt động

---

# UC-ADMIN-01: Duyệt sự kiện mới

- Tên: Duyệt sự kiện  
- Actor: Admin  

## Mô tả
- Admin xem và duyệt (approve hoặc reject) các sự kiện do Organizer tạo

## Tiền điều kiện
- Admin đã đăng nhập hệ thống  
- Có sự kiện ở trạng thái Pending  

## Hậu điều kiện
- Sự kiện được chuyển sang:
  - Approved  
  - hoặc Rejected  

## Luồng chính
- Admin truy cập danh sách sự kiện chờ duyệt  
- Hệ thống hiển thị danh sách  
- Admin chọn một sự kiện  
- Xem chi tiết  
- Chọn:
  - Approve → hệ thống cập nhật trạng thái  
  - Reject → nhập lý do → hệ thống lưu  

## Luồng phụ
- Reject không nhập lý do → báo lỗi  

---

# UC-ADMIN-02: Quản lý Organizer (CRUD)

- Tên: Quản lý Organizer  
- Actor: Admin  

## Mô tả
- Admin tạo, xem, sửa, xóa Organizer  

## Tiền điều kiện
- Admin đã đăng nhập  

## Hậu điều kiện
- Dữ liệu organizer được cập nhật  

## Luồng chính
- Admin mở danh sách organizer  
- Chọn chức năng:
  - Create → nhập thông tin → lưu  
  - Read → xem chi tiết  
  - Update → chỉnh sửa → lưu  
  - Delete → xác nhận → xóa  

## Luồng phụ
- Xóa organizer đang có sự kiện → không cho xóa  

---

# UC-ADMIN-03: Quản lý Categories

- Tên: Quản lý danh mục  
- Actor: Admin  

## Mô tả
- Admin quản lý các loại sự kiện  

## Luồng chính
- Admin truy cập categories  
- Thực hiện:
  - Thêm category  
  - Sửa category  
  - Xóa category  

## Luồng phụ
- Category đang được dùng → không cho xóa  

---

# UC-ADMIN-04: Cấu hình Commission

- Tên: Cấu hình hoa hồng  
- Actor: Admin  

## Mô tả
- Admin thiết lập phần trăm commission cho hệ thống  

## Luồng chính
- Admin mở trang cấu hình  
- Nhập phần trăm commission  
- Nhấn lưu  
- Hệ thống cập nhật  

## Luồng phụ
- Giá trị nhỏ hơn 0 hoặc lớn hơn 100 → báo lỗi  

---

# UC-ADMIN-05: Báo cáo toàn hệ thống

- Tên: Xem báo cáo  
- Actor: Admin  

## Mô tả
- Admin xem thống kê hệ thống  

## Luồng chính
- Admin chọn khoảng thời gian  
- Hệ thống hiển thị:
  - Doanh thu  
  - Số lượng sự kiện  
  - Số người dùng  
- Admin có thể export  

## Luồng phụ
- Không có dữ liệu → hiển thị No data  

---

# UC-ADMIN-06: Quản lý thông báo

- Tên: Quản lý thông báo  
- Actor: Admin  

## Mô tả
- Admin gửi thông báo tới người dùng hoặc organizer  

## Luồng chính
- Admin tạo thông báo  
- Nhập nội dung  
- Chọn đối tượng nhận  
- Gửi thông báo  

## Luồng phụ
- Nội dung trống → báo lỗi  
