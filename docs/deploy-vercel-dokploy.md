# Deploy: Vercel and Dokploy

The code is hosted on GitHub. Each frontend under `apps/products`,
`apps/checkout`, `apps/members`, and `apps/admin` is deployed as a separate
Vercel project.

The API and worker are deployed separately to Dokploy:

- `apps/api`: public HTTP API and webhook intake.
- `apps/worker`: background queue and event processing.

Deploy must be blocked when lint, typecheck, or mandatory automated tests fail.
