# AI-Powered Treatment Plan Assistant - Comprehensive Enhancement Plan

**Date:** February 27, 2026
**Status:** Active plan (updated from live codebase and DB audit)
**Audit Inputs:** Source scan (frontend, backend, models, services), Playwright MCP UI walkthrough, unit test execution

## 1. Objective
Build a safer and more capable clinical decision system by strengthening AI/ML reasoning, expanding web-derived clinical context, improving component/navigation consistency, and enforcing test-backed delivery.

## 2. Current Baseline (Verified)
- Frontend stack: React + TypeScript + Vite + TensorFlow.js models.
- Backend stack: Express + TypeScript + Sequelize.
- Database: Postgres-backed models with demo/in-memory workflows for local operation.
- Existing web data ingestion: OpenFDA, RxNorm, DailyMed through `medical-data-scraper.service.ts`.
- Navigation issue (missing back behavior in some views): addressed in this cycle (see Section 4).

## 3. Scope and Constraints
- Keep clinical safety and traceability as highest priority.
- Add only incremental, compatible changes unless a breaking API change is explicitly approved.
- Every phase ships with tests and rollback-safe behavior.

## 4. Completed in This Enhancement Cycle

### 4.1 Navigation and Component Consistency
- Added reusable back-navigation component with fallback support:
  - `Frontend/src/components/ui/BackNavigation.tsx`
- Exported through UI barrel:
  - `Frontend/src/components/ui/index.ts`
- Integrated into major views where users can get stranded without browser history:
  - `Frontend/src/App.tsx` (Analytics and Patients headers)
  - `Frontend/src/components/wizard/PatientIntakeWizard.tsx`
  - `Frontend/src/components/dashboard/TreatmentDashboard.tsx`

### 4.2 ML Lifecycle Hardening
- Prevented duplicate/concurrent model-training race paths by waiting on active training:
  - `Frontend/src/services/ml-risk-predictor.ts`
  - `Frontend/src/services/drug-interaction-predictor.ts`

### 4.3 AI Context Enrichment with Live Web Evidence
- Added real-time context service for evidence aggregation from scraper sources:
  - `Backend/src/services/ai-context.service.ts`
- Integrated live evidence into OpenAI prompt generation and output evidence-source handling:
  - `Backend/src/services/openai.service.ts`
- Extended shared types/response plumbing for evidence tracking:
  - `Backend/src/types/treatment-plan.ts`
  - `Backend/src/controllers/treatment.controller.ts`

### 4.4 New Unit Tests Added
- Frontend component tests:
  - `Frontend/src/components/ui/__tests__/BackNavigation.test.tsx`
- Backend unit tests:
  - `Backend/src/services/__tests__/ai-context.service.test.ts`
  - `Backend/jest.config.js`

### 4.5 Performance, Realtime, and Adaptive ML (Current Cycle)
- Added API response caching infrastructure with route-level TTL/tag support:
  - `Backend/src/services/response-cache.service.ts`
  - `Backend/src/middleware/cache.middleware.ts`
  - Applied on high-read routes for patients, drug DB, and treatment-plan fetches.
- Added write-path cache invalidation for patient/treatment/drug-knowledge mutations:
  - `Backend/src/controllers/patient.controller.ts`
  - `Backend/src/controllers/treatment.controller.ts`
  - `Backend/src/controllers/drug-database.controller.ts`
- Added realtime telemetry endpoints and SSE stream:
  - `Backend/src/controllers/realtime.controller.ts`
  - `Backend/src/routes/realtime.routes.ts`
- Added adaptive learning ingestion/training-data APIs:
  - `Backend/src/services/adaptive-learning.service.ts`
  - `Backend/src/controllers/ml.controller.ts`
  - `Backend/src/routes/ml.routes.ts`
- Wired adaptive sample ingestion into treatment analysis flows (demo and production).
- Updated analytics dashboard to consume realtime SSE with polling fallback:
  - `Frontend/src/components/dashboard/AnalyticsDashboard.tsx`
- Updated ML risk model training to merge adaptive samples from backend:
  - `Frontend/src/services/ml-risk-predictor.ts`
- Added multi-phase brutal stress harness and report output:
  - `Backend/src/scripts/brutal-stress-test.ts`
  - `Backend/package.json` script: `stress:brutal`

## 5. Phased Implementation Roadmap

## Phase 1 - Safety and Build Integrity (Week 1-2)
**Goal:** Stabilize production readiness before further feature growth.

### Deliverables
- Resolve current TypeScript build blockers (frontend and backend compile issues).
- Add backend tests for treatment-generation controllers and validation/cross-validation services.
- Add response schema validation layer for AI output with strict fallback behavior.
- Add server-side logging around live evidence retrieval failures and degraded mode usage.

### Acceptance Criteria
- `npm run build` succeeds in frontend and backend.
- Controller/service test coverage is present for safety-critical paths.
- AI responses failing schema validation never reach UI unfiltered.

## Phase 2 - AI/ML Context Depth and Retrieval Quality (Week 2-4)
**Goal:** Increase contextual intelligence and reduce hallucination risk.

### Deliverables
- Evidence ranking strategy (recency + source reliability + relevance scoring).
- Multi-drug context retrieval (beyond top-N heuristic) with configurable policy.
- Add structured evidence snippets to rationale sections for each recommendation.
- Add model monitoring hooks (training duration, confidence drift, fallback frequency).

### Acceptance Criteria
- Risk and recommendation outputs include source-attributed evidence context.
- Confidence calibration is measured and logged over benchmark cases.
- AI fallback rate and live-source usage are visible in analytics.

