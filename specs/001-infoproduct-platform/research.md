# Research: Plataforma MVP de Infoprodutos

## Decision: Use pnpm workspaces with Turborepo for the monorepo

**Rationale**: The project has six deployable apps and six shared packages. pnpm
workspaces provide deterministic dependency management and local package linking,
while Turborepo coordinates lint, typecheck, test, build, and filtered app
commands across the workspace.

**Alternatives considered**:

- Single app repository: rejected because frontends, API, and worker have
  independent deployment targets.
- npm/yarn workspaces only: rejected because the constitution requires pnpm and
  Turborepo.
- Nx: rejected because it adds unnecessary framework and generator overhead for
  the current MVP.

## Decision: Four separate Next.js frontends

**Rationale**: `apps/products`, `apps/checkout`, `apps/members`, and `apps/admin`
map directly to different user journeys and Vercel deployment projects. This
keeps public offer pages, checkout, member consumption, and admin operations
separate while sharing schemas/auth/UI only when useful.

**Alternatives considered**:

- One Next.js app with route groups: rejected because deployment and environment
  boundaries are explicitly separate.
- Static product pages only: rejected because offer visibility and checkout
  require live product/offer status.

## Decision: NestJS API and NestJS worker as separate services

**Rationale**: The API owns HTTP endpoints, authentication boundaries, business
commands, and webhook intake. The worker owns asynchronous event processing,
payment-status effects, access grants, and simulated email logs. Separate Dokploy
services prevent background processing from coupling to API lifecycle and public
HTTP exposure.

**Alternatives considered**:

- Worker inside API process: rejected because constitution requires separate
  `apps/api` and `apps/worker` services.
- Serverless webhooks only: rejected because idempotent queues and retryable
  processing are core MVP requirements.

## Decision: PostgreSQL with Drizzle in `packages/database`

**Rationale**: PostgreSQL provides relational integrity for orders, payments,
enrollments, and webhook idempotency. Drizzle keeps schema definitions typed and
reviewable in the monorepo. Controlled migrations avoid unsafe auto-migration on
every service start.

**Alternatives considered**:

- Prisma: rejected because constitution requires Drizzle ORM.
- Runtime schema creation: rejected because migrations must be controlled.
- Per-app databases: rejected because orders, payments, access, and admin views
  need a coherent transactional model.

## Decision: Better Auth in `packages/auth`

**Rationale**: A shared auth package centralizes Better Auth configuration,
session typing, and helpers for Next.js frontends and NestJS services. It keeps
producer, buyer, and platform-admin access consistent.

**Alternatives considered**:

- Separate auth implementations per app: rejected due to drift and duplicate
  security risk.
- Custom auth: rejected because Better Auth is mandatory and sufficient for MVP.

## Decision: Asaas behind `PaymentProvider`

**Rationale**: The MVP must integrate Asaas for Pix and credit card, but domain
logic must not depend on provider-specific payloads. `PaymentProvider` defines
platform payment operations and `AsaasPaymentProvider` adapts Asaas customer,
charge, and webhook behavior into internal payment states.

**Alternatives considered**:

- Calling Asaas directly from order services: rejected because it violates the
  provider-abstraction constitution rule.
- Generic multi-provider implementation now: rejected as overengineering; the
  interface prepares future providers without implementing them.

## Decision: Webhook intake in API, processing in worker

**Rationale**: `apps/api` validates webhook authenticity, records the external
event for audit/idempotency, and enqueues work. `apps/worker` performs state
transitions and access grants. This splits fast intake from retryable business
effects and protects against duplicate delivery.

**Alternatives considered**:

- Process webhook synchronously in API: rejected because retries and long-running
  effects would be coupled to HTTP webhook handling.
- Store events only after successful processing: rejected because failed attempts
  must remain auditable.

## Decision: BullMQ queues with Redis

**Rationale**: BullMQ over Redis gives named queues, retries, processors, and job
logs suitable for `asaas-webhook-events`, `order-paid`, `grant-access`, and
`send-email`. Redis is mandatory and shared by API/worker through `REDIS_URL`.

**Alternatives considered**:

- In-memory queues: rejected because they do not survive process restarts.
- Database polling only: rejected because it adds avoidable complexity and does
  not match the required BullMQ stack.

## Decision: Safe payment data persistence only

**Rationale**: The system stores external IDs, status, method, amount, timestamps,
and safe metadata. Sensitive card data is sent to Asaas through the selected
secure integration flow and is never persisted or logged by the platform.

**Alternatives considered**:

- Store masked/full card details for support: rejected due to security risk and
  constitution rule.
- Store raw provider payloads as primary domain state: rejected because it leaks
  provider coupling and may include sensitive fields.

## Decision: GitHub Actions as mandatory CI gate

**Rationale**: CI must run install, lint, typecheck, unit tests, API integration
tests, E2E tests, and optionally builds before merge/deploy. This enforces the
constitution rule that no task is complete without automated validation.

**Alternatives considered**:

- Manual QA before deploy: rejected because it cannot enforce completion rules.
- Deploy-provider-only checks: rejected because Vercel and Dokploy deployments
  must not become the first validation gate.

## Decision: Documentation as implementation deliverable

**Rationale**: `/docs` must explain product vision, architecture, data model,
Asaas payment flow, Vercel/Dokploy deploy flow, Git Flow, and testing strategy.
This makes local/staging/production operation reproducible.

**Alternatives considered**:

- Keep docs only in Spec Kit artifacts: rejected because runtime documentation is
  constitutionally required in `/docs`.
