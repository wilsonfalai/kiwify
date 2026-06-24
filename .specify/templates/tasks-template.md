---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Automated test tasks are REQUIRED. Every task or user story must have
relevant ESLint, typecheck, Vitest, Supertest, or Playwright validation before it
can be considered complete.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Members app**: `apps/members/`
- **Products app**: `apps/products/`
- **Admin app**: `apps/admin/`
- **Checkout app**: `apps/checkout/`
- **API app**: `apps/api/`
- **Worker app**: `apps/worker/`
- **Shared packages**: `packages/` only when reused immediately by 2+ apps
- **E2E tests**: colocated in the app or under `tests/e2e/` per plan.md
- **Documentation**: `/docs`
- **Environment example**: `.env.example`

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create pnpm workspace and Turborepo structure per implementation plan
- [ ] T002 Initialize required app/package dependencies for affected workspaces
- [ ] T003 [P] Configure ESLint, Vitest, Supertest, and Playwright as applicable
- [ ] T004 [P] Configure typecheck and CI-equivalent commands for affected workspaces
- [ ] T005 [P] Create or update `.env.example` with required local/staging/production variables
- [ ] T006 [P] Create or update `/docs` entries required by the implementation plan

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T007 Setup PostgreSQL schema and Drizzle migrations for shared entities
- [ ] T008 [P] Implement Better Auth integration for affected apps/services
- [ ] T009 [P] Setup NestJS modules, DTO validation, and API middleware structure
- [ ] T010 Configure Redis/BullMQ foundations when queues or automations are needed
- [ ] T011 [P] Define `PaymentProvider` interface and `AsaasPaymentProvider` boundary when payments are in scope
- [ ] T012 [P] Add Asaas webhook audit/idempotency persistence when payments are in scope
- [ ] T013 Create base models/entities that all stories depend on
- [ ] T014 Configure error handling, safe logging, and environment management
- [ ] T015 Add baseline automated tests for foundational behavior

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (REQUIRED) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T016 [P] [US1] Vitest unit test for [logic/component] in [workspace]/[path]
- [ ] T017 [P] [US1] Supertest integration test for [endpoint/webhook] in apps/api/[path]
- [ ] T018 [P] [US1] Playwright E2E test for [user journey] in [path]
- [ ] T019 [P] [US1] Payment idempotency/security test if user story touches Asaas payments

### Implementation for User Story 1

- [ ] T020 [P] [US1] Create [Entity1] schema/model in [workspace]/[path]
- [ ] T021 [P] [US1] Create [Entity2] schema/model in [workspace]/[path]
- [ ] T022 [US1] Implement [Service] in [workspace]/[path] (depends on T020, T021)
- [ ] T023 [US1] Implement [endpoint/feature] in [workspace]/[path]
- [ ] T024 [US1] Add Zod/DTO validation and error handling
- [ ] T025 [US1] Add safe logging for user story 1 operations

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (REQUIRED) ⚠️

- [ ] T026 [P] [US2] Vitest unit test for [logic/component] in [workspace]/[path]
- [ ] T027 [P] [US2] Supertest integration test for [endpoint/webhook] in apps/api/[path]
- [ ] T028 [P] [US2] Playwright E2E test for [user journey] in [path]
- [ ] T029 [P] [US2] Payment idempotency/security test if user story touches Asaas payments

### Implementation for User Story 2

- [ ] T030 [P] [US2] Create [Entity] schema/model in [workspace]/[path]
- [ ] T031 [US2] Implement [Service] in [workspace]/[path]
- [ ] T032 [US2] Implement [endpoint/feature] in [workspace]/[path]
- [ ] T033 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (REQUIRED) ⚠️

- [ ] T034 [P] [US3] Vitest unit test for [logic/component] in [workspace]/[path]
- [ ] T035 [P] [US3] Supertest integration test for [endpoint/webhook] in apps/api/[path]
- [ ] T036 [P] [US3] Playwright E2E test for [user journey] in [path]
- [ ] T037 [P] [US3] Payment idempotency/security test if user story touches Asaas payments

### Implementation for User Story 3

- [ ] T038 [P] [US3] Create [Entity] schema/model in [workspace]/[path]
- [ ] T039 [US3] Implement [Service] in [workspace]/[path]
- [ ] T040 [US3] Implement [endpoint/feature] in [workspace]/[path]

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX [P] `.env.example` update for DATABASE_URL, REDIS_URL, Better Auth, Asaas, and public API URL variables
- [ ] TXXX [P] Deployment configuration updates for Vercel frontends and Dokploy API/worker when affected
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional automated tests for discovered gaps
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation
- [ ] TXXX Run ESLint, typecheck, Vitest, Supertest, Playwright, and CI-equivalent checks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests MUST be written and fail before implementation where feasible
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Vitest unit test for [logic/component] in [workspace]/[path]"
Task: "Supertest integration test for [endpoint/webhook] in apps/api/[path]"
Task: "Playwright E2E test for [user journey] in [path]"
Task: "Payment idempotency/security test if user story touches Asaas payments"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] schema/model in [workspace]/[path]"
Task: "Create [Entity2] schema/model in [workspace]/[path]"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- A task is not complete until automated validation covers the delivered behavior
- Payment tasks must cover Asaas provider abstraction, webhook validation, audit logging, and idempotency
- Deploy tasks must keep API and worker as separate Dokploy services and frontends on Vercel
- Configuration tasks must update `.env.example`; documentation tasks must update `/docs`
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
