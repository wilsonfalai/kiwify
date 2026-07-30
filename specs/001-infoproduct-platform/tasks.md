# Tasks: Plataforma MVP de Infoprodutos

**Input**: Design documents from `/specs/001-infoproduct-platform/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md
**Tests**: Automated validation is mandatory for every task. No task is complete until its listed test and validation command pass.
**Organization**: Tasks follow the dependency order requested by the user and preserve Spec Kit traceability to user stories where applicable.

## Format

- `- [ ] T### [P?] [US?] Description with file path`
- Details under each task define Objetivo, Arquivos prováveis, Critério de aceite, Teste obrigatório, and Comando para validar.

## FASE 1: Fundação do monorepo

- [X] T001 Criar pnpm workspace em `pnpm-workspace.yaml`
  - Objetivo: Declarar apps e packages do monorepo. Arquivos prováveis: `pnpm-workspace.yaml`, `package.json`. Critério de aceite: workspaces incluem `apps/*` e `packages/*`. Teste obrigatório: workspace discovery. Comando para validar: `pnpm -r list --depth 0`
- [X] T002 Criar Turborepo em `turbo.json`
  - Objetivo: Orquestrar build, lint, typecheck e testes. Arquivos prováveis: `turbo.json`, `package.json`. Critério de aceite: pipelines raiz cobrem comandos obrigatórios. Teste obrigatório: dry run de pipeline. Comando para validar: `pnpm turbo run lint --dry=json`
- [X] T003 Criar estrutura apps em `apps/`
  - Objetivo: Criar `members`, `products`, `admin`, `checkout`, `api`, `worker`. Arquivos prováveis: `apps/*/package.json`, `apps/*/src` ou `apps/*/app`. Critério de aceite: todos os apps existem e são workspaces. Teste obrigatório: listagem de workspaces. Comando para validar: `pnpm -r list --depth 0`
- [X] T004 Criar estrutura packages em `packages/`
  - Objetivo: Criar `config`, `database`, `auth`, `schemas`, `ui`, `test-utils`. Arquivos prováveis: `packages/*/package.json`, `packages/*/src/index.ts`. Critério de aceite: todos os packages existem e exportam entrypoint. Teste obrigatório: import smoke tests. Comando para validar: `pnpm typecheck`
- [X] T005 Configurar TypeScript compartilhado em `packages/config/tsconfig`
  - Objetivo: Centralizar tsconfig base para apps e packages. Arquivos prováveis: `packages/config/tsconfig/base.json`, `tsconfig.json`, `apps/*/tsconfig.json`, `packages/*/tsconfig.json`. Critério de aceite: todos os workspaces herdam config comum. Teste obrigatório: typecheck raiz. Comando para validar: `pnpm typecheck`
- [X] T006 Configurar ESLint compartilhado em `packages/config/eslint`
  - Objetivo: Padronizar lint para Next.js, NestJS e packages. Arquivos prováveis: `packages/config/eslint/*`, `eslint.config.mjs`, `apps/*/eslint.config.mjs`. Critério de aceite: lint roda em todo monorepo. Teste obrigatório: lint raiz. Comando para validar: `pnpm lint`
- [X] T007 Configurar Vitest em `packages/config/vitest`
  - Objetivo: Criar preset comum para unit tests. Arquivos prováveis: `packages/config/vitest/base.ts`, `vitest.config.ts`, `packages/*/vitest.config.ts`. Critério de aceite: teste unitário smoke roda. Teste obrigatório: Vitest smoke. Comando para validar: `pnpm test:unit`
- [X] T008 Configurar scripts raiz em `package.json`
  - Objetivo: Criar scripts `dev`, `build`, `lint`, `typecheck`, `test`, `test:unit`, `test:integration`, `test:e2e`, `ci`. Arquivos prováveis: `package.json`, `turbo.json`. Critério de aceite: scripts existem e apontam para turbo/pnpm. Teste obrigatório: execução CI local. Comando para validar: `pnpm run ci`
- [X] T009 Criar docker-compose local com PostgreSQL e Redis em `docker-compose.yml`
  - Objetivo: Subir dependências locais. Arquivos prováveis: `docker-compose.yml`, `.env.example`. Critério de aceite: serviços `postgres` e `redis` têm portas e healthchecks. Teste obrigatório: healthcheck dos containers. Comando para validar: `docker compose config`
- [X] T010 Criar `.env.example`
  - Objetivo: Documentar variáveis obrigatórias. Arquivos prováveis: `.env.example`. Critério de aceite: inclui `DATABASE_URL`, `REDIS_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ASAAS_API_KEY`, `ASAAS_BASE_URL`, `ASAAS_ENVIRONMENT`, `ASAAS_WEBHOOK_TOKEN`, `NEXT_PUBLIC_API_URL`. Teste obrigatório: script de validação de env example. Comando para validar: `pnpm test:unit -- --run env-example`
- [X] T011 Criar GitHub Actions para CI em `.github/workflows/ci.yml`
  - Objetivo: Validar install, lint, typecheck e testes. Arquivos prováveis: `.github/workflows/ci.yml`. Critério de aceite: workflow executa `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:integration`, `pnpm test:e2e`. Teste obrigatório: action lint/static check. Comando para validar: `pnpm test:unit -- --run ci-workflow`
- [X] T012 Criar documentação inicial em `docs/`
  - Objetivo: Criar docs obrigatórios do MVP. Arquivos prováveis: `docs/product-vision.md`, `docs/architecture.md`, `docs/database-model.md`, `docs/payment-asaas-flow.md`, `docs/deploy-vercel-dokploy.md`, `docs/git-flow.md`, `docs/testing-strategy.md`. Critério de aceite: todos os arquivos existem com seções mínimas. Teste obrigatório: docs completeness test. Comando para validar: `pnpm test:unit -- --run docs-required`

## FASE 2: Deploy base

- [X] T013 [P] Criar configuração Vercel dos frontends em `apps/*/vercel.json`
  - Objetivo: Configurar projects Vercel para `products`, `checkout`, `members`, `admin`. Arquivos prováveis: `apps/products/vercel.json`, `apps/checkout/vercel.json`, `apps/members/vercel.json`, `apps/admin/vercel.json`, `docs/deploy-vercel-dokploy.md`. Critério de aceite: cada app declara build/root sem secrets públicas indevidas. Teste obrigatório: validação de config Vercel. Comando para validar: `pnpm test:unit -- --run vercel-config`
- [X] T014 Criar Dockerfile da API em `apps/api/Dockerfile`
  - Objetivo: Preparar build Dokploy para API. Arquivos prováveis: `apps/api/Dockerfile`, `.dockerignore`, `docs/deploy-vercel-dokploy.md`. Critério de aceite: Dockerfile instala dependências e inicia API. Teste obrigatório: build de imagem API. Comando para validar: `docker build -f apps/api/Dockerfile .`
- [X] T015 Criar Dockerfile do worker em `apps/worker/Dockerfile`
  - Objetivo: Preparar build Dokploy para worker separado. Arquivos prováveis: `apps/worker/Dockerfile`, `.dockerignore`, `docs/deploy-vercel-dokploy.md`. Critério de aceite: Dockerfile inicia worker sem endpoint público obrigatório. Teste obrigatório: build de imagem worker. Comando para validar: `docker build -f apps/worker/Dockerfile .`
