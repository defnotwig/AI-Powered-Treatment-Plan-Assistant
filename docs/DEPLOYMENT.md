# Deployment Guide

## Quick Start (Docker Compose)

```bash
# Clone and start
git clone https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant.git
cd AI-Powered-Treatment-Plan-Assistant/APTP

# Configure environment
cp Backend/.env.example Backend/.env
# Edit Backend/.env with your OpenAI API key

# Launch
docker compose up -d
```

**Services:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- Swagger Docs: http://localhost:5000/api/docs

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | — | OpenAI API key for GPT-4o |
| `PORT` | No | `5000` | Backend server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `DEMO_MODE` | No | `true` | Use SQLite instead of PostgreSQL |
| `DB_HOST` | No | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_NAME` | No | `treatment_plan_db` | Database name |
| `DB_USER` | No | `postgres` | Database user |
| `DB_PASSWORD` | No | — | Database password |
| `JWT_SECRET` | No | `default-secret` | JWT signing secret |
| `CORS_ORIGIN` | No | `http://localhost:3000` | Allowed CORS origin |
| `LOG_LEVEL` | No | `info` | Winston log level |

---

## Deployment Options

### Option 1: Docker Compose (Recommended)

The included `docker-compose.yml` sets up both frontend and backend with proper networking:

```bash
docker compose up -d --build
docker compose logs -f   # Watch logs
docker compose down      # Stop all services
```

### Option 2: Manual Deployment

**Backend:**
```bash
cd Backend
npm install
npm run build
NODE_ENV=production npm start
```

**Frontend:**
```bash
cd Frontend
npm install
npm run build
# Serve dist/ with any static file server (Nginx, Caddy, etc.)
```

### Option 3: Cloud Platforms

**AWS / GCP / Azure:**
- Use the Dockerfiles for container deployment
- Backend: Deploy to ECS, Cloud Run, or Azure Container Instances
- Frontend: Deploy built assets to S3 + CloudFront, Cloud Storage, or Azure Blob Storage
- Database: Use managed PostgreSQL (RDS, Cloud SQL, Azure Database)

---

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set a strong `JWT_SECRET`
- [ ] Configure `CORS_ORIGIN` to your frontend domain
- [ ] Use managed PostgreSQL (not SQLite demo mode)
- [ ] Enable HTTPS (Caddy handles this automatically)
- [ ] Set `OPENAI_API_KEY` as a secret (not in version control)
- [ ] Review rate limiting settings for your traffic
- [ ] Configure log rotation for production log files
- [ ] Set up health check monitoring on `/api/health`
- [ ] Back up database regularly

---

## Health Monitoring

The backend exposes a health endpoint:

```bash
curl http://localhost:5000/api/health
# Returns: { "status": "ok", "timestamp": "...", "uptime": 123.45 }
```

Docker containers include a built-in healthcheck that polls this endpoint every 30 seconds.
