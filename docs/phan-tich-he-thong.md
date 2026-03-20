# Phân Tích Hệ Thống Quản Lý Sự Kiện


> Phân tích yêu cầu hệ thống theo phương pháp Waterfall bằng tài liệu SRS.


## 1. Sơ đồ Usecase


![usecase diagram](images/usecase-diagram.png)

*(Sơ đồ Usecase cho hệ thống quản lý sự kiện)*


## 2. Đặc tả Usecase


### 2.1. chức năng tìm kiếm sự kiện cho khách tham dự


| MÃ USECASE | UC01 |
| --- | --- |
| TÊN USECASE | Tìm kiếm sự kiện |
| MÔ TẢ USECASE | Người tham dự tìm kiếm sự kiện theo địa điểm, theo ngày và theo danh mục |
| ACTOR CHÍNH | người tham dự |
| ACTOR PHỤ | không có |
| TIỀN ĐIỀU KIỆN | Người dùng đã truy cập vào website sự kiện
Hệ thống đã có dữ liệu sự kiện trong cơ sở dữ liệu |
| LUỒNG CHÍNH | Người tham dự truy cập vào trang chủ
Người tham dự chọn danh mục cần tìm
Người tham dự chọn địa điểm cần tìm
Người tham dự chọn thời gian diễn ra sự kiện
Hệ thống sẽ tìm kiếm theo tiêu chí lọc đã chọn
Hệ thống trả lại các danh sách sự kiện đã lọc phù hợp với bộ lọc |
| LUỒNG THAY THẾ | 6.1 Không có sự kiện phù hợp
  6.1.1. Hệ thống thông báo không có sự kiện phù hợp
  6.1.2. Người tham dự thay đổi bộ lọc để tìm lại |
| HẬU ĐIỀU KIỆN | Trả về danh sách sự kiện theo bộ lọc |


### 2.2. chức năng xem chi tiết sự kiện cho Người tham dự


| MÃ USECASE | UC02 |
| --- | --- |
| TÊN USECASE | Xem chi tiết sự kiện |
| MÔ TẢ USECASE | Người tham dự vào danh sách sự kiện hoặc dùng bộ lọc để xem chi tiết các sự kiện |
| ACTOR CHÍNH | Người tham dự |
| ACTOR PHỤ | không có |
| TIỀN ĐIỀU KIỆN | Người tham dự đã truy cập vào website sự kiện
Sự kiện đã tồn tại trong hệ thống |
| LUỒNG CHÍNH | Người tham dự vào danh sách sự kiện hoặc lọc sự kiện theo bộ lọc
Hệ thống hiển thị danh sách các sự kiện
Người tham dự chọn 1 sự kiện muốn xem
Hệ thống nhập yêu cầu xem chi tiết
Hệ thống hiển thị chi tiết sự kiện như:
5.1. Tiêu đề sự kiện
5.2. Mô tả sự kiện
5.3. Ngày diễn ra sự kiện
5.4. giờ bắt đầu - giờ kết thúc
5.5. địa điểm
5.6. Hình ảnh
5.7. các loại vé - giá vé
     6. Người tham dự có thể đặt vé |
| LUỒNG THAY THẾ | 5.1. Sự kiện không tồn tại hoặc bị xóa
 5.1.1. Hệ thống thông báo sự kiện không tồn tại 
 5.1.2. Người tham dự quay lại trang danh sách sự kiện |
| HẬU ĐIỀU KIỆN | Thông tin sự kiện được hiển thị cho Người tham dự |


### 2.3. chức năng mua vé cho Người tham dự