- [X] T016 Criar healthcheck da API em `apps/api/src/health`
  - Objetivo: Expor endpoint HTTP de saúde. Arquivos prováveis: `apps/api/src/health/health.module.ts`, `apps/api/src/health/health.controller.ts`, `apps/api/test/health.spec.ts`. Critério de aceite: `GET /health` retorna status ok. Teste obrigatório: integração Supertest. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration`
- [X] T017 Atualizar documentação de deploy em `docs/deploy-vercel-dokploy.md`
  - Objetivo: Documentar Vercel + Dokploy, build paths e ambientes. Arquivos prováveis: `docs/deploy-vercel-dokploy.md`. Critério de aceite: cobre GitHub, Vercel por frontend, Dokploy API/worker, PostgreSQL, Redis, staging e production. Teste obrigatório: docs deploy completeness. Comando para validar: `pnpm test:unit -- --run docs-deploy`
- [X] T018 Validar build independente de cada app via `turbo.json`
  - Objetivo: Garantir build isolado dos seis apps. Arquivos prováveis: `turbo.json`, `apps/*/package.json`. Critério de aceite: cada app tem script build funcional. Teste obrigatório: build filtrado por app. Comando para validar: `pnpm --filter ./apps/products build && pnpm --filter ./apps/checkout build && pnpm --filter ./apps/members build && pnpm --filter ./apps/admin build && pnpm --filter ./apps/api build && pnpm --filter ./apps/worker build`

## FASE 3: Banco de dados e Drizzle

- [X] T019 Configurar Drizzle em `packages/database`
  - Objetivo: Centralizar Drizzle config. Arquivos prováveis: `packages/database/drizzle.config.ts`, `packages/database/package.json`. Critério de aceite: Drizzle reconhece schema e pasta migrations. Teste obrigatório: drizzle config load. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run drizzle-config`
- [X] T020 Criar schema inicial em `packages/database/src/schema`
  - Objetivo: Definir exports de schema Drizzle. Arquivos prováveis: `packages/database/src/schema/index.ts`. Critério de aceite: schema compila e exporta tabelas. Teste obrigatório: typecheck database. Comando para validar: `pnpm --filter @kiwifyclone/database typecheck`
- [X] T021 Criar migrations em `packages/database/drizzle`
  - Objetivo: Gerar migration inicial controlada. Arquivos prováveis: `packages/database/drizzle/*.sql`, `packages/database/src/migrate.ts`. Critério de aceite: migration contém todas as tabelas iniciais. Teste obrigatório: migration smoke. Comando para validar: `pnpm --filter @kiwifyclone/database test:integration -- --run migrations`
- [X] T022 Criar conexão PostgreSQL em `packages/database/src/client.ts`
  - Objetivo: Expor cliente Drizzle por `DATABASE_URL`. Arquivos prováveis: `packages/database/src/client.ts`, `packages/database/src/env.ts`. Critério de aceite: cliente conecta usando env e falha com mensagem clara sem env. Teste obrigatório: integration db connection. Comando para validar: `pnpm --filter @kiwifyclone/database test:integration -- --run connection`
- [X] T023 Criar helper de testes com banco em `packages/test-utils/src/database`
  - Objetivo: Preparar setup/teardown transacional. Arquivos prováveis: `packages/test-utils/src/database.ts`, `packages/test-utils/src/factories.ts`. Critério de aceite: testes criam dados e limpam estado. Teste obrigatório: helper integration. Comando para validar: `pnpm --filter @kiwifyclone/test-utils test:integration -- --run database-helper`
- [X] T024 Criar tabela `users` em `packages/database/src/schema/users.ts`
  - Objetivo: Persistir identidades autenticadas. Arquivos prováveis: `packages/database/src/schema/users.ts`, `packages/database/drizzle/*.sql`. Critério de aceite: campos e unique email existem. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run users-schema`
- [X] T025 Criar tabela `producer_profiles` em `packages/database/src/schema/producers.ts`
  - Objetivo: Persistir perfil de produtor. Arquivos prováveis: `packages/database/src/schema/producers.ts`. Critério de aceite: FK para users e status existem. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run producer-profiles-schema`
- [X] T026 Criar tabela `customer_profiles` em `packages/database/src/schema/customers.ts`
  - Objetivo: Persistir perfil comprador. Arquivos prováveis: `packages/database/src/schema/customers.ts`. Critério de aceite: FK para users e dados mínimos existem. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run customer-profiles-schema`
- [X] T027 Criar tabela `products` em `packages/database/src/schema/products.ts`
  - Objetivo: Persistir produtos digitais. Arquivos prováveis: `packages/database/src/schema/products.ts`. Critério de aceite: slug unique, status e producer FK existem. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run products-schema`
- [X] T028 Criar tabela `product_modules` em `packages/database/src/schema/products.ts`
  - Objetivo: Persistir módulos ordenados. Arquivos prováveis: `packages/database/src/schema/products.ts`. Critério de aceite: FK produto e ordenação existem. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run product-modules-schema`
- [X] T029 Criar tabela `product_lessons` em `packages/database/src/schema/products.ts`
  - Objetivo: Persistir aulas. Arquivos prováveis: `packages/database/src/schema/products.ts`. Critério de aceite: tipo de conteúdo e campos de texto/video existem. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run product-lessons-schema`
- [X] T030 Criar tabela `offers` em `packages/database/src/schema/offers.ts`
  - Objetivo: Persistir ofertas compráveis. Arquivos prováveis: `packages/database/src/schema/offers.ts`. Critério de aceite: preço, status e métodos permitidos existem. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run offers-schema`
- [X] T031 Criar tabela `orders` em `packages/database/src/schema/orders.ts`
  - Objetivo: Persistir lifecycle de pedido. Arquivos prováveis: `packages/database/src/schema/orders.ts`. Critério de aceite: status pending/paid/refused/canceled e totais existem. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run orders-schema`
- [X] T032 Criar tabela `order_items` em `packages/database/src/schema/orders.ts`
  - Objetivo: Persistir snapshot da oferta comprada. Arquivos prováveis: `packages/database/src/schema/orders.ts`. Critério de aceite: FK order/offer/product e preço snapshot existem. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run order-items-schema`
- [X] T033 Criar tabela `payments` em `packages/database/src/schema/payments.ts`
  - Objetivo: Persistir pagamento seguro. Arquivos prováveis: `packages/database/src/schema/payments.ts`. Critério de aceite: status pending/approved/refused/canceled, método, valor e safe metadata existem sem campos de cartão sensíveis. Teste obrigatório: no-sensitive-fields assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run payments-schema`
- [X] T034 Criar tabela `payment_provider_customers` em `packages/database/src/schema/payments.ts`
  - Objetivo: Mapear cliente interno para provider. Arquivos prováveis: `packages/database/src/schema/payments.ts`. Critério de aceite: unique por provider/customer externo. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run provider-customers-schema`
- [X] T035 Criar tabela `payment_provider_charges` em `packages/database/src/schema/payments.ts`
  - Objetivo: Mapear cobrança externa segura. Arquivos prováveis: `packages/database/src/schema/payments.ts`. Critério de aceite: unique por provider/charge externo e campos Pix seguros. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run provider-charges-schema`
- [X] T036 Criar tabela `enrollments` em `packages/database/src/schema/enrollments.ts`
  - Objetivo: Persistir acesso comprado. Arquivos prováveis: `packages/database/src/schema/enrollments.ts`. Critério de aceite: unique impede duplicidade por cliente/produto/pedido. Teste obrigatório: uniqueness integration. Comando para validar: `pnpm --filter @kiwifyclone/database test:integration -- --run enrollments-unique`
- [X] T037 Criar tabela `external_webhook_events` em `packages/database/src/schema/webhooks.ts`
  - Objetivo: Auditar e idempotentizar webhooks. Arquivos prováveis: `packages/database/src/schema/webhooks.ts`. Critério de aceite: unique provider/idempotencyKey e status de processamento existem. Teste obrigatório: duplicate event integration. Comando para validar: `pnpm --filter @kiwifyclone/database test:integration -- --run webhook-events-idempotency`
- [X] T038 Criar tabela `domain_events` em `packages/database/src/schema/events.ts`
  - Objetivo: Persistir eventos internos. Arquivos prováveis: `packages/database/src/schema/events.ts`. Critério de aceite: aggregate e payload seguro existem. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run domain-events-schema`
- [X] T039 Criar tabela `job_logs` em `packages/database/src/schema/jobs.ts`
  - Objetivo: Persistir logs de jobs e email fake. Arquivos prováveis: `packages/database/src/schema/jobs.ts`. Critério de aceite: fila, job, status, erro e summaries existem. Teste obrigatório: schema assertion. Comando para validar: `pnpm --filter @kiwifyclone/database test:unit -- --run job-logs-schema`

## FASE 4: Autenticação

- [X] T040 Configurar Better Auth em `packages/auth/src/config.ts`
  - Objetivo: Centralizar configuração de auth. Arquivos prováveis: `packages/auth/src/config.ts`, `packages/auth/src/index.ts`. Critério de aceite: config usa env e exporta tipos. Teste obrigatório: auth config unit. Comando para validar: `pnpm --filter @kiwifyclone/auth test:unit -- --run auth-config`
- [X] T041 Integrar auth com API em `apps/api/src/auth`
  - Objetivo: Criar `AuthModule` e guards. Arquivos prováveis: `apps/api/src/auth/auth.module.ts`, `apps/api/src/auth/session.guard.ts`. Critério de aceite: endpoints protegidos exigem sessão. Teste obrigatório: Supertest auth guard. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run auth`
- [X] T042 Criar helpers de sessão nos frontends em `packages/auth/src/frontend.ts`
  - Objetivo: Compartilhar leitura de sessão. Arquivos prováveis: `packages/auth/src/frontend.ts`, `apps/*/src/lib/session.ts`. Critério de aceite: frontends usam helper comum. Teste obrigatório: helper unit. Comando para validar: `pnpm --filter @kiwifyclone/auth test:unit -- --run session-helper`
- [X] T043 Criar proteção de rotas em `apps/*/middleware.ts`
  - Objetivo: Bloquear membros/admin/checkout quando necessário. Arquivos prováveis: `apps/members/middleware.ts`, `apps/admin/middleware.ts`, `apps/checkout/middleware.ts`. Critério de aceite: rotas privadas redirecionam ou negam acesso. Teste obrigatório: middleware unit/e2e. Comando para validar: `pnpm test:unit -- --run route-protection`
- [X] T044 Criar papéis buyer/producer/platform_admin em `packages/auth/src/roles.ts`
  - Objetivo: Modelar roles e permissões. Arquivos prováveis: `packages/auth/src/roles.ts`, `packages/schemas/src/auth.ts`. Critério de aceite: permissões distinguem comprador, produtor e admin. Teste obrigatório: role matrix unit. Comando para validar: `pnpm --filter @kiwifyclone/auth test:unit -- --run roles`
- [X] T045 Criar testes de autenticação e autorização em `apps/api/test/authz.e2e-spec.ts`
  - Objetivo: Validar acesso por papel. Arquivos prováveis: `apps/api/test/authz.e2e-spec.ts`, `packages/test-utils/src/auth.ts`. Critério de aceite: produtor, comprador e platform_admin têm acessos corretos. Teste obrigatório: authz integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run authz`

## FASE 5: Produtos e ofertas

- [X] T046 [US1] Criar ProductsModule na API em `apps/api/src/products/products.module.ts`
  - Objetivo: Base modular para produtos. Arquivos prováveis: `apps/api/src/products/*`, `packages/schemas/src/product.ts`. Critério de aceite: módulo registra controller/service. Teste obrigatório: module bootstrap. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run products-module`
- [X] T047 [US1] Criar CRUD de produtos em `apps/api/src/products`
  - Objetivo: Permitir criar/listar/editar produtos do produtor. Arquivos prováveis: `apps/api/src/products/products.controller.ts`, `apps/api/src/products/products.service.ts`. Critério de aceite: produtor gerencia próprios produtos. Teste obrigatório: CRUD integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run products-crud`
- [X] T048 [US1] Criar sub-recurso de módulos em `apps/api/src/products/modules`
  - Objetivo: Criar e ordenar módulos. Arquivos prováveis: `apps/api/src/products/modules.controller.ts`, `apps/api/src/products/modules.service.ts`. Critério de aceite: módulos pertencem ao produto do produtor. Teste obrigatório: modules integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run product-modules`
- [X] T049 [US1] Criar sub-recurso de aulas em `apps/api/src/products/lessons`
  - Objetivo: Criar e ordenar aulas. Arquivos prováveis: `apps/api/src/products/lessons.controller.ts`, `apps/api/src/products/lessons.service.ts`. Critério de aceite: valida text/video_url e ownership. Teste obrigatório: lessons integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run product-lessons`
- [X] T050 [US1] Criar OffersModule em `apps/api/src/offers/offers.module.ts`
  - Objetivo: Base modular para ofertas. Arquivos prováveis: `apps/api/src/offers/*`, `packages/schemas/src/offer.ts`. Critério de aceite: módulo registra controller/service. Teste obrigatório: module bootstrap. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run offers-module`
- [X] T051 [US1] Criar regra de produto inativo em `apps/api/src/products/public-products.service.ts`
  - Objetivo: Ocultar produto inativo publicamente. Arquivos prováveis: `apps/api/src/products/public-products.service.ts`, `apps/api/test/public-products.e2e-spec.ts`. Critério de aceite: inativos retornam 404/não listam. Teste obrigatório: public product integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run public-products`
- [X] T052 [US1] Criar regra de oferta inativa em `apps/api/src/offers/offer-eligibility.service.ts`
  - Objetivo: Bloquear compra de oferta inativa. Arquivos prováveis: `apps/api/src/offers/offer-eligibility.service.ts`, `apps/api/test/offer-eligibility.e2e-spec.ts`. Critério de aceite: checkout rejeita oferta inativa. Teste obrigatório: eligibility integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run offer-eligibility`
- [X] T053 [US1] Criar telas admin de produtos em `apps/admin/app/products`
  - Objetivo: Listar/criar/editar produtos, módulos, aulas e ofertas. Arquivos prováveis: `apps/admin/app/products/page.tsx`, `apps/admin/app/products/[id]/*`, `apps/admin/components/product-form.tsx`. Critério de aceite: produtor executa fluxo de criação completo. Teste obrigatório: Playwright admin product flow. Comando para validar: `pnpm test:e2e -- --grep \"producer creates product\"`
- [X] T054 [US1] Criar tela pública de produto em `apps/products/app/[slug]/page.tsx`
  - Objetivo: Exibir produto/oferta ativa. Arquivos prováveis: `apps/products/app/[slug]/page.tsx`, `apps/products/components/public-offer.tsx`. Critério de aceite: mostra título, descrição, preço, imagem opcional e botão comprar. Teste obrigatório: Playwright public product. Comando para validar: `pnpm test:e2e -- --grep \"public product\"`

## FASE 6: Integração Asaas

- [X] T055 [US2] Criar interface PaymentProvider em `apps/api/src/payments/payment-provider.ts`
  - Objetivo: Isolar domínio de provedores. Arquivos prováveis: `apps/api/src/payments/payment-provider.ts`, `packages/schemas/src/payment.ts`. Critério de aceite: interface cobre customer, Pix, cartão e webhook parse. Teste obrigatório: contract unit. Comando para validar: `pnpm --filter @kiwifyclone/api test:unit -- src/payments/payment-provider.contract.spec.ts`
- [X] T056 [US2] Criar AsaasPaymentProvider em `apps/api/src/payments/asaas-payment-provider.ts`
  - Objetivo: Implementar provider Asaas. Arquivos prováveis: `apps/api/src/payments/asaas-payment-provider.ts`. Critério de aceite: classe implementa interface sem vazar payload para domínio. Teste obrigatório: provider unit with mocks. Comando para validar: `pnpm --filter @kiwifyclone/api test:unit -- src/payments/asaas-payment-provider.spec.ts`
- [X] T057 [US2] Criar FakePaymentProvider em `apps/api/src/payments/fake-payment-provider.ts`
  - Objetivo: Suportar testes e desenvolvimento local. Arquivos prováveis: `apps/api/src/payments/fake-payment-provider.ts`, `packages/test-utils/src/payments.ts`. Critério de aceite: fake retorna Pix/cartão/status previsíveis. Teste obrigatório: fake provider unit. Comando para validar: `pnpm --filter @kiwifyclone/api test:unit -- src/payments/fake-payment-provider.spec.ts`
- [X] T058 [US2] Criar configuração Asaas em `apps/api/src/payments/payments.env.ts`
  - Objetivo: Validar `ASAAS_API_KEY`, `ASAAS_BASE_URL`, `ASAAS_ENVIRONMENT`. Arquivos prováveis: `apps/api/src/payments/payments.env.ts`, `.env.example`. Critério de aceite: env inválida falha cedo e segura. Teste obrigatório: env unit. Comando para validar: `pnpm --filter @kiwifyclone/api test:unit -- src/payments/payments.env.spec.ts`
- [X] T059 [US2] Criar método createCustomer em `AsaasPaymentProvider`
  - Objetivo: Criar/localizar cliente Asaas. Arquivos prováveis: `apps/api/src/payments/asaas-payment-provider.ts`, `apps/api/src/payments/dto.ts`. Critério de aceite: retorna externalCustomerId seguro. Teste obrigatório: mocked Asaas customer. Comando para validar: `pnpm --filter @kiwifyclone/api test:unit -- src/payments/asaas-payment-provider.spec.ts`
- [X] T060 [US2] Criar método createPixCharge em `AsaasPaymentProvider`
  - Objetivo: Criar cobrança Pix. Arquivos prováveis: `apps/api/src/payments/asaas-payment-provider.ts`. Critério de aceite: retorna charge id/status e instruções Pix seguras. Teste obrigatório: mocked Pix charge. Comando para validar: `pnpm --filter @kiwifyclone/api test:unit -- src/payments/asaas-payment-provider.spec.ts`
- [X] T061 [US2] Criar método createCreditCardCharge em `AsaasPaymentProvider`
  - Objetivo: Processar cartão sem persistir dados sensíveis. Arquivos prováveis: `apps/api/src/payments/asaas-payment-provider.ts`. Critério de aceite: card input não aparece em retorno seguro. Teste obrigatório: no-sensitive-card test. Comando para validar: `pnpm --filter @kiwifyclone/api test:unit -- src/payments/asaas-payment-provider.spec.ts`
- [X] T062 [US2] Criar normalização de status Asaas em `apps/api/src/payments/payment-status.mapper.ts`
  - Objetivo: Mapear status provider para interno. Arquivos prováveis: `apps/api/src/payments/payment-status.mapper.ts`. Critério de aceite: approved/pending/refused cobertos e unknown não muda estado. Teste obrigatório: mapper unit. Comando para validar: `pnpm --filter @kiwifyclone/api test:unit -- src/payments/payment-status.mapper.spec.ts`
- [X] T063 [US2] Criar testes unitários do provider com mocks em `apps/api/src/payments/*.spec.ts`
  - Objetivo: Cobrir happy paths Asaas. Arquivos prováveis: `apps/api/src/payments/asaas-payment-provider.spec.ts`. Critério de aceite: customer, Pix e cartão aprovam com mocks. Teste obrigatório: provider unit suite. Comando para validar: `pnpm --filter @kiwifyclone/api test:unit -- src/payments/asaas-payment-provider.spec.ts`
- [X] T064 [US2] Criar testes de erro do provider em `apps/api/src/payments/asaas-payment-provider.errors.spec.ts`
  - Objetivo: Cobrir comunicação, cobrança recusada, resposta inválida e timeout. Arquivos prováveis: `apps/api/src/payments/asaas-payment-provider.errors.spec.ts`. Critério de aceite: erros viram falhas seguras sem dados sensíveis. Teste obrigatório: provider error suite. Comando para validar: `pnpm --filter @kiwifyclone/api test:unit -- src/payments/asaas-payment-provider.errors.spec.ts`

## FASE 7: Checkout e pedidos

- [ ] T065 [US2] Criar OrdersModule em `apps/api/src/orders/orders.module.ts`
  - Objetivo: Base de pedidos. Arquivos prováveis: `apps/api/src/orders/*`. Critério de aceite: módulo cria pedido pending. Teste obrigatório: orders module integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run orders-module`
- [ ] T066 [US2] Criar PaymentsModule em `apps/api/src/payments/payments.module.ts`
  - Objetivo: Orquestrar pagamentos. Arquivos prováveis: `apps/api/src/payments/payments.module.ts`, `apps/api/src/payments/payments.service.ts`. Critério de aceite: módulo injeta provider configurado. Teste obrigatório: payments module integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run payments-module`
- [ ] T067 [US2] Criar endpoint iniciar checkout em `apps/api/src/checkout/checkout.controller.ts`
  - Objetivo: Validar oferta e dados iniciais. Arquivos prováveis: `apps/api/src/checkout/*`. Critério de aceite: retorna elegibilidade e bloqueia oferta inválida. Teste obrigatório: checkout start integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run checkout-start`
- [ ] T068 [US2] Criar endpoint criar pedido em `apps/api/src/checkout/checkout.controller.ts`
  - Objetivo: Criar order e order_item. Arquivos prováveis: `apps/api/src/checkout/checkout.service.ts`. Critério de aceite: pedido pending com snapshot da oferta. Teste obrigatório: order creation integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run checkout-order`
- [ ] T069 [US2] Criar endpoint pagamento Pix em `apps/api/src/checkout/pix.controller.ts`
  - Objetivo: Criar cobrança Pix e salvar Payment. Arquivos prováveis: `apps/api/src/checkout/pix.controller.ts`, `apps/api/src/payments/payments.service.ts`. Critério de aceite: retorna status pending e instruções Pix quando disponíveis. Teste obrigatório: Pix checkout integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run checkout-pix`
- [ ] T070 [US2] Criar endpoint pagamento cartão em `apps/api/src/checkout/card.controller.ts`
  - Objetivo: Processar cartão via provider. Arquivos prováveis: `apps/api/src/checkout/card.controller.ts`, `apps/api/src/payments/payments.service.ts`. Critério de aceite: não persiste dados sensíveis e salva retorno seguro. Teste obrigatório: card checkout integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run checkout-card`
- [ ] T071 [US2] Criar tela checkout em `apps/checkout/app/[offerId]/page.tsx`
  - Objetivo: UI de compra de oferta ativa. Arquivos prováveis: `apps/checkout/app/[offerId]/page.tsx`, `apps/checkout/components/checkout-form.tsx`. Critério de aceite: comprador escolhe Pix/cartão e vê status inicial. Teste obrigatório: Playwright checkout page. Comando para validar: `pnpm test:e2e -- --grep \"checkout page\"`
- [ ] T072 [US2] Criar formulário com Zod + React Hook Form em `apps/checkout/components/checkout-form.tsx`
  - Objetivo: Validar dados do comprador. Arquivos prováveis: `apps/checkout/components/checkout-form.tsx`, `packages/schemas/src/checkout.ts`. Critério de aceite: erros de validação aparecem antes do submit. Teste obrigatório: component/unit validation. Comando para validar: `pnpm --filter @kiwifyclone/checkout test:unit -- --run checkout-form`
- [ ] T073 [US2] Criar validação mínima de documento em `packages/schemas/src/customer.ts`
  - Objetivo: Validar dados mínimos do comprador para Asaas. Arquivos prováveis: `packages/schemas/src/customer.ts`. Critério de aceite: nome/email são obrigatórios; documento fiscal e telefone são exigidos quando o método/provider exigir; formatos inválidos bloqueiam checkout. Teste obrigatório: schema unit. Comando para validar: `pnpm --filter @kiwifyclone/schemas test:unit -- --run customer-document`
- [ ] T074 [US2] Criar status de pedido em `packages/schemas/src/order.ts`
  - Objetivo: Padronizar `pending`, `paid`, `refused`, `canceled`. Arquivos prováveis: `packages/schemas/src/order.ts`, `packages/database/src/schema/orders.ts`. Critério de aceite: API e DB usam enum compartilhado. Teste obrigatório: enum consistency. Comando para validar: `pnpm --filter @kiwifyclone/schemas test:unit -- --run order-status`
- [ ] T075 [US2] Criar status de pagamento em `packages/schemas/src/payment.ts`
  - Objetivo: Padronizar `pending`, `approved`, `refused`, `canceled`. Arquivos prováveis: `packages/schemas/src/payment.ts`, `packages/database/src/schema/payments.ts`. Critério de aceite: mapper Asaas usa enum compartilhado. Teste obrigatório: enum consistency. Comando para validar: `pnpm --filter @kiwifyclone/schemas test:unit -- --run payment-status`
- [ ] T076 [US2] Criar testes de integração do checkout em `apps/api/test/checkout.e2e-spec.ts`
  - Objetivo: Cobrir fluxo pedido + Pix/cartão. Arquivos prováveis: `apps/api/test/checkout.e2e-spec.ts`. Critério de aceite: happy paths e bloqueios passam com fake provider. Teste obrigatório: checkout integration suite. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run checkout`
- [ ] T077 [US2] Garantir que dados sensíveis de pagamento não sejam persistidos/expostos em `apps/api/test/payment-security.e2e-spec.ts`
  - Objetivo: Provar ausência de cartão sensível, secrets e credenciais no banco/logs. Arquivos prováveis: `apps/api/test/payment-security.e2e-spec.ts`, `packages/test-utils/src/assert-no-sensitive-payment-data.ts`. Critério de aceite: buscas por número completo de cartão, CVV, `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`, senhas e payload bruto sensível falham em tabelas permitidas, logs e respostas administrativas. Teste obrigatório: payment security integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run payment-security`

## FASE 8: Webhooks Asaas

- [ ] T078 [US4] Criar WebhooksModule em `apps/api/src/webhooks/webhooks.module.ts`
  - Objetivo: Base modular para webhooks externos. Arquivos prováveis: `apps/api/src/webhooks/*`. Critério de aceite: módulo registra controller/service. Teste obrigatório: module bootstrap. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run webhooks-module`
- [ ] T079 [US4] Criar endpoint POST `/webhooks/asaas` em `apps/api/src/webhooks/asaas.controller.ts`
  - Objetivo: Receber eventos Asaas. Arquivos prováveis: `apps/api/src/webhooks/asaas.controller.ts`. Critério de aceite: endpoint retorna 202 para evento válido. Teste obrigatório: webhook integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run asaas-webhook-endpoint`
- [ ] T080 [US4] Validar token/segurança do webhook em `apps/api/src/webhooks/asaas-webhook.guard.ts`
  - Objetivo: Rejeitar eventos não autenticados. Arquivos prováveis: `apps/api/src/webhooks/asaas-webhook.guard.ts`. Critério de aceite: token inválido retorna 401 e não persiste evento. Teste obrigatório: webhook security integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run asaas-webhook-security`
- [ ] T081 [US4] Salvar evento em `external_webhook_events` via `apps/api/src/webhooks/webhook-events.repository.ts`
  - Objetivo: Auditar evento recebido. Arquivos prováveis: `apps/api/src/webhooks/webhook-events.repository.ts`. Critério de aceite: evento salvo com idempotencyKey/status. Teste obrigatório: event persistence integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run webhook-event-persistence`
- [ ] T082 [US4] Garantir idempotência por chave canônica em `apps/api/src/webhooks/webhook-idempotency.service.ts`
  - Objetivo: Impedir duplicidade no intake. Arquivos prováveis: `apps/api/src/webhooks/webhook-idempotency.service.ts`. Critério de aceite: `provider + externalEventId` repetido vira no-op seguro; quando `externalEventId` não existir, fallback determinístico usa campos estáveis do payload seguro. Teste obrigatório: duplicate intake integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run webhook-idempotency`
- [ ] T083 [US4] Publicar job na fila `asaas-webhook-events` em `apps/api/src/webhooks/webhook-queue.service.ts`
  - Objetivo: Enfileirar processamento assíncrono. Arquivos prováveis: `apps/api/src/webhooks/webhook-queue.service.ts`, `packages/schemas/src/webhook.ts`. Critério de aceite: evento válido gera job uma vez. Teste obrigatório: queue publish integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run webhook-queue`
- [ ] T084 [US4] Criar testes de integração para webhook em `apps/api/test/asaas-webhook.e2e-spec.ts`
  - Objetivo: Cobrir recebimento completo. Arquivos prováveis: `apps/api/test/asaas-webhook.e2e-spec.ts`. Critério de aceite: evento válido salva e enfileira. Teste obrigatório: webhook integration suite. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run asaas-webhook`
- [ ] T085 [US4] Criar testes para webhook duplicado em `apps/api/test/asaas-webhook-duplicate.e2e-spec.ts`
  - Objetivo: Provar no-op idempotente. Arquivos prováveis: `apps/api/test/asaas-webhook-duplicate.e2e-spec.ts`. Critério de aceite: duplicate não cria job/efeito duplicado. Teste obrigatório: duplicate webhook suite. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run asaas-webhook-duplicate`
- [ ] T086 [US4] Criar documentação do fluxo Asaas em `docs/payment-asaas-flow.md`
  - Objetivo: Documentar Pix, cartão, webhook, idempotência e segurança. Arquivos prováveis: `docs/payment-asaas-flow.md`. Critério de aceite: doc cobre provider, secrets, safe data e filas. Teste obrigatório: docs payment completeness. Comando para validar: `pnpm test:unit -- --run docs-payment`

## FASE 9: Worker e filas

- [ ] T087 [US4] Configurar BullMQ em `packages/config/src/bullmq.ts`
  - Objetivo: Centralizar nomes e opções de filas. Arquivos prováveis: `packages/config/src/bullmq.ts`, `packages/schemas/src/jobs.ts`. Critério de aceite: filas `asaas-webhook-events`, `order-paid`, `grant-access`, `send-email` exportadas. Teste obrigatório: queue config unit. Comando para validar: `pnpm --filter @kiwifyclone/config test:unit -- --run bullmq-config`
- [ ] T088 [US4] Configurar Redis em `apps/api/src/queues/redis.ts`
  - Objetivo: Criar conexão por `REDIS_URL`. Arquivos prováveis: `apps/api/src/queues/redis.ts`, `apps/worker/src/queues/redis.ts`. Critério de aceite: API e worker compartilham configuração. Teste obrigatório: Redis config unit. Comando para validar: `pnpm test:unit -- --run redis-config`
- [ ] T089 [US4] Criar worker NestJS em `apps/worker/src/main.ts`
  - Objetivo: Bootstrap de processadores. Arquivos prováveis: `apps/worker/src/main.ts`, `apps/worker/src/worker.module.ts`. Critério de aceite: worker inicia sem endpoint público obrigatório. Teste obrigatório: worker bootstrap. Comando para validar: `pnpm --filter @kiwifyclone/worker test:unit -- --run bootstrap`
- [ ] T090 [US4] Criar ProcessAsaasWebhookProcessor em `apps/worker/src/processors/process-asaas-webhook.processor.ts`
  - Objetivo: Consumir evento Asaas persistido. Arquivos prováveis: `apps/worker/src/processors/process-asaas-webhook.processor.ts`. Critério de aceite: mapeia evento para ações internas. Teste obrigatório: processor unit. Comando para validar: `pnpm --filter @kiwifyclone/worker test:unit -- --run process-asaas-webhook`
- [ ] T091 [US3] Criar OrderPaidProcessor em `apps/worker/src/processors/order-paid.processor.ts`
  - Objetivo: Processar pedido pago. Arquivos prováveis: `apps/worker/src/processors/order-paid.processor.ts`. Critério de aceite: pedido paid dispara grant-access. Teste obrigatório: processor unit. Comando para validar: `pnpm --filter @kiwifyclone/worker test:unit -- --run order-paid-processor`
- [ ] T092 [US3] Criar GrantAccessProcessor em `apps/worker/src/processors/grant-access.processor.ts`
  - Objetivo: Criar enrollment ativo. Arquivos prováveis: `apps/worker/src/processors/grant-access.processor.ts`. Critério de aceite: cria acesso se não existir. Teste obrigatório: processor unit. Comando para validar: `pnpm --filter @kiwifyclone/worker test:unit -- --run grant-access-processor`
- [ ] T093 [US3] Criar SendEmailProcessor fake/log em `apps/worker/src/processors/send-email.processor.ts`
  - Objetivo: Simular email com JobLog. Arquivos prováveis: `apps/worker/src/processors/send-email.processor.ts`. Critério de aceite: cria log sem enviar email real. Teste obrigatório: processor unit. Comando para validar: `pnpm --filter @kiwifyclone/worker test:unit -- --run send-email-processor`
- [ ] T094 [US3] Criar regra pagamento aprovado muda pedido para paid em `apps/worker/src/services/payment-event-handler.ts`
  - Objetivo: Atualizar estado do pedido. Arquivos prováveis: `apps/worker/src/services/payment-event-handler.ts`. Critério de aceite: approved => paid uma vez. Teste obrigatório: state transition integration. Comando para validar: `pnpm --filter @kiwifyclone/worker test:integration -- --run payment-approved`
- [ ] T095 [US3] Criar regra pedido paid cria enrollment em `apps/worker/src/services/enrollment-grant.service.ts`
  - Objetivo: Liberar acesso comprado. Arquivos prováveis: `apps/worker/src/services/enrollment-grant.service.ts`. Critério de aceite: paid order gera enrollment active. Teste obrigatório: enrollment grant integration. Comando para validar: `pnpm --filter @kiwifyclone/worker test:integration -- --run enrollment-grant`
- [ ] T096 [US3] Criar regra enrollment não duplica em `apps/worker/src/services/enrollment-grant.service.ts`
  - Objetivo: Garantir idempotência de acesso. Arquivos prováveis: `apps/worker/src/services/enrollment-grant.service.ts`, `packages/database/src/schema/enrollments.ts`. Critério de aceite: duas execuções criam um enrollment. Teste obrigatório: duplicate enrollment integration. Comando para validar: `pnpm --filter @kiwifyclone/worker test:integration -- --run enrollment-idempotency`
- [ ] T097 [US4] Criar logs de jobs em `apps/worker/src/jobs/job-log.service.ts`
  - Objetivo: Registrar tentativas e resultados. Arquivos prováveis: `apps/worker/src/jobs/job-log.service.ts`. Critério de aceite: sucesso/falha/skipped persistem. Teste obrigatório: job log unit/integration. Comando para validar: `pnpm --filter @kiwifyclone/worker test:integration -- --run job-logs`
- [ ] T098 [US4] Criar testes unitários dos processors em `apps/worker/src/processors/*.spec.ts`
  - Objetivo: Cobrir processadores isolados. Arquivos prováveis: `apps/worker/src/processors/*.spec.ts`. Critério de aceite: todos os processors têm unit tests. Teste obrigatório: worker unit suite. Comando para validar: `pnpm --filter @kiwifyclone/worker test:unit`
- [ ] T099 [US4] Criar testes de integração com fila fake ou Redis de teste em `apps/worker/test/queues.e2e-spec.ts`
  - Objetivo: Cobrir processamento end-to-end de filas. Arquivos prováveis: `apps/worker/test/queues.e2e-spec.ts`. Critério de aceite: job publicado é processado e logado. Teste obrigatório: worker queue integration. Comando para validar: `pnpm --filter @kiwifyclone/worker test:integration -- --run queues`

## FASE 10: Área de membros

- [ ] T100 [US3] Criar EnrollmentsModule em `apps/api/src/enrollments/enrollments.module.ts`
  - Objetivo: Expor regras de acesso. Arquivos prováveis: `apps/api/src/enrollments/*`. Critério de aceite: módulo consulta enrollment ativo. Teste obrigatório: module integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run enrollments-module`
- [ ] T101 [US3] Criar endpoint listar meus produtos comprados em `apps/api/src/members/members.controller.ts`
  - Objetivo: Listar biblioteca do comprador. Arquivos prováveis: `apps/api/src/members/members.controller.ts`. Critério de aceite: retorna produtos com status de matrícula. Teste obrigatório: members products integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run members-products`
- [ ] T102 [US3] Criar endpoint abrir produto comprado em `apps/api/src/members/members.controller.ts`
  - Objetivo: Exibir módulos/aulas de produto comprado. Arquivos prováveis: `apps/api/src/members/members.controller.ts`. Critério de aceite: só enrollment ativo acessa conteúdo. Teste obrigatório: member product integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run member-product`
- [ ] T103 [US3] Criar endpoint abrir aula comprada em `apps/api/src/members/lessons.controller.ts`
  - Objetivo: Entregar conteúdo da aula autorizada. Arquivos prováveis: `apps/api/src/members/lessons.controller.ts`. Critério de aceite: retorna texto/url somente com acesso ativo. Teste obrigatório: member lesson integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run member-lesson`
- [ ] T104 [US3] Bloquear acesso sem matrícula ativa em `apps/api/src/members/enrollment.guard.ts`
  - Objetivo: Proteger aulas/produtos. Arquivos prováveis: `apps/api/src/members/enrollment.guard.ts`. Critério de aceite: usuário sem acesso recebe 403. Teste obrigatório: access denied integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run enrollment-guard`
- [ ] T105 [US3] Criar frontend members em `apps/members`
  - Objetivo: App Next.js de área de membros. Arquivos prováveis: `apps/members/app/layout.tsx`, `apps/members/app/page.tsx`. Critério de aceite: app builda e usa auth helper. Teste obrigatório: app build/test. Comando para validar: `pnpm --filter @kiwifyclone/members build && pnpm --filter @kiwifyclone/members test:unit`
- [ ] T106 [US3] Criar tela de biblioteca em `apps/members/app/library/page.tsx`
  - Objetivo: Listar produtos comprados. Arquivos prováveis: `apps/members/app/library/page.tsx`. Critério de aceite: mostra produtos ativos/pendentes do comprador. Teste obrigatório: Playwright library. Comando para validar: `pnpm test:e2e -- --grep \"members library\"`
- [ ] T107 [US3] Criar tela de produto comprado em `apps/members/app/products/[productId]/page.tsx`
  - Objetivo: Mostrar módulos e aulas. Arquivos prováveis: `apps/members/app/products/[productId]/page.tsx`. Critério de aceite: exibe conteúdo autorizado e status. Teste obrigatório: Playwright member product. Comando para validar: `pnpm test:e2e -- --grep \"member product\"`
- [ ] T108 [US3] Criar tela de aula em `apps/members/app/lessons/[lessonId]/page.tsx`
  - Objetivo: Exibir aula autorizada. Arquivos prováveis: `apps/members/app/lessons/[lessonId]/page.tsx`. Critério de aceite: mostra texto ou vídeo conforme tipo. Teste obrigatório: Playwright lesson access. Comando para validar: `pnpm test:e2e -- --grep \"lesson access\"`
- [ ] T109 [US3] Criar testes de autorização em `apps/api/test/members-authz.e2e-spec.ts`
  - Objetivo: Validar bloqueio sem matrícula. Arquivos prováveis: `apps/api/test/members-authz.e2e-spec.ts`, `tests/e2e/members-authz.spec.ts`. Critério de aceite: sem compra não acessa aula. Teste obrigatório: authz integration/e2e. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run members-authz && pnpm test:e2e -- --grep \"without purchase\"`

## FASE 11: Admin da plataforma

- [ ] T110 [US5] Criar AdminModule em `apps/api/src/admin/admin.module.ts`
  - Objetivo: Base administrativa da plataforma. Arquivos prováveis: `apps/api/src/admin/*`. Critério de aceite: módulo exige platform_admin para endpoints globais. Teste obrigatório: admin module integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run admin-module`
- [ ] T111 [US5] Criar endpoint listar usuários em `apps/api/src/admin/admin-users.controller.ts`
  - Objetivo: Visão de usuários para admin. Arquivos prováveis: `apps/api/src/admin/admin-users.controller.ts`. Critério de aceite: platform_admin lista usuários; producer não lista todos. Teste obrigatório: admin users integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run admin-users`
- [ ] T112 [US5] Criar endpoint listar produtos em `apps/api/src/admin/admin-products.controller.ts`
  - Objetivo: Visão global de produtos. Arquivos prováveis: `apps/api/src/admin/admin-products.controller.ts`. Critério de aceite: platform_admin vê todos. Teste obrigatório: admin products integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run admin-products`
- [ ] T113 [US5] Criar endpoint listar pedidos em `apps/api/src/admin/admin-orders.controller.ts`
  - Objetivo: Visão global de pedidos. Arquivos prováveis: `apps/api/src/admin/admin-orders.controller.ts`. Critério de aceite: inclui status e filtros básicos. Teste obrigatório: admin orders integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run admin-orders`
- [ ] T114 [US5] Criar endpoint listar pagamentos em `apps/api/src/admin/admin-payments.controller.ts`
  - Objetivo: Visão global de pagamentos seguros. Arquivos prováveis: `apps/api/src/admin/admin-payments.controller.ts`. Critério de aceite: não expõe cartão sensível. Teste obrigatório: admin payments integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run admin-payments`
- [ ] T115 [US5] Criar endpoint listar eventos Asaas em `apps/api/src/admin/admin-webhook-events.controller.ts`
  - Objetivo: Auditar eventos recebidos. Arquivos prováveis: `apps/api/src/admin/admin-webhook-events.controller.ts`. Critério de aceite: lista status e idempotencyKey sem secrets. Teste obrigatório: admin events integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run admin-webhook-events`
- [ ] T116 [US5] Criar dashboard simples em `apps/admin/app/page.tsx`
  - Objetivo: Entrada do admin. Arquivos prováveis: `apps/admin/app/page.tsx`, `apps/admin/components/dashboard.tsx`. Critério de aceite: links para usuários, produtos, pedidos, pagamentos e eventos. Teste obrigatório: Playwright admin dashboard. Comando para validar: `pnpm test:e2e -- --grep \"admin dashboard\"`
- [ ] T117 [US5] Criar tabelas com TanStack Table em `apps/admin/components/data-table.tsx`
  - Objetivo: Tabelas reutilizáveis para admin. Arquivos prováveis: `apps/admin/components/data-table.tsx`, `apps/admin/app/admin/*/page.tsx`. Critério de aceite: tabelas renderizam colunas e dados básicos. Teste obrigatório: component unit. Comando para validar: `pnpm --filter @kiwifyclone/admin test:unit -- --run data-table`
- [ ] T118 [US5] Criar testes de autorização platform_admin em `apps/api/test/platform-admin-authz.e2e-spec.ts`
  - Objetivo: Garantir acesso restrito ao admin global. Arquivos prováveis: `apps/api/test/platform-admin-authz.e2e-spec.ts`. Critério de aceite: buyer/producer recebem 403, platform_admin recebe 200. Teste obrigatório: platform admin authz integration. Comando para validar: `pnpm --filter @kiwifyclone/api test:integration -- --run platform-admin-authz`

## FASE 12: E2E

- [ ] T119 [P] Criar testes Playwright para fluxo público em `tests/e2e/public-product.spec.ts`
  - Objetivo: Validar produto público ativo/inativo. Arquivos prováveis: `tests/e2e/public-product.spec.ts`. Critério de aceite: ativo aparece, inativo não compra. Teste obrigatório: E2E público. Comando para validar: `pnpm test:e2e -- --grep \"public product\"`