## Phase 3 - Data Scraping and Persistence Expansion (Week 4-6)
**Goal:** Move from on-demand scraping to managed clinical evidence ingestion.

### Deliverables
- Add ingestion scheduler jobs for OpenFDA/RxNorm/DailyMed refresh windows.
- Add DB tables for evidence snapshots, source metadata, and retrieval logs.
- Implement cache invalidation and provenance tracking (source + timestamp + lookup params).
- Add fail-open policy rules per source (graceful degradation when one source is down).

### Acceptance Criteria
- Evidence snapshot history is queryable for audit.
- Every AI-generated plan can show data provenance metadata.
- Source outages do not break treatment generation.

## Phase 4 - Clinical Guardrails and Explainability UX (Week 6-8)
**Goal:** Make safety reasoning explicit to clinicians.

### Deliverables
- Contradiction checker: blocks recommendations that conflict with known contraindications/interactions.
- Evidence panel in UI with grouped citations by risk factor and recommendation.
- Severity escalation rules when evidence confidence is low or conflicting.
- Structured "why this was suggested" and "why alternatives were rejected" sections.

### Acceptance Criteria
- Each high/critical issue has visible supporting evidence.
- Contradictory outputs are intercepted before clinician action.
- Clinicians can inspect source-backed rationale without leaving dashboard.

## Phase 5 - Component and Navigation System Cleanup (Week 8-9)
**Goal:** Enforce UI consistency and accessibility.

### Deliverables
- Standardize page headers/actions with shared layout primitives.
- Back-navigation policy checklist applied to all route-level views.
- Accessibility audit for keyboard navigation, focus management, and ARIA labels.
- Mobile layout pass on dashboard, analytics, and patient records.

### Acceptance Criteria
- No route-level page lacks deterministic return path.
- Accessibility checks pass for key flows.
- UX behavior is consistent across view transitions.

## Phase 6 - QA Automation and Release Controls (Week 9-10)
**Goal:** Make enhancements continuously verifiable.

### Deliverables
- Expand backend Jest suite to include controllers, services, and route integration tests.
- Add Playwright E2E for intake -> analyze -> dashboard -> approve/modify/reject flows.
- CI gates: test, lint, type-check, and build.
- Release checklist with smoke test matrix and rollback steps.

### Acceptance Criteria
- PRs cannot merge on failing safety-critical test suites.
- E2E smoke suite runs on every release candidate.
- Summary report is auto-generated from verified CI outputs.

## 6. Database Enhancement Workstream
Current schema includes core clinical entities (`Patient`, `TreatmentPlan`, `DrugInteraction`, `Contraindication`, `DosageGuideline`, `AuditLog`).

Planned additions:
- `evidence_snapshots`
  - fields: `id`, `drug_name`, `source`, `payload_json`, `fetched_at`, `expires_at`, `quality_score`
- `evidence_retrieval_logs`
  - fields: `id`, `patient_id`, `query_signature`, `sources_used`, `latency_ms`, `degraded_mode`
- `ml_model_runs`
  - fields: `id`, `model_name`, `version`, `trained_at`, `train_duration_ms`, `metrics_json`

## 7. Test Strategy by Layer
- Unit tests: model services, context aggregation, dosage/risk calculators, navigation component behavior.
- Integration tests: treatment controller + OpenAI service + live context service.
- E2E tests: clinical workflow navigation, report export, and guardrail behavior in UI.
- Non-functional tests: API latency, scraper timeout handling, cache behavior.

## 8. Risks and Mitigations
- Live source instability:
  - Mitigation: source-level fallbacks + cached snapshots + degraded mode telemetry.
- AI recommendation variance:
  - Mitigation: strict output schema validation and contradiction blocking.
- Build regressions during rapid enhancement:
  - Mitigation: phase gates and CI-required checks before merge.
- Clinical trust concerns:
  - Mitigation: source attribution and explicit evidence panels in dashboard.

## 9. Definition of Done for This Plan
- Each phase is complete only when code, tests, and documentation are updated together.
- No safety-critical behavior ships without automated test coverage.
- Summary report is generated only from executed test runs and live verification artifacts.

## 10. Immediate Next Actions (Execution Queue)
1. Fix current frontend/backend build-time TypeScript issues.
2. Add backend controller test coverage for treatment-plan actions.
3. Implement evidence snapshot persistence in database.
4. Build Playwright E2E for full clinician workflow and guardrail checks.
5. Surface evidence sources directly in dashboard rationale panel.

## 11. Latest Stress Verification Snapshot (February 27, 2026)
- Stress harness run artifact:
  - `Backend/stress-reports/brutal-stress-report-2026-02-27T01-37-28-421Z.json`
  - `Backend/stress-reports/brutal-stress-report-2026-02-27T01-37-28-421Z.md`
- Aggregate results:
  - total requests: 5,950
  - error rate: 13.95%
  - average throughput: 44.31 req/s
  - overall p95 latency: 8,538.6 ms
- Dominant failure mode:
  - request timeouts on external/live lookup and analysis-heavy routes (`status=0` in harness output), especially OpenFDA/RxNorm-driven and AI-analysis calls under high concurrency.
- Interpretation:
  - cache-heavy read paths are now high-hit-rate and stable.
  - tail latency and timeout failures are concentrated in externally dependent endpoints, indicating need for async queueing, tighter upstream time budgets, and resilient fallback profiles for high-concurrency mode.
