## Use Case Diagram 

![Use Case Diagram](Usecase_Diagram.png)

# ĐẶC TẢ USE CASE - HỆ THỐNG QUẢN LÝ SỰ KIỆN

---
## 2.1. chức năng tìm kiếm sự kiện cho khách tham dự

**Mã usecase:** UC01  
**Tên usecase:** Tìm kiếm sự kiện  

**Mô tả usecase:**  
Người tham dự tìm kiếm sự kiện theo địa điểm, theo ngày và theo danh mục  

**Actor chính:**  
người tham dự  

**Actor phụ:**  
không có  

**Tiền điều kiện:**  
- Người dùng đã truy cập vào website sự kiện  
- Hệ thống đã có dữ liệu sự kiện trong cơ sở dữ liệu  

**Luồng chính:**  
1. Người tham dự truy cập vào trang chủ  
2. Người tham dự chọn danh mục cần tìm  
3. Người tham dự chọn địa điểm cần tìm  
4. Người tham dự chọn thời gian diễn ra sự kiện  
5. Hệ thống sẽ tìm kiếm theo tiêu chí lọc đã chọn  
6. Hệ thống trả lại các danh sách sự kiện đã lọc phù hợp với bộ lọc  

**Luồng thay thế:**  
- 6.1 Không có sự kiện phù hợp  
  - 6.1.1. Hệ thống thông báo không có sự kiện phù hợp  
  - 6.1.2. Người tham dự thay đổi bộ lọc để tìm lại  

**Hậu điều kiện:**  
- Trả về danh sách sự kiện theo bộ lọc  

---

## 2.2. chức năng xem chi tiết sự kiện cho Người tham dự

**Mã usecase:** UC02  
**Tên usecase:** Xem chi tiết sự kiện  

**Mô tả usecase:**  
Người tham dự vào danh sách sự kiện hoặc dùng bộ lọc để xem chi tiết các sự kiện  

**Actor chính:**  
Người tham dự  

**Actor phụ:**  
không có  

**Tiền điều kiện:**  
- Người tham dự đã truy cập vào website sự kiện  
- Sự kiện đã tồn tại trong hệ thống  

**Luồng chính:**  
1. Người tham dự vào danh sách sự kiện hoặc lọc sự kiện theo bộ lọc  
2. Hệ thống hiển thị danh sách các sự kiện  
3. Người tham dự chọn 1 sự kiện muốn xem  
4. Hệ thống nhập yêu cầu xem chi tiết  
5. Hệ thống hiển thị chi tiết sự kiện như:  
   - 5.1. Tiêu đề sự kiện  
   - 5.2. Mô tả sự kiện  
   - 5.3. Ngày diễn ra sự kiện  
   - 5.4. giờ bắt đầu - giờ kết thúc  
   - 5.5. địa điểm  
   - 5.6. Hình ảnh  
   - 5.7. các loại vé - giá vé  
6. Người tham dự có thể đặt vé  

**Luồng thay thế:**  
- 5.1. Sự kiện không tồn tại hoặc bị xóa  
  - 5.1.1. Hệ thống thông báo sự kiện không tồn tại  
  - 5.1.2. Người tham dự quay lại trang danh sách sự kiện  

**Hậu điều kiện:**  
- Thông tin sự kiện được hiển thị cho Người tham dự  

---

## 2.3. chức năng mua vé cho Người tham dự

**Mã usecase:** UC03  
**Tên usecase:** Mua vé  

**Mô tả usecase:**  
Người tham dự xem danh sách sự kiện và lọc theo bộ lọc và mua vé theo nhu cầu  

**Actor chính:**  
người tham dự  

**Actor phụ:**  
không có  

**Tiền điều kiện:**  
- Người tham dự truy cập vào hệ thống website  
- Sự kiện đã tồn tại trên hệ thống  
- Vé của sự kiện vẫn còn  

**Luồng chính:**  
1. Người tham dự truy cập trang chi tiết sự kiện  
2. Người tham dự nhập CCCD và họ tên rồi chọn loại vé muốn mua và số lượng  
3. Người tham dự chọn phương thức thanh toán  
4. Người tham dự nhấn nút mua vé  
5. Hiển thị thông tin đặt vé và tổng tiền thanh toán  
6. Người tham dự xác nhận thông tin vé  
7. Hệ thống chuyển sang bước thanh toán  

