# Troubleshooting Guide

## Common Issues

### Backend Won't Start

**Error:** `EADDRINUSE: port 5000 already in use`
```bash
# Find and kill the process using port 5000
lsof -i :5000 | grep LISTEN  # macOS/Linux
netstat -ano | findstr :5000  # Windows
kill -9 <PID>
```

**Error:** `Cannot find module 'typescript'`
```bash
cd Backend && npm install
```

**Error:** `OPENAI_API_KEY not set`
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
```

### Frontend Won't Start

**Error:** `ENOENT: vite.config.ts not found`
```bash
cd Frontend && npm install
```

**Error:** `Cannot connect to backend API`
- Ensure backend is running on port 5000
- Check CORS settings in `Backend/.env`
- Verify `VITE_API_URL` in frontend config

### Database Issues

**Error:** `SequelizeConnectionRefusedError`
- If using PostgreSQL: verify credentials in `.env`
- If no database available: set `DEMO_MODE=true` to use SQLite

**Error:** `relation "patients" does not exist`
```bash
# Re-run migrations/sync
cd Backend && npm run dev  # Auto-syncs in development mode
```

### OpenAI API Issues

**Error:** `401 Unauthorized`
- Verify your `OPENAI_API_KEY` is valid
- Check you have GPT-4o access on your OpenAI account

**Error:** `429 Rate Limited`
- You've exceeded OpenAI's rate limits
- Wait and retry, or upgrade your OpenAI plan

**Error:** `Timeout: AI analysis took too long`
- OpenAI may be experiencing high load
- The 30-second timeout is configurable in `openai.service.ts`

### Docker Issues

**Error:** `docker compose: command not found`
```bash
# Install Docker Compose V2
docker compose version  # Should show v2.x
```

**Container unhealthy**
```bash
docker compose logs backend  # Check backend logs
docker compose restart backend
```

### Test Failures

**Frontend tests fail with import errors**
```bash
cd Frontend && npm install
npx vitest --clearCache
```

**Backend tests fail with database errors**
```bash
# Ensure DEMO_MODE=true is set for tests
DEMO_MODE=true npm test
```

---

## Performance Issues

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Slow AI analysis (>10s) | OpenAI latency | Check OpenAI status page |
| Dashboard takes >500ms | Large dataset | Enable response caching |
| Form feels sluggish | Re-render cycles | Check React DevTools profiler |
| High memory usage | ML model in memory | Restart backend process |

## Getting Help

1. Check [existing issues](https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant/issues)
2. Review the [API documentation](API_REFERENCE.md)
3. Open a new issue with reproduction steps
