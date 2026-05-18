# Phân tích luồng hoạt động, object thực thể và database cho Website Đặt Vé Sự Kiện

> Tài liệu này tập trung vào 3 phần chính:
>
> 1. Luồng hoạt động nghiệp vụ của website
> 2. Phân tích object / entity trong hệ thống
> 3. Thiết kế database phù hợp với project React + FastAPI + SQLAlchemy + Alembic

---

# 1. Bối cảnh project hiện tại

Project đang đi theo mô hình **Client - Server**:

- Frontend: ReactJS + Vite
- Backend: FastAPI
- Database access: SQLAlchemy
- API validation: Pydantic schemas
- Migration: Alembic
- Business logic: đặt trong `services/`
- CRUD database: đặt trong `crud/`
- Model database: đặt trong `models/`

Vì vậy, khi gen code, nên triển khai theo thứ tự:

```txt
models/  -> schemas/ -> crud/ -> services/ -> api/ -> frontend api/types/pages
```

Nguyên tắc quan trọng:

```txt
API Router không xử lý nghiệp vụ phức tạp.
API Router chỉ nhận request, validate, gọi service, trả response.

Service xử lý business logic.
CRUD chỉ thao tác database.
Model chỉ mô tả bảng.
Schema chỉ validate input/output.
```

---

# 2. Tổng quan nghiệp vụ hệ thống

Hệ thống phục vụ công ty tổ chức biểu diễn nghệ thuật.

Website cho phép:

- Khách hàng xem sự kiện
- Khách hàng chọn ngày diễn, địa điểm, loại vé và số lượng vé
- Khách hàng đặt vé
- Khách hàng thanh toán
- Hệ thống phát hành vé điện tử
- Admin quản lý sự kiện
- Admin quản lý địa điểm
- Admin quản lý lịch diễn
- Admin quản lý loại vé
- Admin quản lý nghệ sĩ / khách mời
- Admin hủy sự kiện
- Hệ thống xử lý hoàn tiền khi sự kiện bị hủy

---

# 3. Actor trong hệ thống

## 3.1 Customer

Customer là người mua vé.

Customer có thể:

- Xem danh sách sự kiện
- Xem chi tiết sự kiện
- Chọn ngày diễn
- Chọn loại vé
- Nhập thông tin đặt vé
- Thanh toán
- Nhận vé điện tử
- Nhận thông báo hoàn tiền nếu sự kiện bị hủy

Customer không bắt buộc phải có tài khoản đăng nhập.

Thông tin customer được lưu trực tiếp trong booking:

- customer_name
- phone
- email
- payment_account

---

## 3.2 Admin

Admin là người quản trị hệ thống.

Admin có thể:

- Thêm / sửa / xóa sự kiện
- Thêm / sửa / xóa địa điểm
- Cấu hình lịch diễn
- Cấu hình loại vé
- Cấu hình giá vé
- Cấu hình số lượng vé
- Quản lý nghệ sĩ
- Gán nghệ sĩ vào từng ngày diễn
- Gán nghệ sĩ dự phòng
- Hủy sự kiện
- Theo dõi booking
- Theo dõi thanh toán
- Theo dõi hoàn tiền
- Thực hiện hoàn tiền thủ công nếu tự động hoàn tiền lỗi

---

## 3.3 Payment Gateway

Payment Gateway là hệ thống thanh toán bên ngoài.

Payment Gateway có nhiệm vụ:

- Nhận transaction request từ hệ thống
- Xử lý thanh toán
- Trả transaction result
- Gửi payment notification / webhook
- Xử lý refund request
- Trả refund result

Ví dụ:

- VNPay
- MoMo
- Stripe
- PayPal
- Banking API

---

# 4. Luồng hoạt động tổng thể

Hệ thống có 6 luồng chính:

```txt
1. Browse Event Flow
2. Reservation Flow
3. Payment Flow
4. Ticket Issuing Flow
5. Admin Management Flow
6. Cancellation & Refund Flow
```

---

# 5. Browse Event Flow

## 5.1 Mục tiêu

Cho phép customer xem danh sách sự kiện và chọn sự kiện muốn đặt vé.

---

## 5.2 Luồng xử lý

### Bước 1: Customer mở website

Frontend gọi API:

```http
GET /api/v1/events
```

Backend trả danh sách event:

```json
[
  {
    "event_id": 1,
    "event_name": "Music Night 2026",
    "description": "Live music event",
    "status": "ACTIVE"
  }
]
```

---

### Bước 2: Customer xem chi tiết event

Frontend gọi:

```http
GET /api/v1/events/{event_id}
```

Backend trả:

