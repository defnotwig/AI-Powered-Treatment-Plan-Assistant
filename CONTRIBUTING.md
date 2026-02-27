# Contributing Guide

Thank you for your interest in contributing to the AI-Powered Treatment Plan Assistant!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/AI-Powered-Treatment-Plan-Assistant.git`
3. Install dependencies:
   ```bash
   cd Backend && npm install
   cd ../Frontend && npm install
   ```
4. Create a feature branch: `git checkout -b feat/your-feature`

## Development

```bash
# Backend
cd Backend && npm run dev

# Frontend
cd Frontend && npm run dev
```

## Code Style

- TypeScript strict mode enabled
- Use `async/await` over `.then()`
- Use `const` over `let`
- PascalCase for components/classes, camelCase for functions/variables
- Files in kebab-case

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Follow conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
3. Update documentation if needed
4. Request review from maintainers

## Safety-Critical Code

All changes to medical safety logic (drug interactions, dosage calculations, risk scoring) require:
- Comprehensive test coverage
- Peer review from at least one maintainer
- Validation against clinical guidelines
