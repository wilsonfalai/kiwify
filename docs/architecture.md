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

## Checkout boundary

`apps/checkout` is a separate Next.js application served locally on port 3002.
It validates form input with the shared schemas and calls `apps/api` through
`NEXT_PUBLIC_API_URL`.

The API separates checkout responsibilities into:

- `OrdersService`, which creates pending orders and immutable commercial snapshots;
- `PaymentsService`, which selects and invokes the configured `PaymentProvider`;
- checkout, Pix, and credit-card controllers, which expose the HTTP workflow;
- shared customer/order/payment schemas, also used by the Drizzle status enums.

Asaas details stay inside `AsaasPaymentProvider`. The checkout domain and UI see
only canonical payment results and safe Pix instructions.
