# Event Booking Platform - Architecture & Design

## 1. Mục tiêu dự án
Xây dựng website đặt vé sự kiện theo mô hình phân tách frontend/backend.
- Frontend: TypeScript + React/Vite
- Backend: Python + FastAPI
- Dữ liệu: SQL (SQLite cho khung ban đầu, dễ nâng cấp sang PostgreSQL/MySQL)

## 2. Kiến trúc tổng quan

- Frontend: giao diện tìm kiếm, đặt vé, quản lý sự kiện, xem ngày diễn.
- Backend: dịch vụ REST API quản lý sự kiện, vé, thanh toán, thông báo.
- Business logic: xử lý nghiệp vụ tại tầng ứng dụng, ví dụ kiểm tra tối thiểu 2 nghệ sĩ dự phòng.
- Cơ chế thanh toán: tích hợp cổng thanh toán bên ngoài, backend lưu trạng thái đơn nhưng không lưu chi tiết tài khoản ngân hàng.

## 3. DFD mức cao

1. Người dùng tìm kiếm sự kiện -> Frontend gọi API tìm kiếm.
2. Người dùng chọn ngày + loại vé -> Frontend gọi API kiểm tra tồn kho.
3. Người dùng nhập thông tin đặt vé -> Backend tạo đơn, gọi cổng thanh toán.
4. Thanh toán thành công -> Backend phát hành vé điện tử qua email/SMS.
5. Nếu sự kiện bị hủy -> Backend sử lý hủy và khởi tạo lệnh hoàn tiền.

## 4. ERD sơ bộ

Các thực thể chính:
- Event: sự kiện tổng, mã, tên, mô tả.
- Venue: địa điểm, thành phố, sức chứa.
- EventGroup: mối quan hệ Event - Venue, cấu hình giá và danh sách ngày.
- EventDay: ngày diễn của một EventGroup.
- Ticket: vé cụ thể, loại vé, mã, trạng thái, thông tin khách.
- Order: đặt vé, thông tin khách, tổng tiền, trạng thái thanh toán.
- Artist: nghệ sĩ.
- ArtistSchedule: nghệ sĩ biểu diễn/backup cho từng EventDay.

## 5. Use case chính

- Quản trị viên quản lý sự kiện/địa điểm/giá vé.
- Người dùng tìm và đặt vé theo ngày, loại vé.
- Thanh toán vé qua cổng thanh toán.
- Hệ thống gửi vé điện tử ngay sau khi thanh toán.
- Quản lý hủy vé và hoàn tiền.

## 6. Sequence & Activity

1. Đăng nhập quản trị viên -> mở màn hình quản lý sự kiện.
2. Tạo sự kiện mới -> cấu hình địa điểm và ngày diễn -> thêm loại vé.
3. Khách hàng tìm kiếm -> chọn event/day -> thêm vào giỏ.
4. Khách hàng điền thông tin -> xác nhận thanh toán -> nhận vé qua email.

## 7. Non-functional requirements

- Accuracy: giới hạn vé theo sức chứa, tính toán tiền và hoàn tiền chính xác.
- Security: mã hóa thông tin cá nhân, bảo vệ endpoint thanh toán.
- Performance: phục vụ high traffic thời điểm mở bán.
- Availability: hoạt động 24/7.
- Integrity: dữ liệu khách hàng vẫn nguyên vẹn khi hủy.
- Scalability: thêm loại hình sự kiện/thành phố không đổi cấu trúc code.

## 8. Business rules chính

- Giá vé cố định theo địa điểm, áp dụng cho tất cả ngày của địa điểm đó.
- VIP ticket phải trừ vào tổng sức chứa, nhưng có luồng riêng không qua thanh toán.
- Nghệ sĩ dự phòng: kiểm tra trong logic ứng dụng, mỗi event phải có tối thiểu 2 backup.
- Thanh toán do đối tác xử lý, không lưu chi tiết thẻ.

## 9. Lộ trình triển khai

1. Xây dựng khung backend FastAPI + models + schema.
2. Thiết kế API cho sự kiện, vé, đơn hàng.
3. Tạo frontend React + TypeScript với các trang chính.
4. Tích hợp thanh toán giả lập / webhook.
5. Thêm module email/SMS thông báo.
6. Xây dựng test tự động cho API và logic đặt vé.