- [ ] T120 [P] Criar testes Playwright para checkout Pix fake em `tests/e2e/checkout-pix.spec.ts`
  - Objetivo: Validar compra Pix com provider fake. Arquivos prováveis: `tests/e2e/checkout-pix.spec.ts`. Critério de aceite: pedido pending e instruções Pix aparecem. Teste obrigatório: E2E Pix. Comando para validar: `pnpm test:e2e -- --grep \"checkout pix\"`
- [ ] T121 [P] Criar testes Playwright para checkout cartão fake em `tests/e2e/checkout-card.spec.ts`
  - Objetivo: Validar compra cartão com provider fake. Arquivos prováveis: `tests/e2e/checkout-card.spec.ts`. Critério de aceite: pagamento processa sem persistir cartão sensível. Teste obrigatório: E2E cartão. Comando para validar: `pnpm test:e2e -- --grep \"checkout card\"`
- [ ] T122 Criar teste E2E completo compra-acesso em `tests/e2e/purchase-access.spec.ts`
  - Objetivo: Cobrir produtor cria produto/módulo/aula/oferta, comprador compra, pagamento aprova, worker libera, comprador acessa aula. Arquivos prováveis: `tests/e2e/purchase-access.spec.ts`. Critério de aceite: fluxo completo passa de ponta a ponta. Teste obrigatório: E2E completo. Comando para validar: `pnpm test:e2e -- --grep \"purchase access\"`
