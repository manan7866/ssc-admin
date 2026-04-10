# SSC Admin Dashboard - Deployment Guide

## Prerequisites

- Docker installed and running
- Docker Hub account with push access
- SSH access to your VPS
- Main SSC app deployed and running on port 3010

## Quick Deploy

### 1. Build Docker Image

```bash
cd ssc-admin-dasboard
docker build -t ssc-admin:latest .
```

### 2. Push to Docker Hub

```bash
docker login -u <your-dockerhub-username>
docker tag ssc-admin:latest <your-dockerhub-username>/ssc-admin:latest
docker push <your-dockerhub-username>/ssc-admin:latest
```

### 3. Deploy to VPS

SSH into your VPS:

```bash
ssh your-user@your-vps-ip
cd /opt/ssc-project
```

Pull and start the admin service:

```bash
docker compose pull ssc-admin
docker compose up -d ssc-admin
```

### 4. Verify

Check service status:

```bash
docker compose ps ssc-admin
```

View logs:

```bash
docker logs -f ssc-admin
```

Test the endpoint:

```bash
curl -f http://localhost:3050/admin/login
```

## Environment Variables

Add to your `.env` on the VPS:

```bash
# Admin panel
ADMIN_PORT=3050
NEXT_PUBLIC_ADMIN_URL=https://admin.yourdomain.com
```

The admin panel shares these with the main app:
- `JWT_SECRET` - Must be identical for both services
- `DOCKERHUB_USERNAME` - Your Docker Hub username

## Architecture

```
Browser → Admin Panel (:3050) → Proxy API → Main App (:3010) → Database
```

The admin panel proxies all API requests to the main app at `http://ssc-app:3010`.

## Troubleshooting

### Port conflict
Ensure port 3050 is not in use on your VPS.

### Can't connect to main app
Verify both containers are on the same network:
```bash
docker network inspect ssc-network
```

### Login fails
- Ensure `JWT_SECRET` matches between both services
- Check browser cookies for `admin_token`
- Verify main app is accessible from admin container:
  ```bash
  docker exec ssc-admin curl -f http://ssc-app:3010/api/admin/dashboard
  ```

## CI/CD Pipeline

The admin panel has its own GitHub Actions workflow at `.github/workflows/docker-deploy-admin.yml`.

To trigger deployment:
- Push to `main` branch (only changes in `ssc-admin-dasboard/**` trigger it)
- Or manually trigger from GitHub Actions UI

Required GitHub Secrets:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `VPS_HOST`
- `VPS_USERNAME`
- `VPS_SSH_KEY`

## Reverse Proxy Setup (Recommended)

For production, configure nginx or Caddy:

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://localhost:3050;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Support

Check logs:
```bash
docker logs ssc-admin
docker logs ssc-app
```

Verify health:
```bash
docker compose ps
```