**Luồng thay thế:**  
- 2.1. Vé đã hết  
  - 2.1.1. Hệ thống hiển thị thông báo “vé hết”  
  - 2.1.2. Người tham dự không thể tiếp tục mua vé  
- 5.1. Người tham dự hủy vé  
  - 5.1.1. Hệ thống hủy yêu cầu mua vé  

**Hậu điều kiện:**  
- Thông tin vé được tạo trong hệ thống  
- Người tham dự được chuyển sang quy trình thanh toán  

---

## 2.4. chức năng thanh toán vé cho Người tham dự

**Mã usecase:** UC04  
**Tên usecase:** Thanh toán vé  

**Mô tả usecase:**  
người dùng thanh toán vé sao khi điền thông tin vé và được chuyển sang quy trình thanh toán  

**Actor chính:**  
người tham dự  

**Actor phụ:**  
Ngân hàng, Email System  

**Tiền điều kiện:**  
- Người dùng đã chọn loại vé và số lượng vé  
- Hệ thống đã tạo đơn đặt vé tạm thời  
- Người dùng đang ở trạng thanh toán  

**Luồng chính:**  
1. Hệ thống hiển thị thông tin đơn hàng  
2. Người dùng nhấn thanh toán  
3. Hệ thống tạo mã QR hoặc liên kết thanh toán  
4. Người dùng mở ứng dụng ngân hàng để quét QR thanh toán  
5. Ngân hàng xử lý giao dịch  
6. Ngân hàng gửi thông báo thành công về hệ thống  
7. Hệ thống xác nhận thành công  
8. Hệ thống tạo QR điện tử cho người dùng  
9. Hệ thống gửi vé thông tin sự kiện QR điện tử cho người dùng thông qua email  
10. Hiển thị thông báo “Thanh toán thành công”  

**Luồng thay thế:**  
- 5.1. Thanh toán thất bại  
  - 5.1.1. Ngân hàng trả về trạng thái thanh toán thất bại  
  - 5.1.2. Hệ thống hiển thị thông báo thanh toán không thành công  
  - 5.1.3. Người dùng có thể thanh toán lại  
- 4.1. Người dùng hủy thanh toán  
  - 4.1.1. Người dùng không thực hiện thanh toán  
  - 4.1.2. Hệ thống hủy đơn đặt hàng tạm thời sau 1 khoảng thời gian  

**Hậu điều kiện:**  
- Vé điện tử được tạo trong hệ thống  
- Người dùng nhận QR code vé qua email  
- Vé được lưu trong tài khoản người dùng  

---

## 2.5. chức năng xem lịch sử vé đã mua cho Người tham dự

**Mã usecase:** UC05  
**Tên usecase:** xem lịch sử vé đã mua  

**Mô tả usecase:**  
Sau khi mua vé thành công người dùng có nhu cầu xem lại thông tin của vé đã mua  

**Actor chính:**  
người tham dự  

**Actor phụ:**  
không có  

**Tiền điều kiện:**  
- Người dùng đã đăng nhập vào hệ thống  
- Người dùng đã mua ít nhất 1 vé sự kiện trước đó  

**Luồng chính:**  
1. Người dùng đăng nhập vào hệ thống  
2. Người dùng truy cập mục Lịch sử vé đã mua  
3. Hệ thống hiển thị danh sách các vé sự kiện mà người dùng đã mua  
4. Người dùng chọn 1 vé trong danh sách  
5. Hệ thống hiển thị chi tiết vé gồm:  
   - 5.1. Tên sự kiện  
   - 5.2. Thời gian diễn ra  
   - 5.3. địa điểm  
   - 5.4. loại vé  
   - 5.5. giá vé  
   - 5.6. trạng thái vé  
   - 5.7. Mã QR code của vé  
6. Người dùng xem thông tin chi tiết vé  

