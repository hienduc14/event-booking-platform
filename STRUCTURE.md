# Kiến trúc và Cấu trúc Thư mục (Architecture & Project Structure)

Tài liệu này giải thích cấu trúc mã nguồn để hỗ trợ cho việc onboarding của lập trình viên mới hoặc các công cụ AI khi tham gia vào dự án.

## Tổng quan Kiến trúc

Dự án áp dụng mô hình kiến trúc phân tách Client-Server:
- **Client (Frontend)**: ReactJS (Vite), phụ trách hiển thị và quản lý state cục bộ. Gọi API để lấy dữ liệu.
- **Server (Backend)**: FastAPI (Python), áp dụng **Domain-Driven Design (DDD) cơ bản** và **Layered Architecture**. Điều này giúp tách biệt rõ ràng giữa:
  1. Routing / API Interface (`app/api`)
  2. Business Logic (`app/services`)
  3. Data Access (`app/crud` và `app/models`)
  4. Data Validation (`app/schemas`)

---

## Cấu trúc chi tiết: Backend (`/backend`)

Thư mục chính là `backend/app`. Dưới đây là ý nghĩa của từng thư mục và cách AI/Developer nên phân bổ code:

- `main.py`: Entry point của ứng dụng FastAPI. Khởi tạo app, thiết lập CORS, kết nối Database, và đăng ký các Router từ `api/`.
- `api/`: Lớp Controller. Chỉ chịu trách nhiệm định nghĩa các API Endpoints, nhận request, xác thực quyền (auth), gọi các hàm ở `services/` hoặc `crud/`, và trả về response. **Không viết logic nghiệp vụ phức tạp ở đây.**
- `core/`: Chứa các cấu hình cốt lõi như đọc biến môi trường (`config.py`), mã hóa/giải mã token (`security.py`).
- `crud/` (Create, Read, Update, Delete): Lớp Data Access. Chứa các hàm giao tiếp trực tiếp với cơ sở dữ liệu qua SQLAlchemy. Các hàm ở đây nên có tính tái sử dụng cao.
- `models/`: Chứa các Data Model của SQLAlchemy. Đây là nơi định nghĩa cấu trúc bảng (Tables) trong Database (ví dụ: Event, Venue, Ticket).
- `schemas/`: Chứa các Pydantic Model dùng để validate dữ liệu đầu vào (Request body) và định hình dữ liệu đầu ra (Response body). Cần phân biệt rõ `schemas` (dành cho API validation) và `models` (dành cho Database).
- `services/`: Lớp Business Logic. Đây là **trái tim của hệ thống**. Nơi chứa các thuật toán và nghiệp vụ phức tạp. Ví dụ: Hàm kiểm tra "có đủ 2 nghệ sĩ dự phòng chưa", hay "xử lý logic trừ vé khi có người đặt thành công" sẽ nằm ở đây. API Router gọi Service, Service gọi CRUD.
- `worker/`: Chứa các tasks bất đồng bộ (Celery/RQ) như việc gửi Email vé, gọi API hoàn tiền.
- `alembic/`: Công cụ quản lý Database Migrations (như phiên bản của CSDL). Khi thay đổi file trong `models/`, cần tạo migration qua Alembic.

---

## Cấu trúc chi tiết: Frontend (`/frontend`)

Dự án sử dụng Vite React với cấu trúc chia theo Feature/Domain cơ bản. Mọi mã nguồn nằm trong `frontend/src`:

- `api/`: Chứa các hàm dùng Axios/Fetch để gọi lên Backend API (tương ứng với các endpoint ở FastAPI).
- `components/`: Chứa các UI components dùng chung (Dumb components), ví dụ như Button, Modal, Card, Input fields.
- `pages/`: Chứa các trang hiển thị tương ứng với các Route của ứng dụng (Smart components). Các trang này sẽ kết nối với `api/` hoặc `store/` để lấy dữ liệu.
- `hooks/`: Chứa các custom React Hooks (`useAuth`, `useCart`, `useEventList`,...) để tái sử dụng logic ở nhiều component.
- `store/`: Quản lý State toàn cục của ứng dụng (nếu dùng Redux/Zustand), ví dụ như trạng thái giỏ hàng chứa vé đang chọn.
- `types/`: Chứa các interface/type của TypeScript (Nên đồng bộ định dạng với `schemas` của backend).
- `utils/`: Các hàm tiện ích dùng chung (format thời gian, định dạng tiền tệ VNĐ).

---

## Hướng dẫn cho AI và Developer khi thêm tính năng mới

1. **Thiết kế Database trước**: Bắt đầu bằng việc thêm class vào `backend/app/models/`, sau đó tạo Alembic migration.
2. **Xác định Input/Output**: Viết Pydantic schemas tại `backend/app/schemas/`.
3. **Viết CRUD**: Tạo file tại `backend/app/crud/` để thao tác DB cho model vừa tạo.
4. **Logic nghiệp vụ (Nếu có)**: Đưa các rule tính toán, ràng buộc vào `backend/app/services/`.
5. **Mở API**: Viết Endpoint tại `backend/app/api/v1/` và gọi CRUD/Service đã tạo.
6. **Cập nhật Frontend**:
   - Định nghĩa Type tại `frontend/src/types/`.
   - Viết hàm gọi API tại `frontend/src/api/`.
   - Cập nhật UI tại `components/` và `pages/`.

Bám sát quy trình này sẽ giúp cấu trúc code luôn rõ ràng, dễ bảo trì, và thuận lợi cho việc scale hệ thống lên các module lớn hơn (Payment, Notification, CMS) sau này.
