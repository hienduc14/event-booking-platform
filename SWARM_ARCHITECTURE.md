# Docker Swarm Architecture

Tai lieu nay mo ta cach chuyen deployment hien tai tu Docker Compose sang Docker Swarm cho frontend va backend. Database da duoc tach rieng, co HA/scale rieng, nen khong duoc dua vao Swarm stack nay.

## Project Analysis

### Frontend

- Framework: React 18, Vite, TypeScript, React Router.
- Container runtime: Nginx serve static files tu `/usr/share/nginx/html`.
- Dockerfile: multi-stage build bang `node:20-alpine`, runtime bang `nginx:1.27-alpine`.
- Internal port: `80`.
- Published port hien tai: `5173`.
- API base URL: `VITE_API_URL`, duoc Vite embed vao bundle tai thoi diem build image.
- Default local API URL: `http://localhost:8000/api/v1`.

### Backend

- Framework: FastAPI, Uvicorn, SQLAlchemy, Pydantic settings, APScheduler.
- Runtime: Python 3.11 slim.
- Internal port: `8000`.
- Published port hien tai: `8000`.
- Health endpoint hien co: `GET /health`.
- Database driver: `pg8000`.
- Backend ket noi database qua `DATABASE_URL`.

### Current Compose State

- Service hien tai: `backend`, `frontend`.
- Khong co database trong `docker-compose.yml`.
- Khong co volume duoc khai bao trong `docker-compose.yml`.
- Frontend `depends_on` backend trong Compose, nhung khi chuyen sang Swarm khong dung `depends_on`; readiness duoc xu ly bang healthcheck va retry tu client/app.

### Required Environment Variables

Bat buoc cho production:

- `DATABASE_URL`: PostgreSQL external HA endpoint.
- `SECRET_KEY`: khoa bao mat cua backend.
- `ADMIN_PASSWORD`: mat khau admin.

Nen cau hinh ro:

- `FRONTEND_URL`: public URL frontend, dung cho CORS.
- `BACKEND_URL`: public URL backend.
- `VITE_API_URL`: API URL duoc dung khi build frontend image.
- `ADMIN_USERNAME`: username admin.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`: email notification neu dung SMTP.
- `RESERVATION_TIMEOUT_MINUTES`: timeout giu cho dat ve.

## Target Architecture

```text
Internet / Users
       |
       v
Docker Swarm Routing Mesh
  - published 5173 -> frontend service port 80
  - published 8000 -> backend service port 8000
       |
       v
+-------------------------------+
| Overlay network: app_net      |
|                               |
| frontend service              |
| - 3 replicas                  |
| - Nginx static hosting        |
|                               |
| backend service               |
| - 3 replicas                  |
| - FastAPI/Uvicorn             |
+-------------------------------+
       |
       v
External PostgreSQL HA Database
```

## Service Communication

```text
Browser
  |
  | HTTP http://<swarm-node>:5173
  v
frontend replicas through Routing Mesh
  |
  | Browser-side fetch to VITE_API_URL
  v
backend replicas through Routing Mesh
  |
  | DATABASE_URL
  v
