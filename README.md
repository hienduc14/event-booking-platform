# Event Booking Platform

Nền tảng đặt vé sự kiện được xây dựng nhằm mục đích cung cấp giải pháp đặt vé, quản lý sự kiện và nghệ sĩ với khả năng mở rộng cao, phục vụ traffic lớn.

## Công nghệ sử dụng (Tech Stack)

- **Backend**: Python 3, FastAPI, SQLAlchemy (ORM), Alembic (Migrations).
- **Frontend**: React (Vite), TypeScript.
- **Database**: PostgreSQL (Dữ liệu quan hệ chính).
- **Cache / Queue**: Redis (Giữ chỗ vé, cache danh sách sự kiện).
- **Background Tasks**: Celery (Gửi Email/SMS vé điện tử).

## Cấu trúc dự án sơ bộ

Dự án được chia thành 2 module độc lập:
- `/backend`: Chứa mã nguồn API Server (FastAPI).
- `/frontend`: Chứa mã nguồn Web App (Vite React).
- `/docs`: Chứa các tài liệu phân tích thiết kế (Usecase, Sequence, DFD, Database Schema).

*(Xem thêm file [STRUCTURE.md](./STRUCTURE.md) để hiểu rõ hơn về kiến trúc thư mục chi tiết và luồng dữ liệu).*

## Hướng dẫn cài đặt (Môi trường phát triển)

### 1. Backend (FastAPI)

```bash
cd backend

# 1. Tạo môi trường ảo (Virtual Environment)
python -m venv venv
# Active trên Windows:
.\venv\Scripts\activate
# Active trên Mac/Linux:
source venv/bin/activate

# 2. Cài đặt thư viện
pip install -r requirements.txt

# 3. Chạy server phát triển (Port 8000)
uvicorn app.main:app --reload
```

> **Lưu ý**: Cần cài đặt và chạy PostgreSQL + Redis để API hoạt động đầy đủ. API Docs (Swagger) sẽ có mặt tại `http://localhost:8000/docs`.

### 2. Frontend (Vite React)

```bash
cd frontend

# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Chạy ứng dụng phát triển (Port 5173 mặc định)
npm run dev
```

## Các tính năng chính (Roadmap)
- [ ] Quản lý Sự kiện & Địa điểm (Kèm cấu hình giá vé).
- [ ] Quản lý Nghệ sĩ & Backup (Ít nhất 2 nghệ sĩ dự phòng).
- [ ] Luồng Đặt vé & Thanh toán (Giữ chỗ tạm thời để tránh Overselling).
- [ ] Tự động hoàn tiền khi sự kiện bị hủy.