| MÃ USECASE | UC03 |
| --- | --- |
| TÊN USECASE | Mua vé |
| MÔ TẢ USECASE | Người tham dự xem danh sách sự kiện và lọc theo bộ lọc và mua vé theo nhu cầu |
| ACTOR CHÍNH | người tham dự |
| ACTOR PHỤ | không có |
| TIỀN ĐIỀU KIỆN | Người tham dự truy cập vào hệ thống website
Sự kiện đã tồn tại trên hệ thống
Vé của sự kiện vẫn còn |
| LUỒNG CHÍNH | Người tham dự truy cập trang chi tiết sự kiện
Người tham dự nhập CCCD và họ tên rồi chọn loại vé muốn mua và số lượng
Người tham dự chọn phương thức thanh toán
Người tham dự nhấn nút mua vé
Hiển thị thông tin đặt vé và tổng tiền thanh toán
Người tham dự xác nhận thông tin vé
Hệ thống chuyển sang bước thanh toán |
| LUỒNG THAY THẾ | 2.1. Vé đã hết
  2.1.1. Hệ thống hiển thị thông báo “vé hết”
  2.1.2. Người tham dự không thể tiếp tục mua vé
5.1. Người tham dự hủy vé
  5.1.1. Hệ thống hủy yêu cầu mua vé |
| HẬU ĐIỀU KIỆN | Thông tin vé được tạo trong hệ thống
Người tham dự được chuyển sang quy trình thanh toán |


### 2.4. chức năng thanh toán vé cho Người tham dự


| MÃ USECASE | UC04 |
| --- | --- |
| TÊN USECASE | Thanh toán vé |
| MÔ TẢ USECASE | người dùng thanh toán vé sao khi điền thông tin vé và được chuyển sang quy trình thanh toán |
| ACTOR CHÍNH | người tham dự |
| ACTOR PHỤ | Ngân hàng, Email System |
| TIỀN ĐIỀU KIỆN | Người dùng đã chọn loại vé và số lượng vé
Hệ thống đã tạo đơn đặt vé tạm thời
Người dùng đang ở trạng thanh toán |
| LUỒNG CHÍNH | Hệ thống hiển thị thông tin đơn hàng
Người dùng nhấn thanh toán
Hệ thống tạo mã QR hoặc liên kết thanh toán
Người dùng mở ứng dụng ngân hàng để quét QR thanh toán
Ngân hàng xử lý giao dịch
Ngân hàng gửi thông báo thành công về hệ thống
Hệ thống xác nhận thành công
Hệ thống tạo QR điện tử cho người dùng
Hệ thống gửi vé thông tin sự kiện QR điện tử cho người dùng thông qua email
Hiển thị thông báo “Thanh toán thành công” |
| LUỒNG THAY THẾ | 5.1. Thanh toán thất bại
 5.1.1. Ngân hàng trả về trạng thái thanh toán thất bại
 5.1.2. Hệ thống hiển thị thông báo thanh toán không thành công
 5.1.3. Người dùng có thể thanh toán lại
4.1. Người dùng hủy thanh toán
 4.1.1. Người dùng không thực hiện thanh toán
 4.1.2. Hệ thống hủy đơn đặt hàng tạm thời sau 1 khoảng thời gian |
| HẬU ĐIỀU KIỆN | Vé điện tử được tạo trong hệ thống
Người dùng nhận QR code vé qua email
Vé được lưu trong tài khoản người dùng |


### 2.5. chức năng xem lịch sử vé đã mua cho Người tham dự


| MÃ USECASE | UC05 |
| --- | --- |
| TÊN USECASE | xem lịch sử vé đã mua |
| MÔ TẢ USECASE | Sau khi mua vé thành công người dùng có nhu cầu xem lại thông tin của vé đã mua |
| ACTOR CHÍNH | người tham dự |
| ACTOR PHỤ | không có |
| TIỀN ĐIỀU KIỆN | Người dùng đã đăng nhập vào hệ thống
Người dùng đã mua ít nhất 1 vé sự kiện trước đó |
| LUỒNG CHÍNH | Người dùng đăng nhập vào hệ thống
Người dùng truy cập mục Lịch sử vé đã mua
Hệ thống hiển thị danh sách các vé sự kiện mà người dùng đã mua
Người dùng chọn 1 vé trong danh sách
Hệ thống hiển thị chi tiết vé gồm:
5.1. Tên sự kiện
5.2. Thời gian diễn ra
5.3. địa điểm
5.4. loại vé
5.5. giá vé
5.6. trạng thái vé
5.7. Mã QR code của vé
Người dùng xem thông tin chi tiết vé |
| LUỒNG THAY THẾ | 3.1. Không có vé đã mua
 3.1.1. Hệ thống hiển thị thông báo “bạn chưa mua vé nào” |
