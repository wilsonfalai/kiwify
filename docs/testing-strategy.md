# Testing Strategy

Every task requires automated validation before it can be considered complete.

The MVP testing layers are:

- ESLint for static analysis.
- TypeScript typecheck for compile-time correctness.
- Vitest for unit tests.
- Supertest for API integration tests.
- Playwright for end-to-end flows in later phases.
- GitHub Actions for CI before merge.

## Checkout and payment coverage

The Phase 7 suites validate:

- active offer initialization and pending order creation with an immutable item snapshot;
- Pix and credit-card flows through `PaymentProvider` using the deterministic fake provider;
- rejection of inactive offers and payment methods not allowed by the offer;
- shared Zod validation for customer, order, payment, and transient card inputs;
- consistency between shared order/payment statuses and Drizzle enums;
- absence of card number, CVV, API keys, webhook tokens, passwords, and raw sensitive input in persistence snapshots, API responses, and captured logs;
- production compilation of the Next.js checkout app.

`pnpm run ci` remains the completion gate. Asaas HTTP behavior is covered with mocked provider tests; local checkout integration uses `ASAAS_ENVIRONMENT=local-fake`.
