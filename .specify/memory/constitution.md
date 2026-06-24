<!--
Sync Impact Report
Version change: 1.0.0 -> 1.1.0
Modified principles:
- IV. Validated Modular Services -> IV. Validated Modular Services
- V. Automated Quality Gates -> V. Automated Quality Gates
Added sections:
- Payment Integration
- Payment Security
- Deployment and Environments
- Environment Variables and Documentation
Removed sections:
- None
Templates requiring updates:
- UPDATED .specify/templates/plan-template.md
- UPDATED .specify/templates/spec-template.md
- UPDATED .specify/templates/tasks-template.md
- UPDATED .agents/skills/speckit-tasks/SKILL.md
- UPDATED .specify/templates/commands/*.md (directory not present)
- UPDATED Runtime guidance docs (docs/ not present yet; requirements added below)
Follow-up TODOs:
- None
-->
# KiwifyClone Constitution

## Core Principles

### I. Original Functional MVP

The product MUST be a simplified functional clone inspired by digital-product
platforms such as Kiwify and Hotmart, without copying brands, layouts, proprietary
text, protected visual identity, or source code. Every feature MUST target MVP
value first and keep the domain model ready for growth without speculative
abstractions. Complexity MUST be justified by a current requirement, not by a
possible future scenario.

Rationale: The project needs a useful commercial-platform baseline while avoiding
legal, branding, and engineering risks from copying or overbuilding.

### II. Spec-Driven Delivery

All product work MUST follow Spec-Driven Development with GitHub Spec Kit. Feature
work MUST start from a specification, proceed through an implementation plan, and
produce task lists that are traceable to user stories, requirements, data models,
and contracts. Implementation that lacks an approved spec/plan/tasks chain is
non-compliant unless it is a documented emergency fix followed by backfilled
Spec Kit artifacts before merge.

Rationale: The repository must remain understandable and evolvable as the MVP
expands across multiple applications and services.

### III. Monorepo Architecture

The repository MUST use a pnpm workspace monorepo orchestrated by Turborepo. The
required applications are:

- `apps/members`: Next.js frontend for the members area.
- `apps/products`: Next.js frontend for public product and offer pages.
- `apps/admin`: Next.js frontend for platform administration.
- `apps/checkout`: Next.js frontend for checkout.
- `apps/api`: NestJS backend for the main API.
- `apps/worker`: NestJS backend for queues, events, and automations.

Shared code MAY live in workspace packages only when at least two applications
need it immediately. Shared packages MUST expose narrow, typed APIs and MUST NOT
become dumping grounds for unrelated utilities.

Rationale: The product has distinct runtime surfaces, but the MVP must still keep
dependency management, CI, and shared contracts centralized.

### IV. Validated Modular Services

Frontend code MUST use current stable Next.js, TypeScript, App Router, Tailwind,
shadcn/ui, Zod, React Hook Form, and TanStack Table where tables are needed.
Backend code MUST use current stable NestJS with TypeScript, modular architecture,
validated DTOs, and decoupled services. Data persistence MUST use PostgreSQL with
Drizzle ORM. Authentication MUST use Better Auth. Asynchronous work MUST use
Redis and BullMQ.

Feature implementations MUST validate inputs at boundaries, keep business logic
out of route/page handlers where practical, and define DTOs/schemas close to the
boundary they protect. Services MUST be replaceable through clear interfaces or
module boundaries when they touch external systems, queues, authentication, or
database access.

Payment integrations MUST be encapsulated behind a `PaymentProvider` interface.
The MVP payment implementation MUST be named `AsaasPaymentProvider` and MUST
keep domain logic independent from Asaas SDKs, payloads, clients, and transport
details.

Rationale: These constraints make the code testable, consistent across apps, and
ready for growth without introducing enterprise patterns prematurely.

### V. Automated Quality Gates

No task or user story may be considered complete without an automated test that
validates the delivered behavior. ESLint MUST run for static analysis. Vitest
MUST cover unit tests. Typecheck MUST pass for affected TypeScript workspaces.
Supertest MUST cover API integration tests. Playwright MUST cover end-to-end user
journeys. GitHub Actions MUST run CI before merge.

Every task list MUST include the relevant automated test tasks before or with the
implementation tasks they validate. A pull request MUST NOT merge while tests,
linting, or required CI checks are failing.

Rationale: The project has multiple frontends, backend services, queues, and
database workflows; automated verification is the only reliable completion gate.

## Mandatory Technology Stack

The project MUST use current stable versions of the required frameworks and
libraries when a feature is planned or dependencies are installed. "Latest" means
the current stable release available at implementation time, excluding prerelease,
canary, alpha, beta, or release-candidate builds unless a spec explicitly approves
the exception and documents the risk.

Required stack:

- Package management and orchestration: pnpm workspaces and Turborepo.
- Frontends: Next.js, TypeScript, App Router, Tailwind, shadcn/ui, Zod, React Hook
  Form, and TanStack Table.
- Backends: NestJS, TypeScript, modular modules, validated DTOs, and decoupled
  services.
- Data: PostgreSQL and Drizzle ORM.
- Authentication: Better Auth.
- Queues and automations: Redis and BullMQ.
- Payments: Asaas through `PaymentProvider` and `AsaasPaymentProvider`.
- Quality: ESLint, Vitest, Supertest, Playwright, and GitHub Actions.

Any dependency addition MUST be justified by a current requirement and checked
against existing workspace packages before introducing another library.

## Payment Integration

The MVP MUST integrate with Asaas for payment processing. Pix and credit card
payments MUST be supported in the MVP. Boleto MAY be modeled and documented for a
future phase, but it MUST NOT be treated as delivered MVP behavior until the
corresponding automated tests and implementation exist.

All payment use cases MUST depend on a `PaymentProvider` interface. The concrete
Asaas implementation MUST be named `AsaasPaymentProvider`. Domain services MUST
store and reason over internal payment/order/enrollment state and external IDs,
not raw Asaas payloads as domain primitives.

Asaas webhooks MUST be received by `apps/api` and processed asynchronously by
`apps/worker` through Redis/BullMQ. The system MUST persist received Asaas events
for auditability and idempotency. Duplicate webhooks MUST NOT create duplicate
paid orders, duplicate enrollments, or duplicate access grants.

Rationale: Payments are core MVP behavior, but provider coupling and webhook
duplication are common sources of expensive failures.

## Payment Security

The system MUST never persist sensitive card data in PostgreSQL, Redis, logs, or
application metadata. Card data MUST be sent to Asaas according to the secure
integration model selected for Asaas. The application MAY persist only external
IDs, payment status, payment method, amount, timestamps, and safe metadata needed
for reconciliation, support, and audit.

Secrets MUST live in environment variables and MUST NOT be committed. Logs MUST
NOT expose tokens, passwords, sensitive personal data, full card numbers, CVV,
or complete card details. Asaas webhooks MUST validate the token, signature, or
security mechanism compatible with the configured Asaas integration before any
business effect is processed.

Rationale: Payment data increases operational and compliance risk; the MVP must
avoid storing sensitive card material and must treat webhook authenticity as a
hard boundary.

## Deployment and Environments

The code MUST be hosted on GitHub. The Next.js frontends in `apps/members`,
`apps/products`, `apps/admin`, and `apps/checkout` MUST be deployed to Vercel.
`apps/api` MUST be deployed to Dokploy. `apps/worker` MUST be deployed to
Dokploy as a separate service from the API.

The required environments are `local`, `staging`, and `production`. PostgreSQL
and Redis MUST be available to both API and worker through environment variables
in each environment. Deployment MUST NOT proceed when lint, typecheck, or any
required automated test fails.

Rationale: Separating frontends, API, and worker keeps operational boundaries
clear while allowing the MVP to ship with a practical deployment path.

## Environment Variables and Documentation

`.env.example` MUST document every required environment variable. At minimum it
MUST include:

- `DATABASE_URL`
- `REDIS_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `ASAAS_API_KEY`
- `ASAAS_BASE_URL`
- `ASAAS_ENVIRONMENT`
- `ASAAS_WEBHOOK_TOKEN`
- `NEXT_PUBLIC_API_URL`

The `/docs` directory MUST contain project documentation for:

- product vision
- architecture
- data model
- Asaas payment flow
- Vercel and Dokploy deployment flow
- technical decisions
- testing strategy

Rationale: Required operational knowledge must live in the repository so setup,
deployment, and future feature planning do not depend on private context.

## Development Workflow

The repository MUST use Git Flow with `main`, `develop`, feature branches, pull
requests, and mandatory CI before merge. Feature branches MUST be created for
Spec Kit features and MUST not merge directly to `main`. Pull requests MUST state
the related spec path, test evidence, and any constitution exceptions.

Spec Kit artifacts MUST preserve MVP sequencing: each user story MUST remain an
independently testable increment, and P1 scope MUST demonstrate useful MVP value.
Plans MUST call out any intentional complexity, including new
workspace packages, cross-app coupling, queue workflows, or abstractions that
could otherwise be deferred.

Pull requests that affect payments, deployment, environment variables, or public
documentation MUST update `.env.example` and `/docs` in the same change or record
the omission as a blocking constitution violation.

## Governance

This constitution supersedes conflicting repository habits, generated templates,
and ad hoc implementation preferences. Specs, plans, tasks, code review, and CI
MUST verify compliance with the principles above.

Amendments require an explicit constitution update that documents the rationale,
version bump, impacted templates, and migration expectations. Versioning follows
semantic versioning:

- MAJOR: removes or redefines a core principle or creates backward-incompatible
  governance expectations.
- MINOR: adds a principle, required technology, required workflow, or materially
  expands compliance obligations.
- PATCH: clarifies wording without changing required behavior.

Compliance review is mandatory during planning and pull request review. Any
violation MUST be recorded in the plan's Complexity Tracking section with the
reason and the simpler alternative that was rejected. Undocumented violations
block implementation and merge.

**Version**: 1.1.0 | **Ratified**: 2026-06-24 | **Last Amended**: 2026-06-24
