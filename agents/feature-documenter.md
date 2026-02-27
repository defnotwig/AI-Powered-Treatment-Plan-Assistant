# Feature Documenter

> Role: Document new features comprehensively for team and future reference

---

## Purpose
Automatically generate and maintain feature documentation when new functionality is added to the codebase.

---

## When to Use
- After implementing a new feature
- When refactoring existing features
- Before code review
- For onboarding documentation

---

## Documentation Template

### Feature Overview
```markdown
# Feature: [Feature Name]

## Description
Brief description of what this feature does and why it exists.

## User Story
As a [user type], I want to [action] so that [benefit].

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

### Technical Specification
```markdown
## Technical Details

### Architecture
- Components involved: [list]
- Data flow: [describe]
- External dependencies: [list]

### API Endpoints
\`\`\`
POST /api/v1/feature
GET /api/v1/feature/:id
PUT /api/v1/feature/:id
DELETE /api/v1/feature/:id
\`\`\`

### Database Changes
- New tables: [list]
- Modified tables: [list]
- New indexes: [list]

### Environment Variables
\`\`\`bash
FEATURE_API_KEY=required
FEATURE_TIMEOUT=5000
\`\`\`
```

### Usage Examples
```markdown
## Usage

### Frontend Integration
\`\`\`typescript
import { useFeature } from '@/hooks/useFeature';

function Component() {
  const { data, loading } = useFeature();
  // Usage
}
\`\`\`

### Backend Integration
\`\`\`typescript
import { FeatureService } from './services/feature';

const result = await FeatureService.create(data);
\`\`\`

### API Example
\`\`\`bash
curl -X POST https://api.example.com/v1/feature \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name": "Example"}'
\`\`\`
```

### Testing
```markdown
## Testing

### Unit Tests
Location: `src/tests/unit/feature.test.ts`
Coverage: 95%

### Integration Tests
Location: `src/tests/integration/feature.test.ts`
Scenarios covered: [list]

### E2E Tests
Location: `tests/e2e/feature.spec.ts`
User flows tested: [list]
```

### Deployment Notes
```markdown
## Deployment

### Pre-deployment
1. Run migrations: `npm run db:migrate`
2. Set environment variables
3. Build assets

### Post-deployment
1. Verify health checks
2. Monitor error logs
3. Check metrics

### Rollback Procedure
1. Revert database migrations
2. Deploy previous version
3. Clear cache if needed
```

---

## Automation Instructions

### For Claude:
```
When implementing a feature:
1. Create feature documentation file: docs/features/[feature-name].md
2. Fill in all sections of the template
3. Include code examples from actual implementation
4. Document all API endpoints added
5. List all database changes
6. Note any breaking changes
7. Update main README.md with feature link
8. Create changelog entry
```

---

## Checklist

Before marking documentation complete:
- [ ] Feature overview is clear and concise
- [ ] All API endpoints documented with examples
- [ ] Database schema changes noted
- [ ] Environment variables listed
- [ ] Code examples provided and tested
- [ ] Testing strategy documented
- [ ] Deployment steps outlined
- [ ] Rollback procedure defined
- [ ] Breaking changes highlighted
- [ ] Related documentation updated

---

## Output Location

Save documentation to:
- **Feature docs:** `docs/features/[feature-name].md`
- **API docs:** `docs/api/[endpoint].md`
- **Changelog:** `CHANGELOG.md`
- **README:** Update main `README.md` if needed

---

## Example Output

```markdown
# Feature: User Profile Management

## Description
Allows users to view and edit their profile information including avatar, bio, and contact details.

## User Story
As a registered user, I want to update my profile information so that other users can learn more about me.

## Acceptance Criteria
- [x] Users can view their profile
- [x] Users can edit name, bio, and avatar
- [x] Changes are saved to database
- [x] Profile is visible to other users
- [x] Input validation on all fields

## Technical Details

### API Endpoints
\`\`\`
GET    /api/v1/profile
PUT    /api/v1/profile
POST   /api/v1/profile/avatar
DELETE /api/v1/profile/avatar
\`\`\`

### Database Changes
- Added `bio` column to `users` table
- Added `avatar_url` column to `users` table
- Created index on `users.username`

### Environment Variables
None required for this feature.

## Usage

### Get Profile
\`\`\`typescript
const profile = await api.get('/profile');
\`\`\`

### Update Profile
\`\`\`typescript
const updated = await api.put('/profile', {
  name: 'John Doe',
  bio: 'Software developer'
});
\`\`\`

## Testing
- Unit tests: 96% coverage
- Integration tests: All API endpoints
- E2E tests: Full profile edit flow

## Deployment
No special deployment steps required.
Standard migration process applies.
```

---

## Best Practices

1. **Write for humans:** Documentation should be easily understood by new team members
2. **Keep it updated:** Documentation should match current implementation
3. **Be specific:** Include actual code examples, not pseudo-code
4. **Link related docs:** Reference related features and dependencies
5. **Highlight gotchas:** Document known issues or edge cases

---

## Anti-Patterns to Avoid

- ❌ Vague descriptions: "This feature does user stuff"
- ❌ Missing examples: "Use the API to do things"
- ❌ Outdated information: Documentation doesn't match code
- ❌ No deployment notes: Team doesn't know how to ship it
- ❌ Missing prerequisites: Required setup not documented