**Luồng thay thế:**  
- 3.1. Không có vé đã mua  
  - 3.1.1. Hệ thống hiển thị thông báo “bạn chưa mua vé nào”  

**Hậu điều kiện:**  
- Thông tin chi tiết vé đã mua được hiển thị cho người dùng  

---

## 2.6. chức năng đăng nhập cho người tổ chức sự kiện.

**Mã usecase:** UC06  
**Tên usecase:** đăng nhập  

**Mô tả usecase:**  
người tổ chức sự kiện đăng nhập vào hệ thống  

**Actor chính:**  
người tham dự  

**Actor phụ:**  
không có  

**Tiền điều kiện:**  
- Người tổ chức sự kiện phải đăng ký ít nhất 1 tài khoản  
- Người tổ chức đã được admin duyệt tài khoản  

**Luồng chính:**  
1. Người tổ chức sự kiện chọn chức năng đăng nhập  
2. Sau đó sẽ hiển thị ra trang đăng nhập với 2 button là đăng nhập cho người tổ chức và đăng ký cho người tổ chức  
3. Click chọn đăng nhập cho người tổ chức  
4. Chuyển đổi trang yêu cầu người tổ chức nhập username bằng email và password  
   và chọn địa điểm làm việc  
5. Thông báo đăng nhập thành công  
6. Chuyển trang về trang quản trị cho người tổ chức  

**Luồng thay thế:**  
- 5.1. Sai thông tin đăng nhập  
  - 5.1.1 thông báo lỗi yêu cầu nhập lại  
  - 5.1.2 chọn sai tổ chức làm việc yêu cầu chọn lại  

**Hậu điều kiện:**  
- Đăng nhập thành công vào trang quản trị để sử dụng các chức năng của người tổ chức sự kiện  

---

## 2.7. chức năng đăng ký cho người tổ chức sự kiện.

**Mã usecase:** UC07  
**Tên usecase:** đăng ký  

**Mô tả usecase:**  
người tổ chức sự kiện đăng ký tài khoản  

**Actor chính:**  
người tổ chức sự kiện  

**Actor phụ:**  
không có  

**Tiền điều kiện:**  
- Người tổ chưa có tài khoản  

**Luồng chính:**  
1. Người tổ chức sự kiện chọn chức năng đăng nhập  
2. Sau đó sẽ hiển thị ra trang đăng nhập với 2 button là đăng nhập cho người tổ chức và đăng ký cho người tổ chức  
3. Người tổ chức click chọn chức năng đăng ký tài khoản  
4. Yêu cầu Người tổ chức nhập và chọn đầy đủ thông tin và không được để trống  
5. Thông báo đăng ký thành công  
6. Thông báo tài khoản sẽ được duyệt và được thông báo qua email trong vòng 2 ngày sau  

**Luồng thay thế:**  
- 4.1. Nhập thiếu thông tin  
  - 4.1.1. Thông báo lỗi thiếu thông tin yêu cầu nhập đầy đủ  

**Hậu điều kiện:**  
- Thông báo đăng ký thành công và thông báo chờ xét duyệt trả về trang đăng nhập  

---

## 2.8. chức năng tạo sự kiện (người tổ chức sự kiện).

**Mã usecase:** UC08  
**Tên usecase:** Tạo sự kiện  

**Mô tả usecase:**  
người tổ chức tạo sự kiện (CRUD sự kiện) và có thể đăng sự kiện hoặc thu hồi sự kiện  

**Actor chính:**  
người tổ chức sự kiện  

**Actor phụ:**  
không có  

**Tiền điều kiện:**  
- Người tổ chức sự kiện đã đăng nhập vào hệ thống  
- Người tổ chức phải có quyền hạn là người tổ chức sự kiện  

**Luồng chính:**  
1. Người tổ chức sự kiện chọn tạo sự kiện  
2. Nhập thông tin sự kiện  
   - 2.1. Tiêu đề sự kiện  
   - 2.2. Mô tả sự kiện  
   - 2.3. Ngày diễn ra sự kiện  
   - 2.4. Giờ bắt đầu - giờ kết thúc  
   - 2.5. Địa điểm  
   - 2.6. Chèn hình ảnh  
