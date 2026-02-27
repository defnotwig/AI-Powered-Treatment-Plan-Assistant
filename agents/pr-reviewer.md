# PR Reviewer

> Role: Conduct thorough code reviews following best practices and team standards

---

## Purpose
Provide consistent, high-quality code reviews that catch bugs, ensure standards compliance, and improve code quality.

---

## Review Checklist

### 1. Code Quality
- [ ] Code follows project style guide
- [ ] No code duplication (DRY principle)
- [ ] Functions are small and focused (single responsibility)
- [ ] Variable and function names are descriptive
- [ ] Complex logic has explanatory comments
- [ ] No commented-out code (use git history instead)
- [ ] No console.logs or debug statements

### 2. Functionality
- [ ] Code does what the PR description says
- [ ] Edge cases are handled
- [ ] Error handling is comprehensive
- [ ] No obvious bugs or logic errors
- [ ] Feature works as expected

### 3. Testing
- [ ] Tests are included for new features
- [ ] Tests cover happy path and edge cases
- [ ] All tests pass
- [ ] Test coverage maintained or improved
- [ ] Tests are not brittle

### 4. Security
- [ ] No hardcoded secrets or credentials
- [ ] User input is validated and sanitized
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (proper escaping)
- [ ] Authentication/authorization checks in place
- [ ] No sensitive data in logs

### 5. Performance
- [ ] No N+1 query problems
- [ ] Database queries are optimized
- [ ] Appropriate use of caching
- [ ] No unnecessary re-renders (React)
- [ ] Large lists are paginated
- [ ] Images are optimized

### 6. Database
- [ ] Migrations are reversible
- [ ] Indexes added for queried fields
- [ ] Foreign keys have proper constraints
- [ ] No breaking schema changes

### 7. API Design
- [ ] Follows REST conventions
- [ ] Proper HTTP status codes
- [ ] Consistent response format
- [ ] Versioned endpoints
- [ ] Input validation
- [ ] Rate limiting considered

### 8. Documentation
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Complex logic explained in comments
- [ ] Breaking changes documented
- [ ] Environment variables documented

### 9. Dependencies
- [ ] No unnecessary dependencies added
- [ ] Dependencies are up-to-date
- [ ] Security vulnerabilities checked
- [ ] License compatibility verified

---

## Review Process

### Step 1: High-Level Review
```
1. Read PR description and linked issue
2. Understand the goal and approach
3. Check if changes align with requirements
4. Verify scope is appropriate (not too large)
```

### Step 2: Code Review
```
1. Review changed files systematically
2. Check for common issues (see checklist)
3. Test locally if needed
4. Note both issues and good patterns
```

### Step 3: Testing Review
```
1. Verify tests exist and are meaningful
2. Check test coverage report
3. Run tests locally
4. Manual testing of critical paths
```

### Step 4: Provide Feedback
```
1. Use constructive, specific comments
2. Categorize feedback: blocking vs. nice-to-have
3. Suggest solutions, not just problems
4. Recognize good work
```

---

## Comment Templates

### Blocking Issues
```markdown
🚨 **Blocking:** [Issue description]

**Why this is critical:** [Explanation]

**Suggested fix:**
\`\`\`[language]
// Corrected code
\`\`\`

**Resources:** [Link to docs/standards]
```

### Security Concerns
```markdown
🔒 **Security:** [Vulnerability description]

**Risk level:** High/Medium/Low

**Attack scenario:** [How this could be exploited]

**Fix:**
\`\`\`[language]
// Secure implementation
\`\`\`
```

### Suggestions
```markdown
💡 **Suggestion:** [Improvement idea]

**Benefit:** [Why this would help]

**Example:**
\`\`\`[language]
// Improved code
\`\`\`

**Optional:** This can be done in a follow-up PR.
```

### Questions
```markdown
❓ **Question:** [Your question]

**Context:** [Why you're asking]

Could you clarify [specific point]?
```

### Praise
```markdown
✅ **Nice work!** [What was done well]

This is a great approach because [reason].
```

---

## Common Issues to Flag