- [ ] T123 Criar teste E2E de bloqueio sem compra em `tests/e2e/access-block.spec.ts`
  - Objetivo: Garantir bloqueio de aula sem matrícula. Arquivos prováveis: `tests/e2e/access-block.spec.ts`. Critério de aceite: usuário sem compra recebe bloqueio. Teste obrigatório: E2E bloqueio. Comando para validar: `pnpm test:e2e -- --grep \"without purchase\"`
- [ ] T124 Adicionar E2E ao GitHub Actions em `.github/workflows/ci.yml`
  - Objetivo: Rodar Playwright no CI. Arquivos prováveis: `.github/workflows/ci.yml`, `playwright.config.ts`. Critério de aceite: CI executa `pnpm test:e2e` após setup. Teste obrigatório: workflow validation. Comando para validar: `pnpm test:unit -- --run ci-workflow && pnpm test:e2e`

## FASE 13: Preparação final de MVP

- [ ] T125 Revisar `.env.example`
  - Objetivo: Garantir variáveis obrigatórias e comentários seguros. Arquivos prováveis: `.env.example`. Critério de aceite: todas as variáveis da constitution presentes, sem secrets reais. Teste obrigatório: env example validation. Comando para validar: `pnpm test:unit -- --run env-example`
- [ ] T126 Revisar documentação em `docs/`
  - Objetivo: Garantir docs obrigatórios completos. Arquivos prováveis: `docs/*.md`. Critério de aceite: visão, arquitetura, dados, Asaas, deploy, Git Flow e testes cobertos. Teste obrigatório: docs completeness. Comando para validar: `pnpm test:unit -- --run docs-required`
