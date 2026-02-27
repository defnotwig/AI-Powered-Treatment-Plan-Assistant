# API Reference

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:5000/api/v1` |
| Production | `https://your-domain.com/api/v1` |
| Swagger Docs | `http://localhost:5000/api/docs` |

> **Note:** Legacy unversioned routes (`/api/*`) are deprecated and will be removed in v2. They return `Deprecation: true` and `Sunset` headers per RFC 8594.

---

## Endpoints

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/patients` | List all patients (paginated) |
| `GET` | `/patients/:id` | Get patient by ID |
| `POST` | `/patients` | Create a new patient |
| `PUT` | `/patients/:id` | Update patient |
| `GET` | `/patients/search?q=` | Search patients by name/condition |
| `GET` | `/patients/stats` | Patient statistics |

### Treatment Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/treatments/generate` | Generate AI treatment plan |
| `GET` | `/treatments/:id` | Get treatment plan by ID |
| `GET` | `/treatments/patient/:id` | Get plans for a patient |
| `PUT` | `/treatments/:id/approve` | Approve a treatment plan |
| `PUT` | `/treatments/:id/reject` | Reject a treatment plan |

### Drug Database

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/drugs/interactions` | List all drug interactions |
| `POST` | `/drugs/check-interactions` | Check interactions for drug list |
| `GET` | `/drugs/contraindications` | List contraindications |
| `GET` | `/drugs/dosage-guidelines` | Dosage guideline lookup |

### ML Risk Prediction

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ml/predict` | Predict risk score for patient |
| `GET` | `/ml/model/status` | Model training status |
| `POST` | `/ml/train` | Trigger model retraining |
| `POST` | `/ml/adaptive/ingest` | Ingest training sample |
| `GET` | `/ml/adaptive/stats` | Adaptive learning statistics |

### Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/audit` | List audit log entries |
| `GET` | `/audit/:id` | Get audit entry by ID |
| `GET` | `/audit/patient/:id` | Audit trail for patient |

### Real-time & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/realtime/events` | SSE stream for live updates |
| `GET` | `/realtime/analytics` | Dashboard analytics data |

### Infrastructure

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check (not versioned) |
| `GET` | `/api/docs` | Swagger UI documentation |

---

## Request/Response Examples

### Generate Treatment Plan

```bash
POST /api/v1/treatments/generate
Content-Type: application/json

{
  "demographics": {
    "age": 68, "sex": "male", "weight": 85,
    "height": 175, "bloodPressure": { "systolic": 150, "diastolic": 95 }
  },
  "medicalHistory": {
    "conditions": ["Type 2 Diabetes", "Hypertension"],
    "allergies": ["Penicillin"]
  },
  "currentMedications": [
    { "name": "Metformin", "dosage": "500mg", "frequency": "twice daily" }
  ],
  "lifestyle": {
    "smoking": { "status": "former" },
    "chiefComplaint": "Persistent chest pain on exertion"
  }
}
```

### Check Drug Interactions

```bash
POST /api/v1/drugs/check-interactions
Content-Type: application/json

{
  "medications": ["Warfarin", "Aspirin", "Ibuprofen"]
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Resource not found |
| 429 | Rate limit exceeded (100 req/15min) |
| 500 | Internal server error |

## Rate Limiting

All endpoints are rate-limited to **100 requests per 15-minute window** per IP. When exceeded, the API returns `429 Too Many Requests` with a `Retry-After` header.

## Headers

Every response includes:
- `X-Correlation-Id` — Unique request identifier for tracing
- `X-API-Version` — Current API version (`v1`)
- `X-Content-Type-Options: nosniff` — Security header
- `X-Frame-Options: DENY` — Clickjacking protection
