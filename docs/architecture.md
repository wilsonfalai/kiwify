# Architecture

The repository uses a pnpm workspace monorepo orchestrated by Turborepo.

Required applications:

- `apps/products`: public product and offer pages.
- `apps/checkout`: checkout experience.
- `apps/members`: buyer members area.
- `apps/admin`: platform and producer administration.
- `apps/api`: main NestJS API.
- `apps/worker`: queue, event, and automation processing.

Shared packages live under `packages/` and are introduced only when they support
cross-app reuse.
