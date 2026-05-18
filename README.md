# Event Booking Platform

Nền tảng đặt vé sự kiện gồm backend FastAPI, frontend React/Vite và database PostgreSQL. Hệ thống hỗ trợ các luồng chính: xem sự kiện, đặt vé, thanh toán demo, phát hành e-ticket và quản trị sự kiện/địa điểm/nghệ sĩ/booking.

## Công Nghệ

- Backend: Python 3.11, FastAPI, SQLAlchemy, Pydantic, APScheduler.
- Frontend: React 18, Vite, TypeScript, React Router.
- Database: PostgreSQL.
- Driver database: `pg8000`.
- Package manager frontend: npm.

## Cấu Trúc Project

```text
event-booking-platform/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI routers
│   │   ├── core/             # config, database, security
│   │   ├── crud/             # database CRUD helpers
│   │   ├── db/               # SQLAlchemy Base
│   │   ├── models/           # SQLAlchemy models theo schema.sql
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # business logic
│   │   └── worker/           # background scheduler/jobs
│   ├── alembic/
│   ├── tests/
│   ├── .env
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/              # API client và endpoint wrappers
│   │   ├── components/       # UI components tái sử dụng
│   │   ├── context/          # React context, ví dụ admin auth
│   │   ├── hooks/            # custom hooks
│   │   ├── pages/            # page-level components
│   │   ├── styles/           # global CSS
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # format/helper functions
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── schema.sql                # schema database hiện tại
├── UI_Structure.md           # kế hoạch frontend/UI
└── README.md
```

## Cấu Trúc Frontend

```text
frontend/src/
├── api/
│   ├── client.ts             # fetch wrapper, base URL, error handling
│   ├── admin.ts              # admin auth/dashboard APIs
│   ├── events.ts             # public/admin event APIs
│   ├── payments.ts           # payment demo APIs
│   ├── reservations.ts       # reservation API
│   └── tickets.ts            # e-ticket APIs
├── components/
│   ├── admin/                # admin dashboard widgets
│   ├── booking/              # booking summary/form support
│   ├── common/               # Button, Card, async states
│   ├── events/               # event cards/list UI
│   ├── layout/               # customer/admin layouts
│   └── tickets/              # ticket display components
├── context/
│   └── AdminAuthContext.tsx  # token/session state cho admin
├── hooks/
│   └── useAsync.ts           # loading/error/data helper
├── pages/
│   ├── admin/                # admin pages
│   └── customer/             # public customer pages
├── styles/
│   └── globals.css
├── types/
│   └── *.ts                  # Event, Booking, Payment, Venue...
└── utils/
    └── format.ts
```

### Frontend Pages Chính

- Customer:
  - `/`: trang chủ, danh sách sự kiện nổi bật.
  - `/events`: danh sách sự kiện.
  - `/events/:eventId`: chi tiết sự kiện.
  - `/booking`: tạo reservation.
  - `/checkout`: thanh toán demo.
  - `/tickets/booking/:bookingId`: vé theo booking.
  - `/tickets/:ticketCode`: chi tiết vé.
- Admin:
  - `/admin/login`: đăng nhập admin.
  - `/admin`: dashboard.
  - `/admin/events`: quản lý sự kiện.
  - `/admin/events/new`: tạo sự kiện.
  - `/admin/events/:eventId/setup`: tạo schedule/day/ticket config.
  - `/admin/venues`: quản lý địa điểm.
  - `/admin/artists`: quản lý nghệ sĩ.
  - `/admin/bookings`: xem booking.
  - `/admin/refunds`: xử lý refund demo.

## Yêu Cầu Môi Trường

- Python 3.11. Không nên dùng Python 3.14 vì một số dependency như `pydantic-core` có thể lỗi build.
- Node.js 18+ và npm.
- PostgreSQL.
- Windows PowerShell hoặc CMD.

## Cài Đặt Backend

Mở terminal tại thư mục gốc project:

```powershell
cd "D:\Personal\Documents\3rd Year - Semester 2\System Analysis and Design\event-booking-platform"
cd backend
```

### 1. Tạo virtual environment bằng Python 3.11

Chỉ cần chạy lần đầu:

```powershell
py -3.11 -m venv .venv
```

Nếu cần kiểm tra các bản Python đang có:

```powershell
py -0
```

### 2. Kích hoạt `.venv`

PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

CMD:

```cmd
.venv\Scripts\activate.bat
```

Kiểm tra đúng Python trong `.venv`:

```powershell
python --version
where python
```

Kết quả đúng nên trỏ về:

