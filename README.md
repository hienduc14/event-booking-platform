# Event Booking Platform

Nền tảng đặt vé sự kiện được xây dựng để hỗ trợ đặt vé, quản lý sự kiện, quản lý nghệ sĩ và các luồng vận hành liên quan.

## Công Nghệ Sử Dụng

- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Alembic.
- **Frontend**: React, Vite, TypeScript.
- **Database**: PostgreSQL.
- **Cache / Queue**: Redis.
- **Background Tasks**: APScheduler / worker module.

## Cấu Trúc Dự Án

- `backend`: mã nguồn API Server FastAPI.
- `frontend`: mã nguồn Web App React.
- `docs`: tài liệu phân tích thiết kế.

Xem thêm [STRUCTURE.md](./STRUCTURE.md) để hiểu rõ hơn về kiến trúc thư mục và cách phân lớp backend/frontend.

## Yêu Cầu Hệ Thống

Trước khi chạy dự án, cần cài:

1. **Python 3.11** cho backend. Không nên dùng Python 3.14 vì một số dependency như `pydantic-core` có thể lỗi build.
2. **Node.js 18+ và npm** cho frontend.
3. **PostgreSQL** cho database chính.
4. **Redis** nếu chạy đầy đủ các chức năng cache/queue/background task.

## Cài Đặt Và Chạy Backend

Các lệnh bên dưới dùng cho Windows CMD. Nên mở terminal tại thư mục gốc của project:

```cmd
cd "D:\Personal\Documents\3rd Year - Semester 2\System Analysis and Design\event-booking-platform"
```

### 1. Vào thư mục backend

```cmd
cd backend
```

### 2. Tạo virtual environment bằng Python 3.11

Chỉ cần chạy lần đầu, hoặc khi muốn tạo lại môi trường sạch:

```cmd
py -3.11 -m venv .venv
```

Nếu máy không nhận `py -3.11`, kiểm tra các bản Python đã cài:

```cmd
py -0
```

### 3. Kích hoạt `.venv`

Mỗi lần mở terminal mới để làm backend, cần activate lại:

```cmd
.venv\Scripts\activate.bat
```

Sau khi activate, terminal sẽ có dạng:

```text
(.venv) D:\...\event-booking-platform\backend>
```

Kiểm tra đúng Python:

```cmd
python --version
where python
```

Kết quả đúng nên là Python 3.11 và `where python` phải trỏ về:

```text
...\event-booking-platform\backend\.venv\Scripts\python.exe
```

Lưu ý: sau khi đã vào `.venv`, hãy dùng `python`, không dùng `py`. Lệnh `py` là Python Launcher của Windows và có thể chạy nhầm Python global.

### 4. Cài thư viện backend

```cmd
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
```

### 5. Cấu hình database

Tạo file `backend\.env` nếu chưa có, ví dụ:

```env
DATABASE_URL="postgresql+pg8000://postgres:88888888@localhost:5432/event_booking"
```

Cần đảm bảo PostgreSQL đang chạy và database `event_booking` đã được tạo.

### 6. Chạy FastAPI server

Đứng trong thư mục `backend` và chạy:

```cmd
python -m uvicorn app.main:app --reload
```

Không nên chạy trực tiếp:

```cmd
uvicorn app.main:app --reload
```

vì có thể gọi nhầm `uvicorn` từ Python global thay vì `.venv`.

Sau khi chạy thành công:

- Health check: `http://127.0.0.1:8000/health`
- Swagger API Docs: `http://127.0.0.1:8000/docs`

## Cài Đặt Và Chạy Frontend

Mở terminal khác tại thư mục gốc project:

```cmd
cd frontend
npm install
npm run dev
```

Mặc định frontend chạy tại:

```text
http://localhost:5173
```

## Lỗi Thường Gặp

### `ModuleNotFoundError: No module named 'app'`

Nguyên nhân thường là chạy backend từ sai thư mục. Cách đúng:

```cmd
cd backend
.venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload
```

### Đã activate `.venv` nhưng vẫn dùng Python global

Kiểm tra:

```cmd
where python
python --version
```

Nếu `where python` không trỏ vào `backend\.venv\Scripts\python.exe`, hãy deactivate rồi activate lại đúng môi trường.

### Lỗi build `pydantic-core`

Thường xảy ra khi tạo `.venv` bằng Python quá mới như Python 3.14. Xóa `.venv` cũ và tạo lại bằng Python 3.11:

```cmd
rmdir /s /q .venv
py -3.11 -m venv .venv
.venv\Scripts\activate.bat
python -m pip install -r requirements.txt
```

## Test Backend

Hiện tại có thể bắt đầu bằng smoke test thủ công:

```text
GET http://127.0.0.1:8000/health
GET http://127.0.0.1:8000/docs
```

Nếu dùng pytest, cài dependency test rồi chạy từ thư mục `backend`:

```cmd
python -m pip install pytest
python -m pytest
```

Nên dùng database test riêng để tránh ảnh hưởng dữ liệu phát triển.
