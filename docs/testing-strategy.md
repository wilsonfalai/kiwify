# Testing Strategy

Every task requires automated validation before it can be considered complete.

The MVP testing layers are:

- ESLint for static analysis.
- TypeScript typecheck for compile-time correctness.
- Vitest for unit tests.
- Supertest for API integration tests.
- Playwright for end-to-end flows in later phases.
- GitHub Actions for CI before merge.
