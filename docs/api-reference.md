# Referência da API

A API publica documentação interativa dos endpoints disponíveis no runtime atual:

- Scalar: `http://localhost:3001/docs`
- OpenAPI 3.1 JSON: `http://localhost:3001/openapi.json`

Execute `pnpm dev` na raiz do projeto e abra a página do Scalar no navegador. O JavaScript da interface é carregado pelo CDN oficial do pacote `@scalar/api-reference`, portanto a primeira abertura requer acesso à internet.

Os endpoints protegidos usam o header `x-kiwifyclone-session`. Seu valor é uma sessão JSON codificada em base64url e pode ser gerado com `createAuthSession` e `serializeAuthSession`, exportados por `@kiwifyclone/auth`.

Esta referência descreve somente as rotas já implementadas. O contrato completo de planejamento, incluindo endpoints de fases futuras, está em `specs/001-infoproduct-platform/contracts/openapi.yaml`.

## Checkout

A Fase 7 publica o fluxo em etapas:

1. `GET /checkout/offers/{offerId}` valida e apresenta a oferta.
2. `POST /checkout/orders` cria o pedido pendente e preserva o snapshot comercial.
3. `POST /checkout/orders/{orderId}/payments/pix` cria a cobrança Pix.
4. `POST /checkout/orders/{orderId}/payments/credit-card` processa o cartão sem persistir os dados transitórios.
5. `GET /checkout/orders/{orderId}` consulta os status atuais.

Em `ASAAS_ENVIRONMENT=local-fake`, o fluxo usa o provider fake. Sandbox e produção usam `AsaasPaymentProvider` por meio da mesma abstração.