| HẬU ĐIỀU KIỆN | Thông tin chi tiết vé đã mua được hiển thị cho người dùng |


### 2.6. chức năng đăng nhập cho người tổ chức sự kiện.


| MÃ USECASE | UC06 |
| --- | --- |
| TÊN USECASE | đăng nhập |
| MÔ TẢ USECASE | người tổ chức sự kiện đăng nhập vào hệ thống |
| ACTOR CHÍNH | người tham dự |
| ACTOR PHỤ | không có |
| TIỀN ĐIỀU KIỆN | Người tổ chức sự kiện phải đăng ký ít nhất 1 tài khoản
Người tổ chức đã được admin duyệt tài khoản |
| LUỒNG CHÍNH | Người tổ chức sự kiện chọn chức năng đăng nhập
Sau đó sẽ hiển thị ra trang đăng nhập với 2 button là đăng nhập cho người tổ chức và đăng ký cho người tổ chức
Click chọn đăng nhập cho người tổ chức
Chuyển đổi trang yêu cầu người tổ chức nhập username bằng email và password 
và chọn địa điểm làm việc
Thông báo đăng nhập thành công 
Chuyển trang về trang quản trị cho người tổ chức |
| LUỒNG THAY THẾ | 5.1. Sai thông tin đăng nhập
  5.1.1 thông báo lỗi yêu cầu nhập lại
  5.1.2 chọn sai tổ chức làm việc yêu cầu chọn lại |
| HẬU ĐIỀU KIỆN | Đăng nhập thành công vào trang quản trị để sử dụng các chức năng của người tổ chức sự kiện |


### 2.7. chức năng đăng ký cho người tổ chức sự kiện.


| MÃ USECASE | UC07 |
| --- | --- |
| TÊN USECASE | đăng ký |
| MÔ TẢ USECASE | người tổ chức sự kiện đăng ký tài khoản |
| ACTOR CHÍNH | người tổ chức sự kiện |
| ACTOR PHỤ | không có |
| TIỀN ĐIỀU KIỆN | Người tổ chưa có tài khoản |
| LUỒNG CHÍNH | Người tổ chức sự kiện chọn chức năng đăng nhập
Sau đó sẽ hiển thị ra trang đăng nhập với 2 button là đăng nhập cho người tổ chức và đăng ký cho người tổ chức
Người tổ chức click chọn chức năng đăng ký tài khoản
Yêu cầu Người tổ chức nhập và chọn đầy đủ thông tin và không được để trống
Thông báo đăng ký thành công
Thông báo tài khoản sẽ được duyệt và được thông báo qua email trong vòng 2 ngày sau |
| LUỒNG THAY THẾ | 4.1. Nhập thiếu thông tin
  4.1.1. Thông báo lỗi thiếu thông tin yêu cầu nhập đầy đủ |
| HẬU ĐIỀU KIỆN | Thông báo đăng ký thành công và thông báo chờ xét duyệt trả về trang đăng nhập |


### 2.8. chức năng tạo sự kiện (người tổ chức sự kiện).