```json
{
  "event_id": 1,
  "event_name": "Music Night 2026",
  "description": "Live music event",
  "schedules": [
    {
      "schedule_id": 10,
      "venue": {
        "venue_id": 3,
        "venue_name": "Hanoi Opera House",
        "city": "Hanoi",
        "capacity": 600
      },
      "days": [
        {
          "event_day_id": 100,
          "date": "2026-06-01T20:00:00"
        }
      ],
      "ticket_configs": [
        {
          "config_id": 1,
          "ticket_type": "STANDARD",
          "price": 300000,
          "max_quantity": 400,
          "remaining_quantity": 120
        }
      ],
      "artists": [
        {
          "artist_id": 1,
          "artist_name": "Artist A",
          "is_backup": false
        },
        {
          "artist_id": 2,
          "artist_name": "Backup Artist B",
          "is_backup": true
        }
      ]
    }
  ]
}
```

---

### Bước 3: Backend tính số lượng vé còn lại

Công thức:

```txt
remaining_quantity = max_quantity - paid_quantity - pending_reserved_quantity
```

Trong đó:

- `max_quantity`: số lượng vé tối đa được cấu hình
- `paid_quantity`: số vé đã thanh toán thành công
- `pending_reserved_quantity`: số vé đang được giữ tạm trong thời gian chờ thanh toán

---

## 5.3 Service nên có

File đề xuất:

```txt
backend/app/services/event_service.py
```

Các hàm chính:

```python
get_event_list()
get_event_detail(event_id)
get_event_remaining_tickets(event_day_id, config_id)
```

---

# 6. Reservation Flow

## 6.1 Mục tiêu

Cho phép customer đặt vé nhưng chưa thanh toán ngay.

Hệ thống cần giữ vé tạm thời trong một khoảng thời gian, ví dụ 10 đến 15 phút.

---

## 6.2 Input từ customer

Customer nhập:

- Tên người đặt
- Số điện thoại
- Email
- Tài khoản thanh toán để hoàn tiền
- Sự kiện
- Ngày diễn
- Loại vé
- Số lượng vé

Frontend gửi:

```http
POST /api/v1/reservations
```

Payload:

```json
{
  "customer_name": "Nguyen Van A",
  "phone": "0912345678",
  "email": "a@example.com",
  "payment_account": "0123456789 - Vietcombank",
  "schedule_id": 10,
  "event_day_id": 100,
  "items": [
    {
      "config_id": 1,
      "quantity": 2
    }
  ]
}
```

---

## 6.3 Backend xử lý reservation

Backend cần xử lý trong transaction.

Các bước:

```txt
1. Validate input
2. Kiểm tra event_day có tồn tại không
3. Kiểm tra ticket_config có thuộc đúng schedule không
4. Kiểm tra event chưa bị hủy
5. Lock ticket_config hoặc booking rows liên quan
6. Tính số vé còn lại
7. Nếu đủ vé: tạo booking PENDING
8. Tạo booking_details
9. Trả payment request cho customer
```

---

## 6.4 Chống đặt vé vượt số lượng

Đây là phần quan trọng nhất.

Khi nhiều customer đặt cùng lúc, backend phải tránh overselling.

Có 2 cách chính:

---

### Cách 1: PostgreSQL row lock

Dùng transaction và `SELECT ... FOR UPDATE`.

Ví dụ:

```sql
SELECT *
FROM ticket_configs
WHERE config_id = :config_id
FOR UPDATE;
```

Sau khi lock, backend tính lại số vé còn lại rồi mới cho tạo booking.

---

### Cách 2: Redis lock

Dùng Redis để lock theo key:

```txt
lock:ticket_config:{config_id}:event_day:{event_day_id}
```

Ví dụ:

```txt
lock:ticket_config:1:event_day:100
```

TTL lock ngắn, ví dụ 5 giây.

---

## 6.5 Trạng thái booking

Booking nên có các status:

```txt
PENDING_PAYMENT
PAID
PAYMENT_FAILED
CANCELLED
REFUNDING
REFUNDED
REFUND_FAILED
```

Ý nghĩa:

| Status | Ý nghĩa |
|---|---|
| PENDING_PAYMENT | Đã giữ vé, chờ thanh toán |
| PAID | Đã thanh toán thành công |
| PAYMENT_FAILED | Thanh toán thất bại |
| CANCELLED | Booking bị hủy |
| REFUNDING | Đang hoàn tiền |
| REFUNDED | Đã hoàn tiền |
| REFUND_FAILED | Hoàn tiền lỗi |

---

## 6.6 Reservation timeout

Nếu customer không thanh toán sau 10 đến 15 phút:

```txt
booking.status = CANCELLED
```

Khi đó số vé được giải phóng.

Có thể xử lý bằng:

- Celery task
- Background scheduler
- Cron job
- Redis TTL event

---

## 6.7 Service nên có

