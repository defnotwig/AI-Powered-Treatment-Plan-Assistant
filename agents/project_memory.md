# Project Memory

> Persistent knowledge base tracking project state, decisions, and context across sessions

---

## Purpose
Maintain continuity across multiple context windows by tracking project state, decisions, technical debt, and ongoing work.

---

## Current Sprint

### Active Tasks
```markdown
- [ ] Task 1: [Description] - @assigned - Status: In Progress
- [ ] Task 2: [Description] - @assigned - Status: Blocked (reason)
- [x] Task 3: [Description] - @assigned - Status: Completed
```

### Sprint Goals
- Goal 1: [Description]
- Goal 2: [Description]
- Goal 3: [Description]

### Blockers
1. **Blocker:** [Description]
   - **Impact:** [What's blocked]
   - **Owner:** @person
   - **Status:** [Investigating/Waiting/etc]

---

## Architecture Decisions

### Decision Log
```markdown
## [Date] - [Decision Title]

**Context:** [Why this decision was needed]

**Decision:** [What was decided]

**Alternatives Considered:**
- Option 1: [Pros/Cons]
- Option 2: [Pros/Cons]

**Consequences:**
- Positive: [Benefits]
- Negative: [Drawbacks]
- Neutral: [Trade-offs]

**Status:** Accepted/Deprecated/Superseded
```

### Active ADRs
1. **ADR-001:** Use PostgreSQL over MongoDB
2. **ADR-002:** Implement JWT authentication
3. **ADR-003:** Adopt microservices architecture

---

## Technical Debt

### Current Debt
```markdown
1. **Priority:** High
   **Description:** User authentication needs refactoring
   **Location:** `src/services/auth.ts`
   **Estimated Effort:** 3 days
   **Impact:** Security risk, hard to maintain
   **Created:** 2024-01-15
   **Owner:** @backend-team

2. **Priority:** Medium
   **Description:** Legacy API endpoints need versioning
   **Location:** `src/routes/api/*`
   **Estimated Effort:** 2 days
   **Impact:** Breaking changes risk
   **Created:** 2024-01-20
```

### Resolved Debt
- [x] ~~Database connection pooling~~ - Resolved 2024-02-01

---

## Known Issues

### Production Issues
```markdown
1. **Severity:** Critical
   **Issue:** Payment processing fails intermittently
   **Frequency:** ~5% of transactions
   **First Reported:** 2024-02-15
   **Workaround:** Manual retry by support team
   **Investigation:** In progress
   **Owner:** @payments-team
```

### Development Issues
```markdown
1. **Issue:** Hot reload breaks after large file changes
   **Impact:** Developer experience
   **Workaround:** Manual server restart
   **Status:** Known limitation
```

---

## Recent Changes

### Last 7 Days
```markdown
2024-03-01: Deployed user profile feature
- Added profile edit endpoint
- Updated frontend components
- Migration: 20240301_add_profile_fields

2024-02-28: Security patch
- Updated bcrypt to v5.1.1
- Fixed XSS vulnerability in comments
- PR #342

2024-02-27: Performance optimization
- Added Redis caching layer
- Reduced API response time by 40%
- PR #338
```

---

## Dependencies

### Critical Dependencies
```markdown
- **Next.js:** v14.1.0
  - Update available: v14.2.0
  - Breaking changes: None
  - Action: Schedule upgrade for next sprint

- **Prisma:** v5.9.0
  - Status: Current
  - Last updated: 2024-02-01

- **React:** v18.2.0
  - Status: Current
  - Note: React 19 beta available, monitor for stable release
```

### Security Vulnerabilities
```markdown
- **None:** Last scan: 2024-03-01
- **npm audit:** 0 vulnerabilities
```

---

## Environment Status

### Development
- **Status:** ✅ Stable
- **URL:** http://localhost:3000
- **Database:** dev.db
- **Last Deploy:** Always latest

### Staging
- **Status:** ✅ Stable
- **URL:** https://staging.example.com
- **Database:** staging-db
- **Last Deploy:** 2024-03-01 14:30 UTC
- **Version:** v1.2.3-rc.1

### Production
- **Status:** ✅ Stable
- **URL:** https://example.com
- **Database:** prod-db
- **Last Deploy:** 2024-02-28 09:00 UTC
- **Version:** v1.2.2
- **Uptime:** 99.95%

---

## Team Context

### Current Team Members
- **Backend:** @john (lead), @sarah, @mike
- **Frontend:** @emma (lead), @alex
- **DevOps:** @lisa
- **Design:** @tom

### Oncall Rotation
- **This Week:** @sarah (backend), @alex (frontend)
- **Next Week:** @mike (backend), @emma (frontend)

### Out of Office
- @tom: 2024-03-01 to 2024-03-05 (vacation)

---

## Important Context

### Business Rules
```markdown
1. Free tier users limited to 100 API calls/day
2. Paid tier users get unlimited API calls
3. All user data must be encrypted at rest
4. GDPR compliance: Users can request data deletion
5. Payment processing must complete within 30 seconds
```

### Domain Knowledge
```markdown
- **User Lifecycle:**
  1. Registration → Email verification → Onboarding → Active
  2. Active users can upgrade to paid at any time
  3. Cancellation has 30-day grace period

- **Payment Flow:**
  1. User initiates payment → Stripe checkout
  2. Webhook receives confirmation
  3. Database updated, user notified
  4. Invoice generated and emailed
```

---

## Database State

### Recent Migrations
```markdown
- 20240301_add_profile_bio: ✅ Applied (prod, staging, dev)
- 20240228_add_user_roles: ✅ Applied (prod, staging, dev)
- 20240225_create_payments_table: ✅ Applied (prod, staging, dev)
```

### Pending Migrations
```markdown
- None
```

### Data Issues
```markdown
- None currently tracked
```

---

## Testing Status

### Test Coverage
```markdown
- **Overall:** 87%
- **Backend:** 92%
- **Frontend:** 83%
- **E2E:** 75%
```

### Flaky Tests
```markdown
1. `tests/e2e/checkout.spec.ts`
   - Fails intermittently on CI
   - Cause: Race condition with payment webhook
   - Workaround: Retry once
   - Fix planned: Sprint 12
```

---

## Monitoring & Metrics

### Key Metrics (Last 7 Days)
```markdown
- **Active Users:** 5,234 (+12%)
- **API Response Time:** 145ms (avg)
- **Error Rate:** 0.03%
- **Uptime:** 99.98%
```

### Recent Alerts
```markdown
- 2024-03-01 03:15: High database CPU (resolved by scaling)
- 2024-02-28 14:22: Increased error rate (resolved by deployment rollback)
```

---

## Communication Log

### Important Discussions
```markdown
2024-03-01: Architecture review
- Decided to adopt event-driven architecture for notifications
- Action items: Create ADR, update architecture docs
- Follow-up: Next sprint planning

2024-02-28: Security incident response
- Minor XSS vulnerability found and patched
- No user data compromised
- Post-mortem scheduled for 2024-03-05
```

---

## External Dependencies

### Third-Party Services
```markdown
- **Stripe:** Payment processing
  - Status: ✅ Operational
  - API Version: 2023-10-16
  
- **SendGrid:** Email delivery
  - Status: ✅ Operational
  - Rate Limit: 100k emails/day
  
- **AWS S3:** File storage
  - Status: ✅ Operational
  - Current Usage: 450GB / 1TB
```

---

## TODO / Next Steps

### Immediate (This Week)
- [ ] Fix flaky checkout test
- [ ] Review and merge PR #345
- [ ] Update staging environment
- [ ] Security scan before production deploy

### Short Term (This Sprint)
- [ ] Implement user notifications feature
- [ ] Refactor authentication service
- [ ] Add integration tests for payment flow
- [ ] Update documentation

### Long Term (Next Quarter)
- [ ] Migrate to microservices architecture
- [ ] Implement GraphQL API
- [ ] Add real-time features with WebSockets
- [ ] Internationalization (i18n)

---

## Quick Reference

### Useful Commands
```bash
# Start development
npm run dev

# Run tests
npm test

# Database
npm run db:migrate
npm run db:reset

# Deploy
npm run deploy:staging
npm run deploy:production
```

### Common Issues & Solutions
```markdown
1. **Issue:** "Cannot connect to database"
   **Solution:** Check if PostgreSQL is running, verify DATABASE_URL

2. **Issue:** "Module not found"
   **Solution:** Run `npm install`, clear node_modules and reinstall

3. **Issue:** "Port 3000 already in use"
   **Solution:** Kill process: `lsof -ti:3000 | xargs kill`
```

---

## Session Continuity Instructions

### For Claude:
```
When starting a new session:
1. Read this project_memory.md file first
2. Check progress.txt for latest session notes
3. Review tests.json for test status
4. Check git log for recent changes
5. Understand current sprint goals
6. Note any blockers or issues

When ending a session:
1. Update this project_memory.md with new context
2. Document decisions made
3. Note any new technical debt
4. Update task status
5. Add session summary to progress.txt
```

---

## Maintenance

**Last Updated:** 2024-03-01
**Updated By:** @claude
**Review Frequency:** Weekly or after significant changes
**Archive Old Entries:** Move to project_memory_archive.md after 90 days