| MÃ USECASE | UC08 |
| --- | --- |
| TÊN USECASE | Tạo sự kiện |
| MÔ TẢ USECASE | người tổ chức tạo sự kiện (CRUD sự kiện) và có thể đăng sự kiện hoặc thu hồi sự kiện |
| ACTOR CHÍNH | người tổ chức sự kiện |
| ACTOR PHỤ | không có |
| TIỀN ĐIỀU KIỆN | Người tổ chức sự kiện đã đăng nhập vào hệ thống
Người tổ chức phải có quyền hạn là người tổ chức sự kiện |
| LUỒNG CHÍNH | Người tổ chức sự kiện chọn tạo sự kiện
Nhập thông tin sự kiện
           2.1. Tiêu đề sự kiện
           2.2. Mô tả sự kiện
           2.3. Ngày diễn ra sự kiện
           2.4. Giờ bắt đầu - giờ kết thúc
           2.5. Địa điểm
           2.6. Chèn hình ảnh
Nhấn đăng
Sự kiện sẽ được hiển thị trên danh sách chờ admin duyệt sự kiện. |
| LUỒNG THAY THẾ | 3.1 Thu hồi sự kiện
  3.1.1. người tổ chức sự kiện có thể thu hồi lại (xóa) sự kiện đã đăng |
| HẬU ĐIỀU KIỆN | Sự kiện đã được nhập thông tin sẽ được hiển thị lên danh sách sự kiện |


### 2.9. chức năng xem danh sách người đăng ký sự kiện (người tổ chức).


| MÃ USECASE | UC09 |
| --- | --- |
| TÊN USECASE | Xem danh sách người đăng ký sự kiện |
| MÔ TẢ USECASE | Người tổ chức vào xem danh sách người tham dự đã đăng ký sự kiện |
| ACTOR CHÍNH | người tổ chức sự kiện |
| ACTOR PHỤ | không có |
| TIỀN ĐIỀU KIỆN | Người tổ chức sự kiện đã đăng nhập vào hệ thống
Người tổ chức phải có quyền hạn là người tổ chức sự kiện
Sự kiện đang tồn tại |
| LUỒNG CHÍNH | Người tổ chức sự kiện chọn danh sách đăng ký
Hiển thị danh sách các sự kiện
Chọn 1 sự kiện
chọn xem danh sách người đăng ký
Hệ thống hiển thị danh sách
Hiển thị thông tin các khách đã đăng ký
   6.1. Người tổ chức sự kiện có thể nhấn chọn gửi email 
     6.1.1. Chọn tất cả khách đăng ký
     6.1.2. Nhập thông tin thông báo
     6.1.3. Chọn gửi email
Người tổ chức xem danh sách |
| LUỒNG THAY THẾ | 5.1. Sự kiện không có người đăng ký
  5.1.1. Hiển thị thông báo “chưa có người đăng ký” |
| HẬU ĐIỀU KIỆN | Hiển thị danh sách người đăng ký sự kiện |


### 2.10. chức năng xem báo cáo bán vé (người tổ chức).


| MÃ USECASE | UC10 |
| --- | --- |
| TÊN USECASE | Xem báo cáo bán vé |
| MÔ TẢ USECASE | Người tổ chức vào xem thông tin vé bán được của sự kiện |
| ACTOR CHÍNH | người tổ chức sự kiện |
| ACTOR PHỤ | không có |
| TIỀN ĐIỀU KIỆN | Người tổ chức sự kiện đã đăng nhập vào hệ thống
Người tổ chức phải có quyền hạn là người tổ chức sự kiện |
| LUỒNG CHÍNH | Người tổ chức sự kiện chọn xem báo cáo bán vé
Hiển thị danh sách các sự kiện
Chọn 1 sự kiện
chọn xem báo cáo bán vé
Hệ thống hiển thị biểu đồ bán vé theo vé đã bán và vé chưa bán và doanh thu |
| HẬU ĐIỀU KIỆN | Hiển thị doanh thu vé bán của sự kiện |


### 2.11. chức năng xem Check-in người tham dự (người tổ chức sự kiện).