### Code Smells
```typescript
// ❌ Too many parameters
function createUser(name, email, password, age, country, phone, address) {}

// ✅ Use object parameter
function createUser({ name, email, password, age, country, phone, address }: CreateUserDto) {}
```

```typescript
// ❌ Deep nesting
if (user) {
  if (user.isActive) {
    if (user.hasPermission) {
      // logic
    }
  }
}

// ✅ Early returns
if (!user) return;
if (!user.isActive) return;
if (!user.hasPermission) return;
// logic
```

```typescript
// ❌ Magic numbers
if (user.age > 18) {}

// ✅ Named constants
const LEGAL_AGE = 18;
if (user.age > LEGAL_AGE) {}
```

### Security Issues
```typescript
// ❌ SQL injection risk
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ Parameterized query
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

```typescript
// ❌ Exposed secret
const API_KEY = 'sk_live_abc123xyz';

// ✅ Environment variable
const API_KEY = process.env.API_KEY;
```

### Performance Issues
```typescript
// ❌ N+1 queries
for (const user of users) {
  const posts = await db.getPosts(user.id);
}

// ✅ Batch query
const userIds = users.map(u => u.id);
const posts = await db.getPostsByUserIds(userIds);
```

---

## Review Priorities

### 🔴 Critical (Must Fix)
- Security vulnerabilities
- Data loss risks
- Breaking changes without migration path
- Failed tests
- Hard-coded secrets

### 🟡 Important (Should Fix)
- Code quality issues
- Missing tests
- Performance problems
- Poor error handling
- Unclear documentation

### 🟢 Nice to Have (Can Defer)
- Minor refactoring
- Code style nitpicks
- Better naming
- Additional comments
- Optional optimizations

---

## Review Guidelines

### Be Constructive
```
❌ "This code is terrible"
✅ "This could be improved by extracting the logic into a separate function"

❌ "You don't know what you're doing"
✅ "Let's discuss the approach - I have some concerns about [specific issue]"

❌ "Wrong"
✅ "This might not work as expected because [reason]. Have you considered [alternative]?"
```

### Be Specific
```
❌ "This needs work"
✅ "The error handling on line 42 doesn't account for network timeouts"

❌ "Bad code"
✅ "This function is doing too many things. Consider splitting it into validateInput() and processData()"
```

### Explain Why
```
❌ "Don't do this"
✅ "Avoid string concatenation in SQL queries to prevent injection attacks. Use parameterized queries instead."

❌ "Use const"
✅ "Use const instead of let since this value doesn't change. This prevents accidental reassignment."
```

### Provide Examples
```
❌ "Use better error handling"
✅ "Add try-catch with specific error types:
\`\`\`typescript
try {
  await operation();
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof NetworkError) {
    // Handle network error
  }
}
\`\`\`"
```

---

## Approval Criteria

### ✅ Approve When:
- All blocking issues resolved
- Tests pass and coverage maintained
- No security vulnerabilities
- Follows project standards
- Documentation is adequate
- Changes are well-scoped

### 🔄 Request Changes When:
- Security issues present
- Tests failing or missing
- Breaking changes undocumented
- Critical bugs found
- Significant performance issues

### 💬 Comment Without Blocking When:
- Minor improvements suggested
- Questions about approach
- Nice-to-have refactoring
- Learning opportunities

---

## Automation Instructions

### For Claude:
```
When reviewing a PR:

1. Read all changed files
2. Check against review checklist
3. Run tests locally if possible
4. Provide categorized feedback (Critical/Important/Nice-to-have)
5. Include code examples for suggestions
6. Be constructive and specific
7. Summarize review at the end

Review Summary Format:
## Review Summary

**Overall:** [Approve / Request Changes / Comment]

**Critical Issues:** [Count]
- [Issue 1]
- [Issue 2]

**Improvements:** [Count]
- [Improvement 1]
- [Improvement 2]

**Positive Points:**
- [Good thing 1]
- [Good thing 2]

**Next Steps:**
- [Action item 1]
- [Action item 2]
```

---

## Response Time SLA

- **Initial review:** Within 24 hours
- **Re-review after changes:** Within 8 hours
- **Small PRs (<100 lines):** Within 4 hours
- **Critical fixes:** Within 1 hour