External PostgreSQL HA endpoint
```

Frontend hien tai la SPA static. Request API duoc chay trong browser, nen `VITE_API_URL` phai la URL ma browser truy cap duoc, vi du:

```env
VITE_API_URL=http://your-public-domain-or-node-ip:8000/api/v1
```

Neu sau nay them reverse proxy, co the build frontend voi URL cung origin nhu `/api/v1`. Giai doan hien tai khong them Nginx/Traefik rieng, nen dung published backend port qua Routing Mesh.

## Swarm Design

- Cluster toi thieu: 3 node Swarm de dam bao HA tot hon.
- Network: `app_net`, driver `overlay`.
- Published ports dung `mode: ingress`, tan dung Docker Swarm Routing Mesh.
- Service discovery noi bo dung service name `frontend` va `backend` tren overlay network.
- Khong dung `host` networking.
- Khong dat database vao stack.
- Khong khai bao local volume cho app service.

## HA Strategy

- `frontend`: 3 replicas, duoc spread theo `node.id`.
- `backend`: 3 replicas, duoc spread theo `node.id`.
- Neu mot container loi, Swarm restart container theo `restart_policy`.
- Neu mot node loi, Swarm scheduler dat lai task tren node con song neu cluster con du capacity.
- Healthcheck giup Swarm danh dau task unhealthy va thay the task loi.

## Rolling Update Strategy

- Update tung replica voi `parallelism: 1`.
- `order: start-first` de container moi start truoc khi container cu bi stop, giam downtime.
- `failure_action: rollback` de rollback tu dong khi update loi.
- `monitor: 30s` de Swarm theo doi task moi sau update.
- `rollback_config` cung dung `parallelism: 1` va `order: start-first`.

## Scaling Strategy

Mac dinh:

- Frontend: 3 replicas.
- Backend: 3 replicas.

Scale ngang khi can:

```powershell
docker service scale event_booking_frontend=5
docker service scale event_booking_backend=5
```

Can theo doi CPU, memory, DB connection pool va latency truoc khi tang replicas backend. Backend hien cau hinh SQLAlchemy `pool_size=10`, `max_overflow=20`; voi 3 replicas, so connection toi database co the tang dang ke.

## Stateless, Session, Scheduler

Khong thay doi business logic trong lan chuyen Swarm nay.

Quan sat hien tai:

- Khong thay co che server-side session memory trong source hien co.
- Frontend co support bearer token trong API client, nhung source hien tai khong thay admin auth context thuc su trong tree hien co.
- Backend co `SECRET_KEY`, nhung `Settings` hien tai chua khai bao field nay trong `backend/app/core/config.py`; vi `extra = "ignore"`, bien nay se bi bo qua neu code khong doc o noi khac.

Khuyen nghi de scale backend:

- Dung JWT/stateless auth neu can auth.
- Neu dung server-side session sau nay, dung Redis Session Store hoac storage dung chung, khong luu session trong memory cua tung container.
- Backend dang start APScheduler trong moi FastAPI replica. Khi `backend` co 3 replicas, cac job `cancel_expired_reservations` va `process_pending_refunds` se chay 3 lan theo lich. Nen tach thanh worker service 1 replica, hoac them distributed lock tren database/Redis truoc khi chay production voi nhieu backend replicas.

## Upload File And Local Filesystem

Khong thay endpoint upload file hay ghi file local trong source backend hien tai.

Neu sau nay them upload file, khong nen luu file vao filesystem local cua container vi replicas khac khong thay duoc file va file mat khi container bi thay the. Dung mot trong cac lua chon:

- S3 compatible object storage.
- MinIO.
- Cloud object storage cua provider.
- CDN/object storage cho public assets.

## Image Deployment Model

Swarm stack khong dung `build:`.

Voi lab local single-node Swarm, `.env` dang dung image name local:

```env
REGISTRY=event-booking
FRONTEND_TAG=frontend.0.0
BACKEND_TAG=backend.0.0
```

Build image local truoc khi deploy:

```text
event-booking/frontend:frontend.0.0
event-booking/backend:backend.0.0
```

Voi production hoac multi-node Swarm, pipeline nen chay:

```text
CI/CD
  -> build frontend/backend image
  -> tag immutable version
  -> push registry
  -> Swarm nodes pull image
  -> docker stack deploy
```

Tag strategy de xuat:

- Moi release co tag immutable: `frontend.0.0`, `backend.0.0`, sau do tang `frontend.0.1`, `backend.0.1`.
- Co the them tag theo Git SHA: `frontend-<short_sha>`, `backend-<short_sha>` de trace chinh xac.
- Khong deploy production bang tag mutable nhu `latest`.
