# Development Guide

## Quick Start

```bash
# Clone the repo
git clone https://github.com/defnotwig/AI-Powered-Treatment-Plan-Assistant.git
cd AI-Powered-Treatment-Plan-Assistant

# Install dependencies
cd Backend && npm ci && cd ..
cd Frontend && npm ci && cd ..

# Start development
make dev
```

## Architecture Overview

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React 18   │────▶│  Express + TS    │────▶│  SQLite / PG    │
│  Frontend   │◀────│  API v1          │◀────│  Database       │
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │
                    ┌──────┴──────┐
                    │  GPT-4o +   │
                    │  TF.js ML   │
                    └─────────────┘
```

## API Endpoints

All endpoints are versioned under `/api/v1`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/patients` | List patients |
| POST | `/api/v1/treatment-plans/analyze` | Generate treatment plan |
| GET | `/api/v1/audit-logs` | View audit trail |
| GET | `/api/v1/drug-database/interactions` | Check drug interactions |
| GET | `/api/v1/ml/training-data` | Get ML training data |
| GET | `/api/v1/realtime/stream` | SSE event stream |

## Testing

```bash
make test          # Run all tests
npm test -- --run  # Frontend only
cd Backend && npm test  # Backend only
```

## Docker

```bash
make docker-up     # Start full stack
make docker-down   # Stop
```
