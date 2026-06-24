# Quickstart: Plataforma MVP de Infoprodutos

## Prerequisites

- Node.js current LTS compatible with current stable Next.js and NestJS.
- pnpm installed.
- Docker or equivalent local services for PostgreSQL and Redis.
- Asaas sandbox credentials for staging-like payment testing, or fake provider
  mode for local automated tests.

## Required Environment Variables

Create `.env.local` for local development and keep `.env.example` updated with:

```text
DATABASE_URL=
REDIS_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
ASAAS_API_KEY=
ASAAS_BASE_URL=
ASAAS_ENVIRONMENT=
ASAAS_WEBHOOK_TOKEN=
NEXT_PUBLIC_API_URL=
```

Sensitive variables must not be exposed to frontend apps. Frontend-readable
values must use `NEXT_PUBLIC_` only when they are safe to publish.

## Local Setup

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
```

Expected workspace layout:

```text
apps/members
apps/products
apps/admin
apps/checkout
apps/api
apps/worker
packages/config
packages/database
packages/auth
packages/ui
packages/schemas
packages/test-utils
```

## Database and Queues

1. Start PostgreSQL and Redis locally.
2. Set `DATABASE_URL` and `REDIS_URL`.
3. Run Drizzle migrations through an explicit migration command.
4. Do not run migrations automatically on every API/worker start unless a later
   migration strategy explicitly documents lock/retry/rollback behavior.

## Payment Provider Modes

- `ASAAS_ENVIRONMENT=local-fake`: use fake provider/mocks for local automated
  tests.
- `ASAAS_ENVIRONMENT=sandbox`: use Asaas sandbox credentials.
- `ASAAS_ENVIRONMENT=production`: use production credentials only in production.

The domain must call payment behavior through `PaymentProvider`. Asaas-specific
behavior belongs in `AsaasPaymentProvider`.

## Manual MVP Flow

1. Sign in as a producer.
2. Create a product with title, slug, description, optional image, and active
   status.
3. Add one module and one lesson.
4. Create an active offer with Pix and credit card enabled.
5. Open the public product page and verify the active offer appears.
6. Complete checkout with Pix.
7. Confirm the payment through fake/sandbox webhook.
8. Verify the API stores the webhook event and queues processing.
9. Verify the worker marks the order paid and creates enrollment once.
10. Sign in as the buyer and open the purchased lesson in the members area.
11. Repeat the webhook delivery and verify no duplicate enrollment/access exists.
12. Complete checkout with credit card using test/fake credentials and verify no
    sensitive card data is persisted.

## Deployment Model

- GitHub hosts the repository.
- Vercel deploys one project per frontend:
  - `apps/products`
  - `apps/checkout`
  - `apps/members`
  - `apps/admin`
- Dokploy deploys backend services separately:
  - `apps/api`: public HTTP API and webhook intake
  - `apps/worker`: background processors, no public endpoint except healthcheck
    if needed
- PostgreSQL and Redis are configured for API and worker through environment
  variables in `staging` and `production`.
- Deployment is blocked if lint, typecheck, unit, integration, or E2E tests fail.

## Required Documentation

Implementation must create or update:

- `docs/product-vision.md`
- `docs/architecture.md`
- `docs/database-model.md`
- `docs/payment-asaas-flow.md`
- `docs/deploy-vercel-dokploy.md`
- `docs/git-flow.md`
- `docs/testing-strategy.md`

## Validation Checklist

- Active products/offers are public; inactive ones are not purchasable.
- Checkout rejects inactive offers and disallowed payment methods.
- Pix flow creates pending payment and shows returned Pix instructions when
  available.
- Credit-card flow never persists sensitive card data.
- Asaas webhook security validation rejects invalid requests.
- Duplicate approved webhooks produce exactly one paid order and one enrollment.
- Members area blocks users without active enrollment.
- Platform admin can view users, products, orders, payments, and webhook events.
- CI-equivalent checks pass before deploy.
