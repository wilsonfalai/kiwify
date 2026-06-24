# KiwifyClone Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-06-24

## Active Technologies

- TypeScript with current stable framework versions at implementation time + pnpm workspaces, Turborepo, Next.js App Router, NestJS, Tailwind, shadcn/ui, Zod, React Hook Form, TanStack Table, Better Auth, Drizzle ORM, BullMQ, Asaas (001-infoproduct-platform)

## Project Structure

```text
apps/
├── members/
├── products/
├── admin/
├── checkout/
├── api/
└── worker/

packages/
├── config/
├── database/
├── auth/
├── ui/
├── schemas/
└── test-utils/

docs/
tests/e2e/
```

## Commands

pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e

## Code Style

- TypeScript across all apps and packages.
- Frontends use Next.js App Router, Tailwind, shadcn/ui, Zod, React Hook Form, and TanStack Table where tables are needed.
- Backend services use modular NestJS with validated DTOs and decoupled services.
- Domain payment code depends on `PaymentProvider`; Asaas-specific details stay in `AsaasPaymentProvider`.
- No sensitive card data, tokens, or secrets in persistence, logs, frontend env, or documentation examples.
- Shared packages are added only when immediately reused by multiple apps.

## Recent Changes

- 001-infoproduct-platform: Added TypeScript with current stable framework versions at implementation time + pnpm workspaces, Turborepo, Next.js App Router, NestJS, Tailwind, shadcn/ui, Zod, React Hook Form, TanStack Table, Better Auth, Drizzle ORM, BullMQ, Asaas

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
