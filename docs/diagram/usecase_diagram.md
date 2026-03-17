## Use Case Diagram 

![Use Case Diagram](Usecase_Diagram.png)

# ĐẶC TẢ USE CASE - HỆ THỐNG QUẢN LÝ SỰ KIỆN

---

## UC01 - Tìm kiếm sự kiện

### Mô tả
Người dùng tìm kiếm sự kiện theo địa điểm, theo ngày và theo danh mục.

### Actor chính
- Người tham dự

### Actor phụ
- Không có

### Tiền điều kiện
- Người dùng đã truy cập vào website sự kiện  
- Hệ thống đã có dữ liệu sự kiện trong cơ sở dữ liệu  

### Luồng chính
1. Người dùng truy cập vào trang chủ  
2. Người dùng chọn danh mục cần tìm  
3. Người dùng chọn địa điểm cần tìm  
4. Người dùng chọn thời gian diễn ra sự kiện  
5. Hệ thống sẽ tìm kiếm theo tiêu chí lọc đã chọn  
6. Hệ thống trả lại danh sách sự kiện phù hợp  

### Luồng thay thế
**6.1 Không có sự kiện phù hợp**
- 6.1.1 Hệ thống thông báo không có sự kiện phù hợp  
- 6.1.2 Người dùng thay đổi bộ lọc để tìm lại  

### Hậu điều kiện
- Trả về danh sách sự kiện theo bộ lọc  

---

## UC02 - Xem chi tiết sự kiện

### Mô tả
Người dùng xem chi tiết các sự kiện từ danh sách hoặc bộ lọc.

### Actor chính
- Người tham dự

### Actor phụ
- Không có

### Tiền điều kiện
- Người dùng đã truy cập vào website  
- Sự kiện đã tồn tại trong hệ thống  

### Luồng chính
1. Người dùng vào danh sách hoặc lọc sự kiện  
2. Hệ thống hiển thị danh sách sự kiện  
3. Người dùng chọn 1 sự kiện  
4. Hệ thống nhận yêu cầu  
5. Hệ thống hiển thị chi tiết:
   - Tiêu đề sự kiện  
   - Mô tả  
   - Ngày diễn ra  
   - Giờ bắt đầu - kết thúc  
   - Địa điểm  
   - Hình ảnh  
   - Các loại vé - giá vé  
6. Người dùng có thể đặt vé  

### Luồng thay thế
**5.1 Sự kiện không tồn tại**
- 5.1.1 Thông báo lỗi  
- 5.1.2 Quay lại danh sách  

### Hậu điều kiện
- Hiển thị thông tin chi tiết sự kiện  

---

## UC03 - Mua vé

### Mô tả
Người dùng chọn và mua vé sự kiện.

### Actor chính
- Người tham dự

### Actor phụ
- Không có

### Tiền điều kiện
- Người dùng truy cập hệ thống  
- Sự kiện tồn tại  
- Vé còn  

### Luồng chính
1. Truy cập trang chi tiết sự kiện  
2. Nhập CCCD, họ tên, chọn loại vé & số lượng  
3. Chọn phương thức thanh toán  
4. Nhấn "Mua vé"  
5. Hiển thị thông tin đơn & tổng tiền  
6. Người dùng xác nhận  
7. Chuyển sang thanh toán  

### Luồng thay thế
**2.1 Vé hết**
- Thông báo hết vé  
- Không thể mua  

**5.1 Hủy mua**
- Hủy yêu cầu  

### Hậu điều kiện
- Tạo thông tin vé  
- Chuyển sang thanh toán  

---

## UC04 - Thanh toán vé

### Mô tả
Người dùng thanh toán vé sau khi đặt.

### Actor chính
- Người tham dự  

### Actor phụ
- Ngân hàng  
- Email System  

### Tiền điều kiện
- Đã chọn vé  
- Có đơn tạm  
- Đang ở bước thanh toán  

### Luồng chính
1. Hiển thị đơn hàng  
2. Người dùng nhấn thanh toán  
3. Tạo QR / link thanh toán  
4. Người dùng thanh toán qua app ngân hàng  
5. Ngân hàng xử lý  
6. Trả kết quả thành công  
7. Xác nhận thanh toán  
8. Tạo QR vé điện tử  
9. Gửi email vé  
10. Hiển thị "Thanh toán thành công"  

### Luồng thay thế
**5.1 Thanh toán thất bại**
- Hiển thị lỗi  
- Cho phép thanh toán lại  

**4.1 Hủy thanh toán**
- Không thanh toán  
- Hệ thống tự hủy đơn  

### Hậu điều kiện
- Vé điện tử được tạo  
- Gửi QR qua email  
- Lưu vào tài khoản  

---

## UC05 - Xem lịch sử vé đã mua

### Mô tả
Người dùng xem lại các vé đã mua.

### Actor chính
- Người tham dự  

### Actor phụ
- Không có  

### Tiền điều kiện
- Đã đăng nhập  
- Đã mua ít nhất 1 vé  

### Luồng chính
1. Đăng nhập  
2. Truy cập lịch sử vé  
3. Hiển thị danh sách vé  
4. Chọn 1 vé  
5. Hiển thị chi tiết:
   - Tên sự kiện  
   - Thời gian  
   - Địa điểm  
   - Loại vé  
   - Giá  
   - Trạng thái  
   - QR code  
6. Người dùng xem  

### Luồng thay thế
**3.1 Không có vé**
- Hiển thị "Bạn chưa mua vé nào"  

### Hậu điều kiện
- Hiển thị thông tin vé đã mua  