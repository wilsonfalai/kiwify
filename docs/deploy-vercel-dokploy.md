# Deploy: Vercel and Dokploy

The code is hosted on GitHub. Each frontend under `apps/products`,
`apps/checkout`, `apps/members`, and `apps/admin` is deployed as a separate
Vercel project.

## Vercel Frontends

Each frontend must point to the same GitHub monorepo and use its own project
configuration:

| App | Root directory | Build command | Output directory |
| --- | --- | --- | --- |
| Products | `apps/products` | `pnpm --filter @kiwifyclone/products build` | `dist` |
| Checkout | `apps/checkout` | `pnpm --filter @kiwifyclone/checkout build` | `dist` |
| Members | `apps/members` | `pnpm --filter @kiwifyclone/members build` | `dist` |
| Admin | `apps/admin` | `pnpm --filter @kiwifyclone/admin build` | `dist` |

Only safe public values may be exposed to frontend apps. Public variables must
use the `NEXT_PUBLIC_` prefix. Secrets such as `DATABASE_URL`, `REDIS_URL`,
`ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`, and `BETTER_AUTH_SECRET` must not be
configured as frontend public variables.

## Dokploy Backends

The API and worker are deployed separately to Dokploy:

- `apps/api`: public HTTP API and webhook intake.
- `apps/worker`: background queue and event processing.

Dokploy should build each service from the same repository with separate build
paths:

| Service | Dockerfile | Public endpoint |
| --- | --- | --- |
| API | `apps/api/Dockerfile` | Yes, exposes HTTP on `PORT`/3001 |
| Worker | `apps/worker/Dockerfile` | No public endpoint required |

The API health endpoint is `GET /health` and returns a JSON status payload.
The worker image starts the worker process directly and does not expose a public
port in the base deployment configuration.

## Environments

Required environments:

- `local`
- `staging`
- `production`

PostgreSQL and Redis must be available to API and worker through environment
variables in `staging` and `production`.

Required backend variables:

- `DATABASE_URL`
- `REDIS_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `ASAAS_API_KEY`
- `ASAAS_BASE_URL`
- `ASAAS_ENVIRONMENT`
- `ASAAS_WEBHOOK_TOKEN`

Required frontend variable:

- `NEXT_PUBLIC_API_URL`

## Deploy Gate

Deploy must be blocked when lint, typecheck, or mandatory automated tests fail.
The expected validation sequence is:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
```
