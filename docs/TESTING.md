# Testing Guide

## Overview

| Suite | Framework | Tests | Coverage Target |
|-------|-----------|-------|-----------------|
| Frontend Unit | Vitest + React Testing Library | 224 | 80%+ |
| Backend Unit | Jest + ts-jest | 3 | 100% safety paths |
| E2E | Playwright | Planned | Critical flows |

## Running Tests

```bash
# All frontend tests
cd Frontend && npm test

# Watch mode (re-runs on file change)
cd Frontend && npm run test:watch

# Backend tests
cd Backend && npm test

# Full suite from root
make test
```

## Test Structure

### Frontend Tests (`Frontend/src/**/*.test.tsx`)

Tests cover React components, hooks, services, and utilities:

- **Component tests** — Render, user interaction, state changes
- **Hook tests** — Custom hook logic with `renderHook`
- **Service tests** — API call mocking, response handling
- **Utility tests** — Dosage calculators, validators, formatters

### Backend Tests (`Backend/src/**/*.test.ts`)

Tests cover API routes, services, and safety-critical logic:

- **Route tests** — HTTP method, status codes, response shapes
- **Service tests** — Business logic, AI response parsing
- **Validation tests** — Input validation, schema enforcement
- **Safety tests** — Drug interactions, contraindications, dosage limits

## Writing Tests

### Frontend Example

```tsx
import { render, screen } from '@testing-library/react';
import { RiskScoreCard } from '../components/dashboard/RiskScoreCard';

describe('RiskScoreCard', () => {
  it('displays HIGH risk in red', () => {
    render(<RiskScoreCard score={75} level="HIGH" />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });
});
```

### Backend Example

```typescript
import request from 'supertest';
import { app } from '../server';

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
```

## Safety-Critical Test Requirements

All safety paths require **100% test coverage**:

1. Drug interaction detection (all severity levels)
2. Contraindication flagging (absolute and relative)
3. Dosage limit validation (max safe dose checks)
4. Allergy cross-reactivity detection
5. Geriatric/pediatric dose adjustments
6. Renal/hepatic impairment calculations

## CI Integration

Tests run automatically on every push and PR via GitHub Actions (`.github/workflows/ci.yml`):

- Frontend tests run in Node.js 22
- Backend tests run in Node.js 22
- Docker build verification
- All tests must pass before merge
