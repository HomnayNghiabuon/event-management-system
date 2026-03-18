## Use Case Diagram 

![Use Case Diagram](Usecase_Diagram.png)

# ĐẶC TẢ USE CASE - HỆ THỐNG QUẢN LÝ SỰ KIỆN

---
# 2.1. Chức năng tìm kiếm sự kiện cho khách tham dự

## MÃ USECASE
UC01

## TÊN USECASE
Tìm kiếm sự kiện

## MÔ TẢ USECASE
Người tham dự tìm kiếm sự kiện theo địa điểm, theo ngày và theo danh mục.

## ACTOR CHÍNH
Người tham dự

## ACTOR PHỤ
Không có

## TIỀN ĐIỀU KIỆN
- Người dùng đã truy cập vào website sự kiện  
- Hệ thống đã có dữ liệu sự kiện trong cơ sở dữ liệu  

## LUỒNG CHÍNH
1. Người tham dự truy cập vào trang chủ  
2. Người tham dự chọn danh mục cần tìm  
3. Người tham dự chọn địa điểm cần tìm  
4. Người tham dự chọn thời gian diễn ra sự kiện  
5. Hệ thống tìm kiếm theo tiêu chí lọc đã chọn  
6. Hệ thống trả về danh sách sự kiện phù hợp  

## LUỒNG THAY THẾ
**6.1 Không có sự kiện phù hợp**
- Hệ thống thông báo không có sự kiện phù hợp  
- Người tham dự thay đổi bộ lọc để tìm lại  

## HẬU ĐIỀU KIỆN
- Trả về danh sách sự kiện theo bộ lọc  

---

# 2.2. Chức năng xem chi tiết sự kiện

## MÃ USECASE
UC02

## TÊN USECASE
Xem chi tiết sự kiện

## MÔ TẢ USECASE
Người tham dự xem chi tiết các sự kiện từ danh sách hoặc bộ lọc.

## ACTOR CHÍNH
Người tham dự

## TIỀN ĐIỀU KIỆN
- Người tham dự đã truy cập hệ thống  
- Sự kiện tồn tại  

## LUỒNG CHÍNH
1. Người tham dự truy cập danh sách sự kiện  
2. Hệ thống hiển thị danh sách  
3. Người tham dự chọn sự kiện  
4. Hệ thống hiển thị chi tiết:
   - Tiêu đề  
   - Mô tả  
   - Ngày  
   - Thời gian  
   - Địa điểm  
   - Hình ảnh  
   - Loại vé - giá vé  
5. Người tham dự có thể đặt vé  

## LUỒNG THAY THẾ
**Sự kiện không tồn tại**
- Thông báo lỗi  
- Quay lại danh sách  

## HẬU ĐIỀU KIỆN
- Hiển thị thông tin sự kiện  

---

# 2.3. Chức năng mua vé

## MÃ USECASE
UC03

## TÊN USECASE
Mua vé

## TIỀN ĐIỀU KIỆN
- Người dùng truy cập hệ thống  
- Sự kiện tồn tại  
- Vé còn  

## LUỒNG CHÍNH
1. Truy cập trang chi tiết  
2. Nhập CCCD, họ tên  
3. Chọn loại vé, số lượng  
4. Chọn phương thức thanh toán  
5. Nhấn mua vé  
6. Hiển thị thông tin  
7. Xác nhận  
8. Chuyển sang thanh toán  

## LUỒNG THAY THẾ
- Vé hết → không thể mua  
- Hủy → hủy yêu cầu  

## HẬU ĐIỀU KIỆN
- Tạo đơn vé  

---

# 2.4. Chức năng thanh toán

## MÃ USECASE
UC04

## ACTOR PHỤ
- Ngân hàng  
- Email System  

## LUỒNG CHÍNH
1. Hiển thị đơn hàng  
2. Nhấn thanh toán  
3. Tạo QR  
4. Quét QR  
5. Ngân hàng xử lý  
6. Xác nhận thành công  
7. Tạo vé QR  
8. Gửi email  
9. Thông báo thành công  

## LUỒNG THAY THẾ
- Thanh toán thất bại  
- Hủy thanh toán  

## HẬU ĐIỀU KIỆN
- Vé được tạo  
- Gửi email  

---

# 2.5. Xem lịch sử vé

## MÃ USECASE
UC05

## LUỒNG CHÍNH
1. Đăng nhập  
2. Vào lịch sử vé  
3. Hiển thị danh sách  
4. Xem chi tiết:
   - Tên sự kiện  
   - Thời gian  
   - Địa điểm  
   - Loại vé  
   - Giá  
   - Trạng thái  
   - QR  

## LUỒNG THAY THẾ
- Không có vé  

---

# 2.6. Đăng nhập (Organizer)

## MÃ USECASE
UC06

## ACTOR CHÍNH
Người tổ chức sự kiện

## LUỒNG CHÍNH
1. Chọn đăng nhập  
2. Nhập email + password  
3. Chọn tổ chức  
4. Đăng nhập thành công  
5. Vào dashboard  

## LUỒNG THAY THẾ
- Sai thông tin  

---

# 2.7. Đăng ký (Organizer)

## MÃ USECASE
UC07

## LUỒNG CHÍNH
1. Chọn đăng ký  
2. Nhập thông tin  
3. Đăng ký thành công  
4. Chờ duyệt  

---

# 2.8. Tạo sự kiện

## MÃ USECASE
UC08

## LUỒNG CHÍNH
1. Chọn tạo sự kiện  
2. Nhập:
   - Tiêu đề  
   - Mô tả  
   - Ngày  
   - Giờ  
   - Địa điểm  
   - Hình ảnh  
3. Nhấn đăng  
4. Chuyển sang trạng thái chờ duyệt  

## LUỒNG THAY THẾ
- Thu hồi sự kiện  

---

# 2.9. Xem danh sách đăng ký

## MÃ USECASE
UC09

## LUỒNG CHÍNH
1. Chọn sự kiện  
2. Xem danh sách đăng ký  
3. Hiển thị thông tin  
4. Có thể gửi email  

## LUỒNG THAY THẾ
- Chưa có người đăng ký  

---

# 2.10. Báo cáo bán vé

## MÃ USECASE
UC10

## LUỒNG CHÍNH
1. Chọn sự kiện  
2. Xem báo cáo  
3. Hiển thị:
   - Vé bán  
   - Vé còn  
   - Doanh thu  

---

# 2.11. Check-in QR

## MÃ USECASE
UC11

## LUỒNG CHÍNH
1. Chọn check-in  
2. Scan QR  
3. Kiểm tra hợp lệ  
4. Hiển thị thông tin người dùng  

## LUỒNG THAY THẾ
- Vé không hợp lệ  

## HẬU ĐIỀU KIỆN
- Hiển thị thông tin người tham dự  
