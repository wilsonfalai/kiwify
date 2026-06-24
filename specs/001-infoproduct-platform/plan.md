# Implementation Plan: Plataforma MVP de Infoprodutos

**Branch**: `001-infoproduct-platform` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-infoproduct-platform/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a simplified infoproduct sales platform with separate public product,
checkout, members, admin, API, and worker surfaces. The implementation will use a
pnpm workspace monorepo orchestrated by Turborepo, Next.js frontends, NestJS API
and worker services, PostgreSQL/Drizzle persistence, Better Auth, Redis/BullMQ
queues, and an Asaas payment integration isolated behind `PaymentProvider` and
`AsaasPaymentProvider`.

The MVP delivers product/offer creation, public offer pages, Pix and credit-card
checkout, safe payment persistence, Asaas webhook intake, idempotent asynchronous
payment processing, enrollment/access release, admin visibility, required
environment documentation, CI gates, and deployment guidance for Vercel and
Dokploy.

## Technical Context

**Language/Version**: TypeScript with current stable framework versions at implementation time  
**Primary Dependencies**: pnpm workspaces, Turborepo, Next.js App Router, NestJS, Tailwind, shadcn/ui, Zod, React Hook Form, TanStack Table, Better Auth, Drizzle ORM, BullMQ, Asaas  
**Storage**: PostgreSQL with Drizzle ORM and controlled migrations; Redis for BullMQ queues/events  
**Testing**: ESLint, typecheck, Vitest, Supertest for API integration, Playwright for E2E  
**Target Platform**: Four Next.js frontends deployed as separate Vercel projects; `apps/api` and `apps/worker` deployed as separate Dokploy services  
**Project Type**: pnpm/Turborepo monorepo with required apps under `apps/` and shared packages under `packages/`  
**Performance Goals**: Checkout completion under 3 minutes; admin order/payment lookup under 2 minutes; webhook processing idempotent under repeated delivery  
**Constraints**: Original simplified Kiwify/Hotmart-inspired MVP; no copied brand/layout/text/code; Asaas through `PaymentProvider`/`AsaasPaymentProvider`; no sensitive card persistence; API receives webhooks and worker processes them asynchronously; deployment blocked on lint, typecheck, and tests; avoid overengineering  
**Scale/Scope**: MVP with producer, buyer, and platform-admin flows; Pix and credit-card payments; boleto prepared for future only; refunds, affiliates, coupons, subscriptions, order bumps, split payments, and advanced reporting out of scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Original MVP: PASS. Scope is a simplified infoproduct platform and explicitly excludes copied brand/layout/text/code and non-MVP commerce features.
- Spec Kit traceability: PASS. Plan derives from `spec.md`; design artifacts map to user stories, requirements, data entities, and contracts.
- Monorepo fit: PASS. All application surfaces are under required `apps/*`; shared code is limited to explicit `packages/*` with immediate reuse.
- Stack compliance: PASS. The selected stack matches the constitution and user input: pnpm/Turborepo, Next.js, NestJS, PostgreSQL, Drizzle, Better Auth, Redis, BullMQ, Asaas, and required test tools.
- Validation boundaries: PASS. Zod schemas, NestJS DTO validation, shared contracts, and modular service boundaries are planned.
- Payment integration: PASS. Asaas is accessed only through `PaymentProvider` and `AsaasPaymentProvider`; Pix and credit card are MVP; boleto is future-only.
- Payment security: PASS. Plan forbids sensitive-card-data persistence/logging and requires webhook security validation and idempotency.
- Async webhooks: PASS. `apps/api` receives and persists webhook events; Redis/BullMQ queues events; `apps/worker` processes them.
- Deployment/environments: PASS. GitHub, Vercel frontends, Dokploy API/worker, and `local`/`staging`/`production` are covered.
- Required configuration/docs: PASS. `.env.example` and required `/docs` files are planned deliverables.
- Automated tests: PASS. ESLint, typecheck, Vitest, Supertest, Playwright, payment-idempotency tests, and CI checks are required.
- Git Flow/CI: PASS. Feature branch workflow and CI-before-merge are required.

## Project Structure

### Documentation (this feature)

```text
specs/001-infoproduct-platform/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md              # Created by /speckit.tasks
```

### Source Code (repository root)

```text
apps/
├── members/              # Next.js members area
├── products/             # Next.js public products/offers
├── admin/                # Next.js platform administration
├── checkout/             # Next.js checkout
├── api/                  # NestJS main API and webhook intake
└── worker/               # NestJS queues/events/automations

packages/
├── config/               # tsconfig, eslint, vitest, prettier shared config
├── database/             # Drizzle schema, migrations, client, transactions
├── auth/                 # Better Auth config, session types, auth helpers
├── ui/                   # shared UI primitives/components when reusable
├── schemas/              # Zod schemas for Product, Offer, Checkout, Order, Payment, Webhook
└── test-utils/           # factories, Asaas mocks, auth helpers, test fixtures

docs/
├── product-vision.md
├── architecture.md
├── database-model.md
├── payment-asaas-flow.md
├── deploy-vercel-dokploy.md
├── git-flow.md
└── testing-strategy.md

tests/
└── e2e/                  # Playwright cross-app purchase/access flows

.github/
└── workflows/
    └── ci.yml

.env.example
pnpm-workspace.yaml
turbo.json
```

**Structure Decision**: Use the constitution-mandated monorepo exactly. Each
frontend is a separate Next.js app so Vercel can deploy each as a separate
project with its own root directory/build command. `apps/api` and `apps/worker`
are separate NestJS deployables for Dokploy. Shared packages are limited to
configuration, database, auth, schemas, UI, and test utilities because each has
immediate cross-app use.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. The multiple apps/services are mandatory project
architecture, not optional complexity.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design & Contracts

Design artifacts generated:

- [data-model.md](./data-model.md)
- [contracts/openapi.yaml](./contracts/openapi.yaml)
- [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- Original MVP: PASS. Design keeps MVP scope explicit and excludes non-MVP commerce features.
- Spec Kit traceability: PASS. Data model and OpenAPI contract map to FR/AV requirements and user stories.
- Monorepo fit: PASS. No code outside the mandated apps/packages/docs/tests layout is required.
- Stack compliance: PASS. Design artifacts assume only constitution-approved technologies.
- Validation boundaries: PASS. Shared Zod schemas, NestJS validation, API contracts, and service boundaries are planned.
- Payment integration/security: PASS. Contracts and data model preserve provider abstraction, safe persistence, webhook authenticity, and idempotency.
- Async webhooks: PASS. External events and job logs model API intake plus worker processing.
- Deployment/environments: PASS. Quickstart and plan require local/staging/production envs, Vercel, Dokploy, PostgreSQL, and Redis.
- Automated tests: PASS. Required validation paths are represented in quickstart and future tasks.

No unresolved clarifications.