File đề xuất:

```txt
backend/app/services/reservation_service.py
```

Các hàm chính:

```python
create_reservation()
validate_ticket_availability()
calculate_remaining_quantity()
cancel_expired_reservations()
```

---

# 7. Payment Flow

## 7.1 Mục tiêu

Xử lý thanh toán cho booking đang ở trạng thái `PENDING_PAYMENT`.

---

## 7.2 Customer bắt đầu thanh toán

Frontend gọi:

```http
POST /api/v1/payments/create
```

Payload:

```json
{
  "booking_id": 1,
  "payment_method": "ONLINE_BANKING"
}
```

---

## 7.3 Backend tạo payment transaction

Backend tạo bản ghi transaction:

```txt
payment.status = INITIATED
```

Sau đó gọi payment gateway.

---

## 7.4 Luồng online banking

Backend trả về:

```json
{
  "booking_id": 1,
  "payment_method": "ONLINE_BANKING",
  "qr_code_url": "https://example.com/qr.png",
  "amount": 600000,
  "expired_at": "2026-06-01T10:15:00"
}
```

Customer chuyển khoản theo QR.

Payment Gateway gửi webhook khi nhận tiền.

---

## 7.5 Luồng card payment

Customer nhập thông tin thẻ trên giao diện payment gateway.

Hệ thống không được lưu:

```txt
CVV
raw card number
```

Chỉ lưu:

```txt
payment_token
masked_card_number
```

Ví dụ:

```txt
**** **** **** 1234
```

---

## 7.6 Payment webhook

Payment Gateway gọi:

```http
POST /api/v1/payments/webhook
```

Payload ví dụ:

```json
{
  "transaction_id": "TXN123",
  "booking_id": 1,
  "status": "SUCCESS",
  "amount": 600000,
  "signature": "..."
}
```

Backend xử lý:

```txt
1. Verify signature
2. Check amount
3. Check booking status
4. Update payment status
5. Update booking status = PAID
6. Trigger ticket issuing
```

---

## 7.7 Payment success

Khi thanh toán thành công:

```txt
booking.status = PAID
payment.status = SUCCESS
```

Sau đó hệ thống:

```txt
1. Generate e-ticket
2. Send email
3. Send SMS nếu có
4. Cho phép customer download ticket
```

---

## 7.8 Payment failed

Khi thanh toán thất bại:

```txt
booking.status = PAYMENT_FAILED
payment.status = FAILED
```

Sau đó vé được giải phóng.

---

## 7.9 Service nên có

File đề xuất:

```txt
backend/app/services/payment_service.py
```

Các hàm chính:

```python
create_payment()
handle_payment_webhook()
verify_payment_signature()
mark_payment_success()
mark_payment_failed()
```

---

# 8. Ticket Issuing Flow

## 8.1 Mục tiêu

Sau khi thanh toán thành công, hệ thống phát hành vé điện tử.

---

## 8.2 Generate ticket

Với mỗi vé đã mua, hệ thống tạo một record trong bảng `e_tickets`.

Ví dụ customer mua 2 vé STANDARD:

```txt
booking_detail.quantity = 2
```

Hệ thống tạo 2 ticket:

```txt
TICKET-2026-000001
TICKET-2026-000002
```

---

## 8.3 Ticket code

Ticket code phải unique.

Có thể sinh theo format:

```txt
EVT-{event_id}-{booking_id}-{random_string}
```

Ví dụ:

```txt
EVT-1-200-8XK29P
```

---

## 8.4 QR Code

QR code có thể chứa:

```json
{
  "ticket_code": "EVT-1-200-8XK29P",
  "event_day_id": 100,
  "booking_id": 200
}
```

---

## 8.5 Ticket status

Ticket nên có status:

```txt
VALID
USED
CANCELLED
REFUNDED
```

---

## 8.6 Send email

Sau khi tạo ticket:

```txt
1. Render ticket PDF hoặc HTML
2. Attach QR code
3. Gửi email cho customer
```

Nên xử lý bằng worker async.

---

## 8.7 Service nên có

File đề xuất:

```txt
backend/app/services/ticket_service.py
```

Các hàm chính:

```python
generate_tickets_for_booking()
generate_ticket_code()
generate_qr_code()
send_ticket_email()
get_ticket_by_code()
```

---

# 9. Admin Management Flow

## 9.1 Mục tiêu

Cho phép admin quản lý dữ liệu hệ thống.

---

# 9.2 Quản lý Event

Admin có thể:

```txt
Create event
Update event
Delete event
View event
Cancel event
```

API đề xuất:

```http
GET    /api/v1/admin/events
POST   /api/v1/admin/events
GET    /api/v1/admin/events/{event_id}
PUT    /api/v1/admin/events/{event_id}
DELETE /api/v1/admin/events/{event_id}
POST   /api/v1/admin/events/{event_id}/cancel
```

