# Docker Swarm Deployment

Huong dan nay dung cho lab local single-node Docker Swarm. Stack chi deploy `frontend` va `backend`; database da chay rieng ben ngoai stack.

## Chay Nhanh Tren May Moi

Chay cac lenh sau trong thu muc `user/`.

### 1. Build local images

```powershell
docker build -t event-booking/backend:backend.0.0 ./backend
docker build -t event-booking/frontend:frontend.0.0 ./frontend
```

### 2. Khoi tao Docker Swarm

```powershell
docker swarm init
```

Neu may da init Swarm truoc do, Docker se bao node already part of a swarm. Khi do bo qua buoc nay va chay:

```powershell
docker node ls
```

### 3. Nap bien moi truong tu `.env`

```powershell
Get-Content .env |
  Where-Object { $_ -and $_ -notmatch '^\s*#' } |
  ForEach-Object {
    $name, $value = $_ -split '=', 2
    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
  }
```

### 4. Deploy stack

```powershell
docker stack deploy -c docker-stack.yml event_booking
```

## Kiem Tra Trang Thai

Xem cac service trong stack:

```powershell
docker stack services event_booking
```

Xem tung task/container cua stack:

```powershell
docker stack ps event_booking
```

Kiem tra service backend:

```powershell
docker service ps event_booking_backend
docker service logs -f event_booking_backend
```

Kiem tra service frontend:

```powershell
docker service ps event_booking_frontend
docker service logs -f event_booking_frontend
```

Kiem tra health endpoint:

```powershell
curl http://localhost:8000/health
```

Kiem tra API events:

```powershell
curl "http://localhost:8000/api/v1/events?limit=6"
```

Mo UI:

```text
http://localhost:5173
```

## Scale Thu Cong

Mac dinh trong `docker-stack.yml`:

- `frontend`: 3 replicas.
- `backend`: 3 replicas.

Tang replicas:

```powershell
docker service scale event_booking_frontend=5
docker service scale event_booking_backend=5
```

Giam ve mac dinh:

```powershell
docker service scale event_booking_frontend=3
docker service scale event_booking_backend=3
```

## Rolling Update Local

Build image moi:

```powershell
docker build -t event-booking/backend:backend.0.1 ./backend
```

Update backend:

```powershell
docker service update --image event-booking/backend:backend.0.1 event_booking_backend
```

Build va update frontend:

```powershell
docker build -t event-booking/frontend:frontend.0.1 --build-arg VITE_API_URL=http://localhost:8000/api/v1 ./frontend
docker service update --image event-booking/frontend:frontend.0.1 event_booking_frontend
```

Theo doi rollout:

```powershell
docker service ps event_booking_backend
docker service inspect event_booking_backend --pretty
```

## Rollback

```powershell
docker service rollback event_booking_backend
docker service rollback event_booking_frontend
```

## Dung Stack

```powershell
docker stack rm event_booking
```

Lenh nay chi xoa frontend/backend services trong Swarm, khong xoa database vi database khong nam trong stack.

## Ghi Chu Local Lab

- Khong can push image len registry.
- Khong can join worker/manager node khac.
- `.env` hien dung local values nhu `localhost:5173`, `localhost:8000` va `host.docker.internal:5000`.
- Khong dung `docker compose config | docker stack deploy -c -` vi Compose co the render `published` port thanh string va gay loi `published must be a integer`.
- Moi lan doi `VITE_API_URL`, can build lai frontend image vi bien nay duoc Vite embed luc build.
