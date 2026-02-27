# Changelog

All notable changes to the AI-Powered Treatment Plan Assistant will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-02-27

### Added

- Multi-step patient intake wizard (demographics, medical history, medications, lifestyle, review)
- GPT-4o powered treatment plan analysis with structured JSON output
- Drug interaction detection engine with severity classification (major/moderate/minor)
- Contraindication flagging system (absolute, relative, pregnancy category X)
- Dosage calculation engine with renal, hepatic, geriatric, and pediatric adjustments
- Allergy cross-reactivity detection engine
- ML-based risk prediction using TensorFlow.js ensemble model
- NLP medical text analyzer for symptom extraction
- Real-time SSE streaming for live updates
- Comprehensive audit logging for compliance tracking
- Treatment plan dashboard with risk scores, flagged issues, and alternatives
- Analytics dashboard with Recharts visualizations
- Patient search with advanced filtering
- API v1 versioning with backward-compatible deprecation aliases
- Winston structured logging with correlation ID tracing
- Request-level correlation IDs (UUID v4)
- Startup configuration validation (7 checker functions)
- OpenAPI 3.0.3 / Swagger UI documentation
- Response compression (gzip, level 6, 1KB threshold)
- Frontend code-splitting via Vite manual chunks
- Docker support with Bun Alpine builders and Distroless/Caddy runtimes
- Docker Compose for full-stack deployment
- 227 automated tests (224 frontend + 3 backend)
- In-memory caching middleware with TTL support
- Rate limiting (100 requests/15 min per IP)
- Helmet security headers
- CORS configuration

### Security

- 0 Docker image CVEs (Distroless Node 22 + Caddy Alpine)
- Helmet.js security headers
- Rate limiting to prevent abuse
- Input validation on all API endpoints
- Audit trail for all clinical decisions