---

# 9.3 Quản lý Venue

Admin có thể:

```txt
Create venue
Update venue
Delete venue
View venue
```

API đề xuất:

```http
GET    /api/v1/admin/venues
POST   /api/v1/admin/venues
PUT    /api/v1/admin/venues/{venue_id}
DELETE /api/v1/admin/venues/{venue_id}
```

---

# 9.4 Quản lý Schedule

Schedule là quan hệ giữa event và venue.

Một event có thể diễn ở nhiều venue.

Một venue có thể tổ chức nhiều event.

API đề xuất:

```http
POST /api/v1/admin/event-schedules
PUT  /api/v1/admin/event-schedules/{schedule_id}
GET  /api/v1/admin/event-schedules/{schedule_id}
```

Payload:

```json
{
  "event_id": 1,
  "venue_id": 3
}
```

---

# 9.5 Quản lý Event Day

Event Day là ngày diễn cụ thể.

API đề xuất:

```http
POST /api/v1/admin/event-days
PUT  /api/v1/admin/event-days/{event_day_id}
```

Payload:

```json
{
  "schedule_id": 10,
  "date": "2026-06-01T20:00:00"
}
```

---

# 9.6 Quản lý Ticket Config

Ticket Config định nghĩa:

- loại vé
- giá
- số lượng
- áp dụng cho event_schedule

API đề xuất:

```http
POST /api/v1/admin/ticket-configs
PUT  /api/v1/admin/ticket-configs/{config_id}
```

Payload:

```json
{
  "schedule_id": 10,
  "ticket_type": "STANDARD",
  "price": 300000,
  "max_quantity": 400
}
```

Validation:

```txt
Tổng max_quantity của các ticket_config trong cùng schedule <= venue.capacity
```

---

# 9.7 Quản lý Artists

API đề xuất:

```http
GET    /api/v1/admin/artists
POST   /api/v1/admin/artists
PUT    /api/v1/admin/artists/{artist_id}
DELETE /api/v1/admin/artists/{artist_id}
```

---

# 9.8 Gán artist vào event day

API đề xuất:

```http
POST /api/v1/admin/event-artists
```

Payload:

```json
{
  "event_day_id": 100,
  "artist_id": 1,
  "is_backup": false
}
```

---

# 9.9 Ràng buộc backup artists

Mỗi event day phải có ít nhất 2 backup artists.

Khi publish event hoặc trước khi mở bán vé, service phải kiểm tra:

```txt
count(event_artists where event_day_id = X and is_backup = true) >= 2
```

Nếu không đủ:

```json
{
  "error": "Each event day must have at least 2 backup artists"
}
```

---

## 9.10 Service nên có

File đề xuất:

```txt
backend/app/services/admin_event_service.py
backend/app/services/artist_service.py
```

Các hàm chính:

```python
create_event()
update_event()
create_schedule()
create_event_day()
create_ticket_config()
validate_schedule_capacity()
assign_artist_to_event_day()
validate_backup_artists()
```

---

# 10. Cancellation & Refund Flow

## 10.1 Mục tiêu

Khi admin hủy sự kiện, hệ thống phải hoàn tiền cho toàn bộ customer đã thanh toán.

---

## 10.2 Admin hủy event

Frontend gọi:

```http
POST /api/v1/admin/events/{event_id}/cancel
```

Payload:

```json
{
  "reason": "Event cancelled by company"
}
```

---

## 10.3 Backend xử lý cancel

Các bước:

```txt
1. Kiểm tra event tồn tại
2. Kiểm tra event chưa diễn ra
3. Update event.status = CANCELLED
4. Update related event_days.status = CANCELLED
5. Tìm tất cả booking PAID thuộc event
6. Tạo refund request cho từng booking
7. Đẩy refund job vào queue
```

---

## 10.4 Refund tự động

Worker xử lý:

```txt
1. Lấy booking cần refund
2. Lấy payment_account của customer
3. Gọi Payment Gateway refund API
4. Nhận refund result
5. Update booking status
6. Update ticket status
7. Gửi email thông báo
```

---

## 10.5 Refund success

Khi hoàn tiền thành công:

```txt
booking.status = REFUNDED
ticket.status = REFUNDED
refund.status = SUCCESS
```

---

## 10.6 Refund failed

Khi hoàn tiền lỗi:

```txt
booking.status = REFUND_FAILED
refund.status = FAILED
```

Admin có thể retry thủ công.

---

## 10.7 Manual refund

Admin gọi:

```http
POST /api/v1/admin/refunds/{refund_id}/retry
```

Hoặc:

