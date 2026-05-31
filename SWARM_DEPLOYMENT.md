# Docker Swarm Deployment

Huong dan nay dung cho stack trong `docker-stack.yml`. Stack chi deploy frontend va backend. Database phai la endpoint ben ngoai, da san sang HA/scale rieng.

## 1. Build Images For Local Lab

File `.env` da cau hinh cho lab local:

```env
REGISTRY=event-booking
FRONTEND_TAG=frontend.0.0
BACKEND_TAG=backend.0.0
VITE_API_URL=http://localhost:8000/api/v1
```

Build image local tu thu muc `user/`:

```powershell
docker build -t event-booking/backend:backend.0.0 ./backend
docker build -t event-booking/frontend:frontend.0.0 --build-arg VITE_API_URL=http://localhost:8000/api/v1 ./frontend
```

Voi lab single-node Swarm tren may local, co the dung local images nhu tren va khong can push registry.

Neu chay multi-node Swarm that, cac node khac khong thay local image tren may ban. Khi do can push image len registry:

```powershell
docker tag event-booking/backend:backend.0.0 registry.example.com/event-booking/backend:backend.0.0
docker tag event-booking/frontend:frontend.0.0 registry.example.com/event-booking/frontend:frontend.0.0
docker push registry.example.com/event-booking/backend:backend.0.0
docker push registry.example.com/event-booking/frontend:frontend.0.0
```

Khong dung `build:` trong Swarm stack.

## 2. Create Swarm Cluster

Cho lab local single-node:

```powershell
docker swarm init
```

Neu Docker bao node da o trong Swarm, bo qua buoc init va kiem tra:

```powershell
docker node ls
```

Cho cluster nhieu node, tren manager node dau tien:

```powershell
docker swarm init --advertise-addr <MANAGER_PRIVATE_IP>
```

Lay lenh join worker:

```powershell
docker swarm join-token worker
```

Chay lenh join tren cac worker node:

```powershell
docker swarm join --token <TOKEN> <MANAGER_PRIVATE_IP>:2377
```

Kiem tra node:

```powershell
docker node ls
```

Khuyen nghi toi thieu 3 node. Neu can HA cho manager quorum, dung 3 manager node va mo cac port Swarm can thiet giua nodes:

- TCP 2377: cluster management.
- TCP/UDP 7946: node discovery.
- UDP 4789: overlay network VXLAN.

## 3. Prepare Deployment Environment

Trong lab local, cac bien da nam trong `.env`. Kiem tra file:

```powershell
Get-Content .env
```

Neu muon set thu cong trong PowerShell thay vi dung `.env`:

```powershell
$env:REGISTRY="event-booking"
$env:FRONTEND_TAG="frontend.0.0"
$env:BACKEND_TAG="backend.0.0"
$env:DATABASE_URL="postgresql+pg8000://postgres:postgres@host.docker.internal:5000/event_booking"
$env:FRONTEND_URL="http://localhost:5173"
$env:BACKEND_URL="http://localhost:8000"
$env:SECRET_KEY="change-me-for-local-docker"
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="admin123"
```

Neu chay registry private trong production, dang nhap registry tren manager node:

```powershell
docker login registry.example.com
```

Luu y: `VITE_API_URL` khong phai runtime env cua frontend Nginx. No phai duoc truyen khi build frontend image bang `--build-arg VITE_API_URL=...`.

## 4. Deploy Stack

Tu thu muc `user/`:

```powershell
Get-Content .env |
  Where-Object { $_ -and $_ -notmatch '^\s*#' } |
  ForEach-Object {
    $name, $value = $_ -split '=', 2
    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
  }

docker stack deploy -c docker-stack.yml event_booking
```

Lenh tren nap bien tu `.env` vao PowerShell process, sau do de `docker stack deploy` doc truc tiep `docker-stack.yml`. Khong dung pipe tu `docker compose config` vi output cua Compose co the bien `published` port thanh string, lam Swarm bao loi `services.frontend.ports.0.published must be a integer`.

Kiem tra service:

```powershell
docker stack services event_booking
docker stack ps event_booking
```

Kiem tra health va logs:

```powershell
docker service ps event_booking_backend
docker service ps event_booking_frontend
docker service logs -f event_booking_backend
docker service logs -f event_booking_frontend
```

Truy cap:

```text
Frontend: http://<any-swarm-node>:5173
Backend:  http://<any-swarm-node>:8000
Health:   http://<any-swarm-node>:8000/health
```

Voi lab local:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8000
Health:   http://localhost:8000/health
```

Routing Mesh cho phep request vao bat ky Swarm node nao tren published port va duoc route toi task dang healthy.

## 5. Scale Services

Mac dinh stack da cau hinh:

- `frontend`: 3 replicas.
- `backend`: 3 replicas.

Scale thu cong:

```powershell
docker service scale event_booking_frontend=5
docker service scale event_booking_backend=5
```

Giam ve mac dinh:

```powershell
docker service scale event_booking_frontend=3
docker service scale event_booking_backend=3
```

## 6. Rolling Update

Build image moi cho local lab:

```powershell
docker build -t event-booking/backend:backend.0.1 ./backend
```

Update backend:

```powershell
docker service update --image event-booking/backend:backend.0.1 event_booking_backend
```

Update frontend:

```powershell
docker build -t event-booking/frontend:frontend.0.1 --build-arg VITE_API_URL=http://localhost:8000/api/v1 ./frontend
docker service update --image event-booking/frontend:frontend.0.1 event_booking_frontend
```

Stack da cau hinh rolling update:

- Update tung replica.
- Start container moi truoc khi stop container cu.
- Tu rollback neu update bi loi trong vong monitor.

Theo doi rollout:

```powershell
docker service ps event_booking_backend
docker service inspect event_booking_backend --pretty
```

## 7. Manual Rollback

Neu can rollback thu cong:

```powershell
docker service rollback event_booking_backend
docker service rollback event_booking_frontend
```

Theo doi:

```powershell
docker service ps event_booking_backend
docker service ps event_booking_frontend
```

## 8. Remove Stack

Dung stack:

```powershell
docker stack rm event_booking
```

Lenh nay khong xoa database vi database khong nam trong stack.

## 9. Production Notes

- Doi tat ca default secret truoc production.
- Database endpoint trong `DATABASE_URL` phai truy cap duoc tu moi Swarm node chay backend task.
- Mo firewall cho published ports `5173` va `8000` neu can public access.
- Theo doi so connection database khi tang backend replicas.
- Backend hien start APScheduler trong moi replica. De tranh job chay lap, nen tach scheduler thanh worker rieng 1 replica hoac them distributed lock truoc khi production scale backend.
- Khong luu upload/static generated files trong filesystem container. Neu them upload, dung S3, MinIO hoac object storage.