- [ ] T127 Revisar scripts em `package.json`
  - Objetivo: Garantir scripts raiz e por workspace. Arquivos prováveis: `package.json`, `apps/*/package.json`, `packages/*/package.json`. Critério de aceite: scripts obrigatórios executam pelo turbo. Teste obrigatório: scripts validation. Comando para validar: `pnpm run ci`
- [ ] T128 Revisar CI em `.github/workflows/ci.yml`
  - Objetivo: Garantir gates antes de merge. Arquivos prováveis: `.github/workflows/ci.yml`. Critério de aceite: install, lint, typecheck, tests e builds opcionais configurados. Teste obrigatório: CI workflow unit. Comando para validar: `pnpm test:unit -- --run ci-workflow`
- [ ] T129 Revisar Dockerfiles em `apps/api/Dockerfile` e `apps/worker/Dockerfile`
  - Objetivo: Garantir builds Dokploy separados. Arquivos prováveis: `apps/api/Dockerfile`, `apps/worker/Dockerfile`. Critério de aceite: API e worker buildam separadamente. Teste obrigatório: docker build. Comando para validar: `docker build -f apps/api/Dockerfile . && docker build -f apps/worker/Dockerfile .`
- [ ] T130 Revisar Vercel config em `apps/*/vercel.json`
  - Objetivo: Garantir quatro frontends deployáveis. Arquivos prováveis: `apps/products/vercel.json`, `apps/checkout/vercel.json`, `apps/members/vercel.json`, `apps/admin/vercel.json`. Critério de aceite: root/build/env seguros. Teste obrigatório: vercel config validation. Comando para validar: `pnpm test:unit -- --run vercel-config`