```http
POST /api/v1/admin/bookings/{booking_id}/manual-refund
```

---

## 10.8 Service nên có

File đề xuất:

```txt
backend/app/services/refund_service.py
```

Các hàm chính:

```python
create_refund_requests_for_event()
process_refund()
retry_refund()
mark_refund_success()
mark_refund_failed()
```

---

# 11. Phân tích object / entity

---

# 11.1 Event

## Mục đích

Lưu thông tin sự kiện gốc.

## Thuộc tính

```txt
event_id
event_name
description
status
created_at
updated_at
```

## Quan hệ

```txt
Event 1 - N EventSchedule
```

## Business rules

```txt
Event có thể diễn ở nhiều venue.
Event có thể có nhiều ngày diễn.
Event có thể bị cancel.
```

---

# 11.2 Venue

## Mục đích

Lưu địa điểm tổ chức.

## Thuộc tính

```txt
venue_id
venue_name
city
capacity
created_at
updated_at
```

## Quan hệ

```txt
Venue 1 - N EventSchedule
```

## Business rules

```txt
capacity phải > 0.
Tổng số vé cấu hình cho một schedule không được vượt quá capacity.
```

---

# 11.3 EventSchedule

## Mục đích

Biểu diễn việc một event được tổ chức tại một venue.

Ví dụ:

```txt
Music Night tổ chức tại Hà Nội
Music Night tổ chức tại Đà Nẵng
Music Night tổ chức tại TP.HCM
```

## Thuộc tính

```txt
schedule_id
event_id
venue_id
status
created_at
updated_at
```

## Quan hệ

```txt
EventSchedule N - 1 Event
EventSchedule N - 1 Venue
EventSchedule 1 - N EventDay
EventSchedule 1 - N TicketConfig
EventSchedule 1 - N Booking
```

---

# 11.4 EventDay

## Mục đích

Lưu ngày diễn cụ thể của một schedule.

Ví dụ:

```txt
Music Night tại Hà Nội ngày 01/06/2026
Music Night tại Hà Nội ngày 02/06/2026
```

## Thuộc tính

```txt
event_day_id
schedule_id
date
status
created_at
updated_at
```

## Quan hệ

```txt
EventDay N - 1 EventSchedule
EventDay 1 - N BookingDetail
EventDay 1 - N EventArtist
```

---

# 11.5 Artist

## Mục đích

Lưu danh mục nghệ sĩ / khách mời.

## Thuộc tính

```txt
artist_id
artist_name
bio
created_at
updated_at
```

## Quan hệ

```txt
Artist 1 - N EventArtist
```

---

# 11.6 EventArtist

## Mục đích

Gán nghệ sĩ vào từng ngày diễn.

Vì cùng một event ở các thành phố/ngày khác nhau có thể có danh sách nghệ sĩ khác nhau, quan hệ artist nên gắn với `event_day_id`.

## Thuộc tính

```txt
event_artist_id
event_day_id
artist_id
is_backup
created_at
updated_at
```

## Business rules

```txt
Mỗi event_day phải có ít nhất 2 artist có is_backup = true.
Một artist không nên bị gán trùng vào cùng một event_day.
```

---

# 11.7 TicketConfig

## Mục đích

Cấu hình loại vé, giá và số lượng vé cho một schedule.

TicketConfig gắn với schedule, không gắn trực tiếp với từng ngày, vì đề bài yêu cầu:

```txt
Giá vé cố định trong tất cả các ngày diễn ra sự kiện tại cùng một địa điểm.
```

## Thuộc tính

```txt
config_id
schedule_id
ticket_type
price
max_quantity
created_at
updated_at
```

## Quan hệ

```txt
TicketConfig N - 1 EventSchedule
TicketConfig 1 - N BookingDetail
```

## Business rules

```txt
price >= 0
max_quantity > 0
sum(max_quantity by schedule_id) <= venue.capacity
```

---

# 11.8 Booking

## Mục đích

Lưu đơn đặt vé tổng thể của customer.

## Thuộc tính

```txt
booking_id
schedule_id
customer_name
phone
email
payment_account
booking_status
payment_status
total_amount
created_at
updated_at
expires_at
```

## Quan hệ

```txt
Booking N - 1 EventSchedule
Booking 1 - N BookingDetail
Booking 1 - N PaymentTransaction
Booking 1 - N RefundTransaction
```

## Business rules

```txt
Booking PENDING_PAYMENT chỉ giữ vé đến expires_at.
Booking PAID mới được phát hành vé.
Booking REFUNDED thì ticket liên quan phải chuyển REFUNDED/CANCELLED.
```

---

# 11.9 BookingDetail

## Mục đích

Lưu chi tiết vé trong một booking.

Ví dụ một booking có thể mua:

```txt
2 vé STANDARD
1 vé VIP
```

## Thuộc tính

```txt
booking_detail_id
booking_id
config_id
event_day_id
quantity
unit_price
subtotal
created_at
updated_at
```

## Quan hệ

```txt
BookingDetail N - 1 Booking
BookingDetail N - 1 TicketConfig
BookingDetail N - 1 EventDay
BookingDetail 1 - N ETicket
```

---

# 11.10 ETicket

## Mục đích

Lưu vé điện tử được phát hành sau khi thanh toán thành công.

## Thuộc tính

```txt
ticket_code
booking_detail_id
ticket_status
qr_code_url
issued_at
used_at
created_at
updated_at
```

## Business rules

```txt
ticket_code phải unique.
Chỉ booking PAID mới được tạo e-ticket.
Nếu event bị cancel thì ticket chuyển CANCELLED hoặc REFUNDED.
```

---

# 11.11 PaymentTransaction

## Mục đích

Lưu lịch sử thanh toán.

Đề bài ban đầu chưa bắt buộc bảng này, nhưng khi gen code thực tế nên có để dễ quản lý payment.

## Thuộc tính

```txt
payment_id
booking_id
gateway_transaction_id
payment_method
amount
status
raw_response
created_at
updated_at
```

## Status

```txt
INITIATED
SUCCESS
FAILED
EXPIRED
```

---

# 11.12 RefundTransaction

## Mục đích

Lưu lịch sử hoàn tiền.

Nên tách riêng refund để theo dõi hoàn tiền tự động và thủ công.

## Thuộc tính

```txt
refund_id
booking_id
gateway_refund_id
amount
status
reason
is_manual
raw_response
created_at
updated_at
```

## Status

```txt
PENDING
PROCESSING
SUCCESS
FAILED
```

---

# 12. Thiết kế database

---

# 12.1 Bảng events

