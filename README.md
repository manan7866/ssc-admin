# SSC Admin Dashboard

Separate admin dashboard for Sufi Science Center, running on port **3050**.

## Architecture

- **Main App**: `http://localhost:3010` (port 3010)
- **Admin Dashboard**: `http://localhost:3050` (port 3050)

The admin dashboard proxies all API requests to the main app, maintaining separation while sharing the same backend.

## Quick Start

### Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3050/admin`

### Production (Docker)

```bash
docker build -t ssc-admin .
docker run -p 3050:3050 \
  -e MAIN_APP_URL=http://ssc-app:3010 \
  -e JWT_SECRET=your-secret \
  ssc-admin
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MAIN_APP_URL` | URL of the main SSC app | `http://localhost:3010` |
| `JWT_SECRET` | JWT secret (must match main app) | - |
| `NEXT_PUBLIC_ADMIN_URL` | Public URL of admin dashboard | `http://localhost:3050` |

## API Proxy Pattern

All admin API routes (`/api/admin/*`) proxy requests to the main app:

```
Browser → /api/admin/dashboard → Main App at localhost:3010/api/admin/dashboard
```

This keeps the admin dashboard stateless and independent.

## Deployment

The admin dashboard has its own CI/CD pipeline:

1. Push to `main` branch
2. GitHub Actions builds and tests
3. Docker image pushed to Docker Hub
4. Deployed to VPS via SSH

See `.github/workflows/docker-deploy-admin.yml`

## Structure

```
ssc-admin-dasboard/
├── app/
│   ├── admin/           # Admin pages (/admin/*)
│   │   ├── page.tsx     # Dashboard
│   │   ├── membership/  # Membership applications
│   │   ├── volunteer/   # Volunteer applications
│   │   └── ...
│   ├── api/
│   │   └── admin/       # Proxy API routes
│   ├── layout.tsx       # Admin layout with sidebar
│   └── globals.css      # Shared styles
├── lib/
│   ├── api-proxy.ts     # API proxy helper
│   ├── auth.ts          # Auth utilities
│   └── utils.ts         # General utilities
└── Dockerfile
```
