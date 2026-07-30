# Referência da API

A API publica documentação interativa dos endpoints disponíveis no runtime atual:

- Scalar: `http://localhost:3001/docs`
- OpenAPI 3.1 JSON: `http://localhost:3001/openapi.json`

Execute `pnpm dev` na raiz do projeto e abra a página do Scalar no navegador. O JavaScript da interface é carregado pelo CDN oficial do pacote `@scalar/api-reference`, portanto a primeira abertura requer acesso à internet.

Os endpoints protegidos usam o header `x-kiwifyclone-session`. Seu valor é uma sessão JSON codificada em base64url e pode ser gerado com `createAuthSession` e `serializeAuthSession`, exportados por `@kiwifyclone/auth`.

Esta referência descreve somente as rotas já implementadas. O contrato completo de planejamento, incluindo endpoints de fases futuras, está em `specs/001-infoproduct-platform/contracts/openapi.yaml`.