| MÃ USECASE | UC11 |
| --- | --- |
| TÊN USECASE | Check-in người tham dự |
| MÔ TẢ USECASE | Người tổ chức vào chức năng này để scan QR vé điện tử |
| ACTOR CHÍNH | người tổ chức sự kiện |
| ACTOR PHỤ | không có |
| TIỀN ĐIỀU KIỆN | Người tổ chức sự kiện đã đăng nhập vào hệ thống
Người tổ chức phải có quyền hạn là người tổ chức sự kiện |
| LUỒNG CHÍNH | Người tổ chức chọn chức năng check-in vé
Nhấn chọn Scan vé đặt
Trả về thông tin vé có hợp lệ với danh sách người tham dự của sự kiện
Hiển thị thông tin CCCD và họ tên của người đặt vé |
| LUÔNG THAY THẾ | 3.1. Thông báo lỗi
  3.1.2. Vé không hợp lệ |
| HẬU ĐIỀU KIỆN | Hiển thị thông tin của người đặt vé |


## 3. Sơ đồ Hoạt Động


### 3.1. Sơ đồ hoạt động cho chức năng đăng nhập cho người tổ chức sự kiện


![activity dang nhap](images/activity-dang-nhap.png)


### 3.2. Sơ đồ hoạt động cho chức năng đăng ký cho người tổ chức sự kiện


![activity dang ky](images/activity-dang-ky.png)


### 3.3. Sơ đồ hoạt động cho chức năng tìm kiếm sự kiện


![activity tim kiem](images/activity-tim-kiem.png)


### 3.4. Sơ đồ hoạt động cho chức năng xem chi tiết sự kiện


![activity xem chi tiet](images/activity-xem-chi-tiet.png)


### 3.5. Sơ đồ hoạt động cho chức năng mua vé


![activity mua ve](images/activity-mua-ve.png)


### 3.6. Sơ đồ hoạt động cho chức năng thanh toán


![activity thanh toan](images/activity-thanh-toan.png)


### 3.7. Sơ đồ hoạt động cho chức năng xem chi tiết vé đã đặt


![activity xem ve da dat](images/activity-xem-ve-da-dat.png)


## 4. Wireframe


### 4.1. wireframe trang chủ


![wireframe trang chu](images/wireframe-trang-chu.png)


### 4.2. wireframe xem chi tiết vé.


![wireframe chi tiet ve](images/wireframe-chi-tiet-ve.png)


### 4.3. wireframe đặt vé .


![wireframe dat ve](images/wireframe-dat-ve.png)


### 4.4. wireframe đăng ký đặt vé.


![wireframe dang ky ve](images/wireframe-dang-ky-ve.png)


### 4.5. wireframe đăng ký đặt vé nhưng hết vé.


![wireframe dang ky ve het](images/wireframe-dang-ky-ve-het.png)


### 4.6. wireframe đăng ký đặt vé nhưng hết vé.


![wireframe dang ky ve het 2](images/wireframe-dang-ky-ve-het-2.png)


### 4.7. wireframe xem lịch sử đặt vé.


![wireframe lich su dat ve](images/wireframe-lich-su-dat-ve.png)


### 4.8. wireframe xem lịch sử đặt vé trống.


![wireframe lich su dat ve trong](images/wireframe-lich-su-dat-ve-trong.png)


### 4.9. wireframe xem chi tiết lịch sử vé đặt.


![wireframe chi tiet lich su ve](images/wireframe-chi-tiet-lich-su-ve.png)


### 4.10. Đăng nhập cho quản lý.


![wireframe admin login](images/wireframe-admin-login.png)


### 4.10.1. Đăng nhập.


![wireframe dang nhap](images/wireframe-dang-nhap.png)


### 4.10.2. Đăng ký.


![wireframe dang ky](images/wireframe-dang-ky.png)


### 4.10.3. Đăng ký thành công.


![wireframe dang ky thanh cong](images/wireframe-dang-ky-thanh-cong.png)
