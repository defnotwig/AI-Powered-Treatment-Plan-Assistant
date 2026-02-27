# Architecture Overview

## System Design

The AI-Powered Treatment Plan Assistant follows a **layered architecture** with clear separation of concerns between the frontend presentation layer, backend API layer, and data persistence layer.

```
┌─────────────────────────────────────────────────┐
│              Client (Browser)                    │
│  React 18 + TypeScript + Tailwind CSS + Vite    │
└────────────────────┬────────────────────────────┘
                     │ REST API (JSON)
                     ▼
┌─────────────────────────────────────────────────┐
│           API Gateway (Express.js)               │
│  Rate Limiting │ CORS │ Helmet │ Compression     │
│  Correlation ID │ Request Logging                │
├─────────────────────────────────────────────────┤
│           API Version Router (/api/v1)           │
│  Patient │ Treatment │ ML │ Drug DB │ Audit      │
├─────────────────────────────────────────────────┤
│              Service Layer                       │
│  OpenAI │ Validation │ Cross-Validation          │
│  Adaptive Learning │ Response Cache              │
├─────────────────────────────────────────────────┤
│           Data Access (Sequelize ORM)            │
│  Patient │ TreatmentPlan │ DrugInteraction       │
│  AuditLog │ Contraindication │ DosageGuideline   │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│        PostgreSQL / SQLite (Demo Mode)           │
└─────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Demo Mode with SQLite
The system supports a **demo mode** using SQLite for zero-configuration local development. When `DEMO_MODE=true` or no database credentials are provided, the system falls back to an in-memory SQLite database with auto-seeded data.

### 2. AI-First Safety Checks
Every treatment plan passes through multiple safety layers:
1. **Drug interaction database** — 50+ known interaction rules
2. **Contraindication engine** — Condition-drug mappings
3. **OpenAI GPT-4o analysis** — Clinical context understanding
4. **ML risk scoring** — TensorFlow.js ensemble model
5. **Cross-validation** — Multi-source agreement checks

### 3. API Versioning (RFC 8594)
All API routes are versioned under `/api/v1/`. Legacy unversioned routes at `/api/` remain functional but return deprecation headers per RFC 8594.

### 4. Enterprise Middleware Stack
Request processing pipeline:
- `helmet` — Security headers
- `correlationId` — UUID per request for distributed tracing
- `compression` — gzip/brotli response compression
- `cors` — Cross-Origin Resource Sharing
- `rateLimit` — DDoS protection (100 req/15min)
- `express.json` — Body parsing with 10MB limit
- `requestLogger` — Structured Winston logging

## Data Flow

### Patient Intake → Treatment Plan
```
User Input → Form Validation → API Request → Server Validation
  → OpenAI Analysis → Drug Interaction Check → Contraindication Check
  → Dosage Validation → ML Risk Scoring → Cross-Validation
  → Response Assembly → Audit Logging → Client Response
```

### ML Training Pipeline
```
Patient Data → Feature Extraction (11 features) → Normalization
  → TensorFlow.js Model → Risk Score (0-100) → Category Assignment
  → Adaptive Learning Store → Retraining Trigger
```

## Security Model

| Layer | Protection |
|-------|-----------|
| Transport | HTTPS (Caddy TLS termination) |
| Headers | Helmet (CSP, HSTS, X-Frame-Options) |
| Authentication | JWT tokens (configurable) |
| Rate Limiting | 100 requests per 15-minute window |
| Input Validation | AJV JSON schema validation |
| Audit | Full HIPAA-style logging with timestamps |
| Docker | Distroless runtime (0 CVE base image) |
