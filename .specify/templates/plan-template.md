# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript with current stable framework versions or NEEDS CLARIFICATION
**Primary Dependencies**: pnpm workspaces, Turborepo, Next.js App Router, NestJS, Tailwind, shadcn/ui, Zod, React Hook Form, TanStack Table, Better Auth, Drizzle ORM, BullMQ, Asaas or NEEDS CLARIFICATION
**Storage**: PostgreSQL with Drizzle ORM; Redis for queues/events or N/A
**Testing**: ESLint, typecheck, Vitest, Supertest for API integration, Playwright for E2E
**Target Platform**: Web frontends on Vercel plus Node.js API/worker services on Dokploy or NEEDS CLARIFICATION
**Project Type**: pnpm/Turborepo monorepo with required apps under `apps/`
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: Original simplified Kiwify/Hotmart-inspired MVP, Asaas payment via PaymentProvider/AsaasPaymentProvider, no copied brand/layout/text/code, automated tests required for completion, CI required before merge, avoid overengineering or NEEDS CLARIFICATION
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Original MVP: feature avoids copied brand/layout/text/code and limits scope to MVP value.
- Spec Kit traceability: spec, plan, data model/contracts, and tasks remain aligned.
- Monorepo fit: affected code belongs under required `apps/*` or justified shared packages.
- Stack compliance: uses mandated current stable technologies unless an exception is documented.
- Validation boundaries: DTOs/schemas validate inputs and services stay decoupled.
- Payment integration: Asaas is accessed only through `PaymentProvider`/`AsaasPaymentProvider`; Pix and credit card scope is explicit; boleto is future-only unless fully implemented and tested.
- Payment security: no sensitive card data is persisted or logged; webhook authenticity and idempotency are planned.
- Async webhooks: Asaas webhooks are received by `apps/api`, queued through Redis/BullMQ, and processed by `apps/worker`.
- Deployment/environments: GitHub, Vercel frontends, Dokploy API/worker, and `local`/`staging`/`production` envs are covered.
- Required configuration/docs: `.env.example` and `/docs` updates are included when affected.
- Automated tests: ESLint, typecheck, Vitest, Supertest, and Playwright tasks cover the delivered behavior.
- Git Flow/CI: work is planned for feature branch PR with required CI before merge.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
apps/
├── members/            # Next.js members area
├── products/           # Next.js public products/offers
├── admin/              # Next.js platform administration
├── checkout/           # Next.js checkout
├── api/                # NestJS main API
└── worker/             # NestJS queues/events/automations

packages/
└── [shared-package]/    # Only when immediately reused by 2+ apps

tests/
└── e2e/                # Playwright cross-app journeys when not colocated
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