3. Nhấn đăng  
4. Sự kiện sẽ được hiển thị trên danh sách chờ admin duyệt sự kiện  

**Luồng thay thế:**  
- 3.1 Thu hồi sự kiện  
  - 3.1.1. người tổ chức sự kiện có thể thu hồi lại (xóa) sự kiện đã đăng  

**Hậu điều kiện:**  
- Sự kiện đã được nhập thông tin sẽ được hiển thị lên danh sách sự kiện  

---

## 2.9. chức năng xem danh sách người đăng ký sự kiện (người tổ chức).

**Mã usecase:** UC09  
**Tên usecase:** Xem danh sách người đăng ký sự kiện  

**Mô tả usecase:**  
Người tổ chức vào xem danh sách người tham dự đã đăng ký sự kiện  

**Actor chính:**  
người tổ chức sự kiện  

**Actor phụ:**  
không có  

**Tiền điều kiện:**  
- Người tổ chức sự kiện đã đăng nhập vào hệ thống  
- Người tổ chức phải có quyền hạn là người tổ chức sự kiện  
- Sự kiện đang tồn tại  

**Luồng chính:**  
1. Người tổ chức sự kiện chọn danh sách đăng ký  
2. Hiển thị danh sách các sự kiện  
3. Chọn 1 sự kiện  
4. chọn xem danh sách người đăng ký  
5. Hệ thống hiển thị danh sách  
6. Hiển thị thông tin các khách đã đăng ký  
   - 6.1. Người tổ chức sự kiện có thể nhấn chọn gửi email  
     - 6.1.1. Chọn tất cả khách đăng ký  
     - 6.1.2. Nhập thông tin thông báo  
     - 6.1.3. Chọn gửi email  
7. Người tổ chức xem danh sách  

**Luồng thay thế:**  
- 5.1. Sự kiện không có người đăng ký  
  - 5.1.1. Hiển thị thông báo “chưa có người đăng ký”  

**Hậu điều kiện:**  
- Hiển thị danh sách người đăng ký sự kiện  

---

## 2.10. chức năng xem báo cáo bán vé (người tổ chức).

**Mã usecase:** UC10  
**Tên usecase:** Xem báo cáo bán vé  

**Mô tả usecase:**  
Người tổ chức vào xem thông tin vé bán được của sự kiện  

**Actor chính:**  
người tổ chức sự kiện  

**Actor phụ:**  
không có  

**Tiền điều kiện:**  
- Người tổ chức sự kiện đã đăng nhập vào hệ thống  
- Người tổ chức phải có quyền hạn là người tổ chức sự kiện  

**Luồng chính:**  
1. Người tổ chức sự kiện chọn xem báo cáo bán vé  
2. Hiển thị danh sách các sự kiện  
3. Chọn 1 sự kiện  
4. chọn xem báo cáo bán vé  
5. Hệ thống hiển thị biểu đồ bán vé theo vé đã bán và vé chưa bán và doanh thu  

**Hậu điều kiện:**  
- Hiển thị doanh thu vé bán của sự kiện  

---

## 2.11. chức năng xem Check-in người tham dự (người tổ chức sự kiện).

**Mã usecase:** UC11  
**Tên usecase:** Check-in người tham dự  

**Mô tả usecase:**  
Người tổ chức vào chức năng này để scan QR vé điện tử  

**Actor chính:**  
người tổ chức sự kiện  

**Actor phụ:**  
không có  

**Tiền điều kiện:**  
- Người tổ chức sự kiện đã đăng nhập vào hệ thống  
- Người tổ chức phải có quyền hạn là người tổ chức sự kiện  

**Luồng chính:**  
1. Người tổ chức chọn chức năng check-in vé  
2. Nhấn chọn Scan vé đặt  
3. Trả về thông tin vé có hợp lệ với danh sách người tham dự của sự kiện  
4. Hiển thị thông tin CCCD và họ tên của người đặt vé  

**Luồng thay thế:**  
- 3.1. Thông báo lỗi  
  - 3.1.2. Vé không hợp lệ  

**Hậu điều kiện:**  
- Hiển thị thông tin của người đặt vé  