```text
...\event-booking-platform\backend\.venv\Scripts\python.exe
```

Lưu ý: khi đã activate `.venv`, dùng `python`, không dùng `py`. Lệnh `py` là Python Launcher của Windows và có thể chạy nhầm Python global.

### 3. Cài dependency backend

```powershell
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
```

### 4. Cấu hình database

Tạo file `backend/.env`:

```env
DATABASE_URL="postgresql+pg8000://postgres:your_password@localhost:5432/event_booking"
FRONTEND_URL="http://127.0.0.1:5173"
```

Tạo database PostgreSQL tên `event_booking`, sau đó import schema:

```powershell
psql -U postgres -d event_booking -f ..\schema.sql
```

Nếu không có `psql` trong PATH, có thể import `schema.sql` bằng pgAdmin.

### 5. Chạy backend

Đứng trong thư mục `backend`:

```powershell
python -m uvicorn app.main:app --reload
```

URL backend:

- Health check: `http://127.0.0.1:8000/health`
- Swagger docs: `http://127.0.0.1:8000/docs`
- Events API: `http://127.0.0.1:8000/api/v1/events`

## Cài Đặt Frontend

Mở terminal khác tại thư mục gốc project:

```powershell
cd "D:\Personal\Documents\3rd Year - Semester 2\System Analysis and Design\event-booking-platform"
cd frontend
```

### 1. Cài dependency frontend

```powershell
npm install
```

### 2. Cấu hình API URL

Frontend mặc định gọi:

```text
http://localhost:8000/api/v1
```

Nếu muốn cấu hình rõ, tạo file `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

### 3. Chạy frontend dev server

```powershell
npm run dev
```

Vite thường chạy tại:

```text
http://127.0.0.1:5173
```

hoặc:

```text
http://localhost:5173
```

Backend đã allow CORS cho cả `localhost:5173` và `127.0.0.1:5173`.

### 4. Build frontend

```powershell
npm run build
```

Preview bản build:

```powershell
npm run preview
```

## Quy Trình Chạy Full Project

Terminal 1, backend:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

Terminal 2, frontend:

```powershell
cd frontend
npm run dev
```

Sau đó mở:

```text
http://127.0.0.1:5173
```

## Test Nhanh

Backend:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -c "from app.main import app; print('import ok')"
```

Gọi API bằng browser:

```text
http://127.0.0.1:8000/health
http://127.0.0.1:8000/api/v1/events?limit=6
```

Frontend:

```powershell
cd frontend
npm run build
```

## Lỗi Thường Gặp

### `ModuleNotFoundError: No module named 'app'`

Bạn đang chạy backend từ sai thư mục. Cách đúng:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

### Đã activate `.venv` nhưng vẫn dùng Python global

Kiểm tra:

```powershell
where python
python --version
```

Nếu không trỏ vào `backend\.venv\Scripts\python.exe`, hãy activate lại đúng `.venv`.

### Lỗi build `pydantic-core`

Thường do tạo `.venv` bằng Python quá mới như Python 3.14. Tạo lại bằng Python 3.11:

```powershell
cd backend
Remove-Item -Recurse -Force .venv
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

### UI báo `Could not load data`

Kiểm tra theo thứ tự:

1. Backend có đang chạy ở `http://127.0.0.1:8000` không.
2. Mở `http://127.0.0.1:8000/api/v1/events?limit=6` có trả JSON không.
3. Frontend `.env` nếu có thì `VITE_API_URL` phải là `http://127.0.0.1:8000/api/v1`.
4. Restart backend sau khi sửa CORS hoặc `.env`.

### API trả 500 do thiếu cột database

Backend hiện đã được chỉnh theo `schema.sql`. Nếu database đang dùng schema cũ/khác, hãy import lại `schema.sql` hoặc cập nhật database cho khớp model hiện tại.

## Ghi Chú Về Database

`schema.sql` hiện là nguồn tham chiếu chính cho database. Một số chức năng như payment transaction, refund transaction, event status, banner image, QR image đang được xử lý ở mức demo/tương thích vì schema hiện tại chưa có các bảng/cột riêng cho chúng.

Nếu cần hệ thống đầy đủ hơn, bước tiếp theo nên là bổ sung migration/schema cho:

- `events.status`, `events.banner_url`, timestamps.
- `bookings.expires_at`, `bookings.total_amount`, trạng thái booking riêng.
- `payment_transactions`.
- `refund_transactions`.
- `e_tickets.qr_code_url`, `issued_at`, `used_at`.