- [ ] T131 Revisar Dokploy config em `docs/deploy-vercel-dokploy.md`
  - Objetivo: Garantir build paths e serviços separados documentados. Arquivos prováveis: `docs/deploy-vercel-dokploy.md`, `apps/api/Dockerfile`, `apps/worker/Dockerfile`. Critério de aceite: API e worker têm instruções separadas. Teste obrigatório: docs deploy validation. Comando para validar: `pnpm test:unit -- --run docs-deploy`
- [ ] T132 Criar checklist de produção em `docs/production-checklist.md`
  - Objetivo: Preparar release MVP. Arquivos prováveis: `docs/production-checklist.md`. Critério de aceite: inclui env, CI, migrations, deploy, webhook, rollback e smoke tests. Teste obrigatório: checklist docs validation. Comando para validar: `pnpm test:unit -- --run production-checklist`
- [ ] T133 Criar README com passo a passo local em `README.md`
  - Objetivo: Documentar setup local. Arquivos prováveis: `README.md`. Critério de aceite: cobre pnpm, docker compose, env, migrations, dev, testes. Teste obrigatório: README validation. Comando para validar: `pnpm test:unit -- --run readme`
- [ ] T134 Garantir `pnpm run ci` passando no monorepo em `package.json`
  - Objetivo: Validar comando final de CI local. Arquivos prováveis: `package.json`, `turbo.json`. Critério de aceite: `pnpm run ci` roda lint, typecheck, unit, integration e e2e. Teste obrigatório: CI local completo. Comando para validar: `pnpm run ci`
