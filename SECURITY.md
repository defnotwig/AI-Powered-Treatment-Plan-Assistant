# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | ✅ Yes    |

## Reporting a Vulnerability

If you discover a security vulnerability in the AI-Powered Treatment Plan Assistant, please report it responsibly.

### How to Report

1. **Do NOT open a public GitHub issue** for security vulnerabilities.
2. Email: **security@example.com** (replace with actual contact)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if any)

### Response Timeline

- **Acknowledgement:** Within 48 hours
- **Initial assessment:** Within 5 business days
- **Fix and release:** Within 30 days for critical issues

## Security Measures in Place

### Application Security

- **Helmet.js** security headers on all responses
- **Rate limiting** (100 requests per 15 minutes per IP)
- **CORS** restricted to configured origins
- **Input validation** on all API endpoints
- **Parameterized queries** via Sequelize ORM (SQL injection prevention)

### Infrastructure Security

- **Distroless container images** with 0 known CVEs
- **Non-root container execution** (user: `nonroot`)
- **No shell in production runtime** (Distroless)
- **Dependency scanning** via npm audit

### Data Security

- **Audit logging** for all clinical decisions with timestamps
- **Correlation IDs** for full request tracing
- **No PHI in logs** — patient data is never logged at INFO level
- **Demo mode** available without real patient data

## Dependencies

Run `npm audit` regularly to check for known vulnerabilities in dependencies.
