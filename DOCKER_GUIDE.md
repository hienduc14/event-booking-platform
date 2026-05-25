# Docker Guide

Tai lieu nay giai thich cau truc Docker hien tai cua project sau khi database da duoc tach ra mot node rieng.

## Tong Quan

Compose hien tai chi chay 2 service cua ung dung:

- `backend`: FastAPI chay bang Uvicorn tren Python 3.11.
- `frontend`: React/Vite duoc build thanh static files va serve bang Nginx.

PostgreSQL khong con nam trong `docker-compose.yml`. Backend se ket noi toi database HA ben ngoai thong qua bien moi truong `DATABASE_URL`.

Database HA hien tai:

```text
Host tren may host: localhost
Port: 5000
Username: postgres
Password: postgres
Database: postgres
```

Khi backend chay trong Docker container, connection string dung:

```env
DATABASE_URL=postgresql+pg8000://postgres:postgres@host.docker.internal:5000/postgres
```

## Cau Truc File

```text
event-booking-platform/
├── docker-compose.yml
├── .env.docker.example
├── DOCKER_GUIDE.md
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   └── app/
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf
    ├── package.json
    ├── package-lock.json
    └── src/
```

## `docker-compose.yml`

File nay dinh nghia cach build va chay backend/frontend.

### Service `backend`

```yaml
backend:
  build:
    context: ./backend
```

Service nay build image tu [backend/Dockerfile](backend/Dockerfile).

Bien moi truong quan trong:

```yaml
DATABASE_URL: ${DATABASE_URL:?Set DATABASE_URL in .env}
FRONTEND_URL: ${FRONTEND_URL:-http://localhost:5173}
BACKEND_URL: ${BACKEND_URL:-http://localhost:8000}
```

Y nghia:

- `DATABASE_URL` la connection string toi PostgreSQL HA ben ngoai.
- `FRONTEND_URL` duoc FastAPI dung cho CORS.
- `BACKEND_URL` la URL public/local cua backend.

Port:

```yaml
"8000:8000"
```

May local truy cap backend qua:

```text
http://localhost:8000
```

### Service `frontend`

```yaml
frontend:
  build:
    context: ./frontend
```

Service nay build image tu [frontend/Dockerfile](frontend/Dockerfile).

Build arg:

```yaml
VITE_API_URL: ${VITE_API_URL:-http://localhost:8000/api/v1}
```

Vite se embed URL nay vao frontend luc build. Browser se dung URL nay de goi backend API.

Port:

```yaml
"5173:80"
```

Ben trong container, Nginx nghe port `80`. Tren may local, truy cap frontend qua:

```text
http://localhost:5173
```

## File `.env`

Docker Compose tu dong doc file `.env` o thu muc goc project. File nay khong nen commit neu co password that.

Da co file mau:

```text
.env.docker.example
```

Tao file `.env` tu file mau:

```powershell
Copy-Item .env.docker.example .env
```

File `.env` hien tai da duoc cau hinh san:

```env
DATABASE_URL=postgresql+pg8000://postgres:postgres@host.docker.internal:5000/postgres
```

Neu database HA doi host/port, sua lai dong nay. Vi du khi backend container co the truy cap truc tiep IP database:

```env
DATABASE_URL=postgresql+pg8000://postgres:my_password@192.168.1.50:5000/postgres
```

Luu y:

- Khong dung `localhost` trong `DATABASE_URL` khi backend chay trong container va PostgreSQL dang expose tren may host.
- Tu ben trong backend container, `localhost` la chinh container backend, khong phai may host.
- Tren Docker Desktop, dung `host.docker.internal` de container goi service dang expose tren may host.
- Dung IP, DNS name, hoac hostname Docker network ma backend container co the truy cap.

## `backend/Dockerfile`

```dockerfile
FROM python:3.11-slim
```

Dung Python 3.11 theo README cua project.

```dockerfile
WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel \
    && pip install -r requirements.txt
COPY app ./app
```

Quy trinh:

1. Tao thu muc lam viec `/app`.
2. Copy `requirements.txt`.
3. Cai dependency backend.
4. Copy source code FastAPI trong `app/`.

```dockerfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

`--host 0.0.0.0` giup backend nhan request tu ben ngoai container.

## `frontend/Dockerfile`

Frontend dung multi-stage build.

Stage build:

```dockerfile
FROM node:20-alpine AS build
RUN npm ci
RUN npm run build
```

Stage serve:

```dockerfile
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
```

Ket qua la image frontend gon hon, chi chua Nginx va static files da build.

## `frontend/nginx.conf`

Dong quan trong:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

React Router xu ly route tren browser. Khi user vao truc tiep `/events/1` hoac `/admin/login`, Nginx can tra ve `index.html` de React app tiep quan route.

## Luong Chay Hien Tai

Khi chay:

```powershell
docker compose up --build
```

Thu tu hoat dong:

1. Docker build backend image.
2. Docker build frontend image.
3. Backend container start.
4. Backend doc `DATABASE_URL` va ket noi toi PostgreSQL node ben ngoai.
5. Frontend container start Nginx.
6. Browser mo `http://localhost:5173`.
7. Frontend goi API den `VITE_API_URL`, mac dinh la `http://localhost:8000/api/v1`.

## URL Su Dung

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8000
Swagger:  http://localhost:8000/docs
Health:   http://localhost:8000/health
Database: host.docker.internal:5000/postgres
```

## Lenh Thuong Dung

Build va chay:

```powershell
docker compose up --build
```

Chay nen background:

```powershell
docker compose up -d --build
```

Dung container:

```powershell
docker compose down
```

Xem log:

```powershell
docker compose logs -f
```

Xem log backend:

```powershell
docker compose logs -f backend
```

Kiem tra compose da doc dung bien moi truong:

```powershell
docker compose config
```

## Luu Y Quan Trong

- `docker-compose.yml` khong tao database nua.
- `schema.sql` phai duoc import o database node rieng neu database chua co schema.
- Backend container phai truy cap duoc host/port PostgreSQL trong `DATABASE_URL`.
- PostgreSQL HA node hien tai duoc cau hinh qua `host.docker.internal:5000`.
- PostgreSQL node rieng can allow network/firewall cho backend container ket noi toi port `5000`.
- Neu database node cung nam trong Docker network khac, can dam bao backend container co route/network toi node do.
- Moi lan doi `VITE_API_URL`, can build lai frontend vi bien nay duoc Vite embed luc build.