- [ ] T135 Garantir que nenhuma task crítica fique sem teste em `specs/001-infoproduct-platform/tasks.md`
  - Objetivo: Auditar a própria lista de tasks. Arquivos prováveis: `specs/001-infoproduct-platform/tasks.md`, `packages/test-utils/src/task-audit.ts`. Critério de aceite: toda task possui Teste obrigatório e Comando para validar. Teste obrigatório: task audit. Comando para validar: `pnpm test:unit -- --run task-audit`

## Dependencies & Execution Order

### Phase Dependencies

- FASE 1 blocks all other work.
- FASE 2 depends on FASE 1 scripts, apps, and docs structure.
- FASE 3 depends on FASE 1 and blocks auth, products, checkout, webhooks, worker, members, and admin data flows.
- FASE 4 depends on FASE 3 user tables and blocks protected app/API features.
- FASE 5 depends on FASE 4 and unlocks public product/catalog and producer admin.
- FASE 6 depends on FASE 3 and FASE 4 and unlocks payment use cases.
- FASE 7 depends on FASE 5 and FASE 6.
- FASE 8 depends on FASE 6 and FASE 7.
- FASE 9 depends on FASE 8 and FASE 3.
- FASE 10 depends on FASE 9 payment/access grants.
- FASE 11 depends on FASE 3, FASE 4, FASE 5, FASE 7, and FASE 8.
- FASE 12 depends on FASES 5 through 11.
- FASE 13 depends on all prior phases.