```sql
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# 12.2 Bảng venues

```sql
CREATE TABLE venues (
    venue_id SERIAL PRIMARY KEY,
    venue_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# 12.3 Bảng event_schedules

```sql
CREATE TABLE event_schedules (
    schedule_id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(event_id),
    venue_id INTEGER NOT NULL REFERENCES venues(venue_id),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# 12.4 Bảng event_days

```sql
CREATE TABLE event_days (
    event_day_id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL REFERENCES event_schedules(schedule_id),
    date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# 12.5 Bảng artists

```sql
CREATE TABLE artists (
    artist_id SERIAL PRIMARY KEY,
    artist_name VARCHAR(255) NOT NULL,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# 12.6 Bảng event_artists

```sql
CREATE TABLE event_artists (
    event_artist_id SERIAL PRIMARY KEY,
    event_day_id INTEGER NOT NULL REFERENCES event_days(event_day_id),
    artist_id INTEGER NOT NULL REFERENCES artists(artist_id),
    is_backup BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_day_id, artist_id)
);
```

---

# 12.7 Bảng ticket_configs

```sql
CREATE TABLE ticket_configs (
    config_id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL REFERENCES event_schedules(schedule_id),
    ticket_type VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    max_quantity INTEGER NOT NULL CHECK (max_quantity > 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(schedule_id, ticket_type)
);
```

---

# 12.8 Bảng bookings

```sql
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL REFERENCES event_schedules(schedule_id),
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    payment_account TEXT NOT NULL,
    booking_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_PAYMENT',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# 12.9 Bảng booking_details

```sql
CREATE TABLE booking_details (
    booking_detail_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(booking_id),
    config_id INTEGER NOT NULL REFERENCES ticket_configs(config_id),
    event_day_id INTEGER NOT NULL REFERENCES event_days(event_day_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# 12.10 Bảng e_tickets

```sql
CREATE TABLE e_tickets (
    ticket_code VARCHAR(255) PRIMARY KEY,
    booking_detail_id INTEGER NOT NULL REFERENCES booking_details(booking_detail_id),
    ticket_status VARCHAR(50) NOT NULL DEFAULT 'VALID',
    qr_code_url TEXT,
    issued_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# 12.11 Bảng payment_transactions

```sql
CREATE TABLE payment_transactions (
    payment_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(booking_id),
    gateway_transaction_id VARCHAR(255),
    payment_method VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'INITIATED',
    raw_response JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# 12.12 Bảng refund_transactions

```sql
CREATE TABLE refund_transactions (
    refund_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(booking_id),
    gateway_refund_id VARCHAR(255),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reason TEXT,
    is_manual BOOLEAN NOT NULL DEFAULT FALSE,
    raw_response JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

# 13. Quan hệ database

```txt
events.event_id 1 --- N event_schedules.event_id

venues.venue_id 1 --- N event_schedules.venue_id

event_schedules.schedule_id 1 --- N event_days.schedule_id

event_schedules.schedule_id 1 --- N ticket_configs.schedule_id

event_schedules.schedule_id 1 --- N bookings.schedule_id

event_days.event_day_id 1 --- N event_artists.event_day_id

artists.artist_id 1 --- N event_artists.artist_id

bookings.booking_id 1 --- N booking_details.booking_id

ticket_configs.config_id 1 --- N booking_details.config_id

event_days.event_day_id 1 --- N booking_details.event_day_id

booking_details.booking_detail_id 1 --- N e_tickets.booking_detail_id

bookings.booking_id 1 --- N payment_transactions.booking_id

bookings.booking_id 1 --- N refund_transactions.booking_id
```

---

# 14. Index đề xuất

```sql
CREATE INDEX idx_event_schedules_event_id
ON event_schedules(event_id);

CREATE INDEX idx_event_schedules_venue_id
ON event_schedules(venue_id);

CREATE INDEX idx_event_days_schedule_id
ON event_days(schedule_id);

CREATE INDEX idx_ticket_configs_schedule_id
ON ticket_configs(schedule_id);

CREATE INDEX idx_bookings_schedule_id
ON bookings(schedule_id);

CREATE INDEX idx_bookings_status
ON bookings(booking_status, payment_status);

CREATE INDEX idx_booking_details_booking_id
ON booking_details(booking_id);

CREATE INDEX idx_booking_details_config_day
ON booking_details(config_id, event_day_id);

CREATE INDEX idx_e_tickets_booking_detail_id
ON e_tickets(booking_detail_id);

CREATE INDEX idx_payment_transactions_booking_id
ON payment_transactions(booking_id);

CREATE INDEX idx_refund_transactions_booking_id
ON refund_transactions(booking_id);
```

---

# 15. Business rules cần code trong service

---

## 15.1 Rule capacity

Tổng số vé của một schedule không được vượt quá sức chứa venue.

```txt
sum(ticket_configs.max_quantity where schedule_id = X) <= venue.capacity
```

Nên đặt trong:

```txt
backend/app/services/admin_event_service.py
```

---

## 15.2 Rule ticket availability

Không được bán vượt quá số vé.

```txt
paid_quantity + pending_quantity + requested_quantity <= max_quantity
```

Nên đặt trong:

```txt
backend/app/services/reservation_service.py
```

---

## 15.3 Rule same price by venue

Vì `ticket_configs` gắn với `schedule_id`, mà `schedule_id = event + venue`, nên giá vé tự nhiên được cố định theo từng event tại từng venue.

---

## 15.4 Rule backup artists

Mỗi `event_day` phải có ít nhất 2 backup artists.

```txt
count(event_artists where event_day_id = X and is_backup = true) >= 2
```

Nên kiểm tra khi:

```txt
1. Admin publish event
2. Admin mở bán vé
3. Admin cập nhật danh sách artist
```

---

## 15.5 Rule payment success

Chỉ khi payment success:

```txt
booking_status = PAID
payment_status = PAID
```

thì mới được generate e-ticket.

---

## 15.6 Rule event cancellation

Khi event bị hủy:

```txt
event.status = CANCELLED
event_day.status = CANCELLED
paid bookings -> REFUNDING
tickets -> CANCELLED hoặc REFUNDED
```

---

# 16. Mapping vào project structure hiện tại

---

# 16.1 Backend models

Nên tạo các file:

```txt
backend/app/models/event.py
backend/app/models/venue.py
backend/app/models/event_schedule.py
backend/app/models/event_day.py
backend/app/models/artist.py
backend/app/models/event_artist.py
backend/app/models/ticket_config.py
backend/app/models/booking.py
backend/app/models/booking_detail.py
backend/app/models/e_ticket.py
backend/app/models/payment_transaction.py
backend/app/models/refund_transaction.py
```

---

# 16.2 Backend schemas

Nên tạo:

```txt
backend/app/schemas/event.py
backend/app/schemas/venue.py
backend/app/schemas/event_schedule.py
backend/app/schemas/event_day.py
backend/app/schemas/artist.py
backend/app/schemas/ticket_config.py
backend/app/schemas/booking.py
backend/app/schemas/payment.py
backend/app/schemas/refund.py
backend/app/schemas/ticket.py
```

---

# 16.3 Backend CRUD

Nên tạo:

```txt
backend/app/crud/event.py
backend/app/crud/venue.py
backend/app/crud/event_schedule.py
backend/app/crud/event_day.py
backend/app/crud/artist.py
backend/app/crud/ticket_config.py
backend/app/crud/booking.py
backend/app/crud/payment.py
backend/app/crud/refund.py
backend/app/crud/ticket.py
```

---

# 16.4 Backend services

Nên tạo:

```txt
backend/app/services/event_service.py
backend/app/services/reservation_service.py
backend/app/services/payment_service.py
backend/app/services/ticket_service.py
backend/app/services/refund_service.py
backend/app/services/admin_event_service.py
backend/app/services/artist_service.py
```

---

# 16.5 Backend API routers

Nên tạo:

```txt
backend/app/api/v1/events.py
backend/app/api/v1/reservations.py
backend/app/api/v1/payments.py
backend/app/api/v1/tickets.py
backend/app/api/v1/admin_events.py
backend/app/api/v1/admin_venues.py
backend/app/api/v1/admin_artists.py
backend/app/api/v1/admin_bookings.py
backend/app/api/v1/admin_refunds.py
```

---

# 16.6 Worker

Nên tạo:

```txt
backend/app/worker/send_ticket_email.py
backend/app/worker/process_refund.py
backend/app/worker/expire_reservations.py
```

---

# 16.7 Frontend types

Nên tạo:

```txt
frontend/src/types/event.ts
frontend/src/types/venue.ts
frontend/src/types/artist.ts
frontend/src/types/booking.ts
frontend/src/types/payment.ts
frontend/src/types/ticket.ts
frontend/src/types/refund.ts
```

---

# 16.8 Frontend API clients

Nên tạo:

```txt
frontend/src/api/events.ts
frontend/src/api/reservations.ts
frontend/src/api/payments.ts
frontend/src/api/tickets.ts
frontend/src/api/adminEvents.ts
frontend/src/api/adminArtists.ts
frontend/src/api/adminBookings.ts
frontend/src/api/adminRefunds.ts
```

---

# 16.9 Frontend pages

Nên tạo:

```txt
frontend/src/pages/HomePage.tsx
frontend/src/pages/EventListPage.tsx
frontend/src/pages/EventDetailPage.tsx
frontend/src/pages/ReservationPage.tsx
frontend/src/pages/PaymentPage.tsx
frontend/src/pages/TicketPage.tsx

frontend/src/pages/admin/AdminDashboardPage.tsx
frontend/src/pages/admin/AdminEventListPage.tsx
frontend/src/pages/admin/AdminEventFormPage.tsx
frontend/src/pages/admin/AdminArtistPage.tsx
frontend/src/pages/admin/AdminBookingPage.tsx
frontend/src/pages/admin/AdminRefundPage.tsx
```

---

# 17. Thứ tự triển khai code đề xuất

## Phase 1: Database core

```txt
1. events
2. venues
3. event_schedules
4. event_days
5. artists
6. event_artists
7. ticket_configs
```

---

## Phase 2: Admin CRUD

```txt
1. CRUD event
2. CRUD venue
3. CRUD schedule
4. CRUD day
5. CRUD ticket config
6. CRUD artist
7. Assign artist
```

---

## Phase 3: Customer event browsing

```txt
1. List events
2. Event detail
3. Remaining ticket calculation
```

---

## Phase 4: Reservation

```txt
1. Create booking
2. Create booking details
3. Validate availability
4. Lock ticket config
5. Expire pending bookings
```

---

## Phase 5: Payment

```txt
1. Create payment transaction
2. Mock payment gateway
3. Payment webhook
4. Mark booking paid
```

---

## Phase 6: Ticket

```txt
1. Generate ticket
2. Generate QR
3. Download ticket
4. Send email
```

---

## Phase 7: Refund

```txt
1. Cancel event
2. Find paid bookings
3. Create refund transaction
4. Process refund
5. Manual refund retry
```

---

# 18. Gợi ý tối thiểu để AI gen code tốt

Khi yêu cầu AI gen code, nên đưa rõ:

```txt
Project uses FastAPI + SQLAlchemy + Alembic.
Follow layered architecture:
- api handles request/response only
- services handle business logic
- crud handles database query
- models define SQLAlchemy tables
- schemas define Pydantic input/output

Generate code for one module at a time.
Start with database models and Alembic migration.
```

Ví dụ prompt:

```txt
Generate FastAPI code for Event, Venue, EventSchedule, EventDay modules.
Use SQLAlchemy models, Pydantic schemas, CRUD layer, service layer, and API router.
Do not put business logic in API router.
Follow the project structure in STRUCTURE.md.
```

---

# 19. Kết luận

Thiết kế này phù hợp với project hiện tại vì:

```txt
1. Tách rõ frontend và backend.
2. Tách rõ API, service, CRUD, model, schema.
3. Hỗ trợ booking concurrent.
4. Hỗ trợ thanh toán và hoàn tiền.
5. Hỗ trợ admin dashboard.
6. Dễ mở rộng thêm worker, queue, notification.
7. Dễ cho AI gen code từng module.
```