### User Story Mapping

- US1 Produtor publica produto vendável: T046-T054.
- US2 Comprador realiza checkout com Pix ou cartão: T055-T077.
- US3 Pagamento aprovado libera acesso na área de membros: T091-T096 and T100-T109.
- US4 Webhooks de pagamento são auditáveis e idempotentes: T078-T090 and T097-T099.
- US5 Admin acompanha operação da plataforma: T110-T118.
- US6 Operação local, staging e production é documentada: T001-T018 and T125-T135.

### MVP Scope

The strict MVP requires FASES 1, 3, 4, 5, 6, 7, 8, 9, and 10 for a full sale-to-access loop. FASE 11 is required for platform administration visibility, and FASE 12/13 harden release readiness.

## Parallel Opportunities

- T013-T015 can run after FASE 1 because Vercel/Docker configs touch separate files.
- T024-T039 can be split by schema file after T019-T023.
- T055-T064 can run in parallel with checkout UI work after FASE 5 data contracts are stable.
- T078-T086 can run in parallel with T087-T099 once queue contracts are agreed.
- T100-T109 and T110-T118 can run in parallel after payment/access state is stable.
- T119-T121 can run in parallel before full E2E T122.

## Parallel Examples

```bash
Task: "T024 users schema"
Task: "T027 products schema"
Task: "T033 payments schema"
Task: "T037 external webhook events schema"
```

```bash
Task: "T119 public product E2E"
Task: "T120 checkout Pix E2E"
Task: "T121 checkout card E2E"
```

## Implementation Strategy

1. Complete FASE 1 and validate `pnpm run ci` scaffolding.
2. Complete database/auth/product foundations before checkout.
3. Implement Asaas provider abstraction and fake provider before checkout UI.
4. Implement webhook intake and worker idempotency before treating payment approval as complete.
5. Implement members access only after enrollment creation is idempotent.
6. Add admin visibility, E2E, and final production readiness checks.

## Completion Rule

No task may be marked complete unless its required automated test and validation command pass. Critical tasks that touch payments, access, auth, deploy, environment variables, or docs must include regression coverage before merge.
