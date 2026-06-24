# Feature Specification: Plataforma MVP de Infoprodutos

**Feature Branch**: `001-infoproduct-platform`  
**Created**: 2026-06-24  
**Status**: Draft  
**Input**: User description: "Criar um MVP de plataforma de venda de infoprodutos inspirada em Kiwify/Hotmart, com criação de produtos digitais, ofertas, checkout com Asaas, webhooks idempotentes, worker assíncrono, área de membros e administração da plataforma."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Produtor publica produto vendável (Priority: P1)

Um produtor autenticado cria um produto digital, organiza módulos e aulas, cria
uma oferta com preço e métodos de pagamento permitidos, e deixa o produto pronto
para venda pública.

**Why this priority**: Sem produto ativo, conteúdo e oferta ativa não existe
catálogo nem checkout para o MVP.

**Independent Test**: Criar um produtor, produto, módulo, aula e oferta ativa;
confirmar que a página pública exibe somente o produto/oferta ativos e oculta
itens inativos.

**Acceptance Scenarios**:

1. **Given** um produtor autenticado, **When** ele cria produto, módulo, aula e
   oferta válida, **Then** o produto fica disponível para publicação quando seu
   status e a oferta estiverem ativos.
2. **Given** um produto inativo ou sem oferta ativa, **When** a página pública é
   consultada, **Then** o produto não aparece como comprável.
3. **Given** uma oferta inativa, **When** um comprador tenta iniciar checkout,
   **Then** a compra é bloqueada com uma mensagem clara.

---

### User Story 2 - Comprador realiza checkout com Pix ou cartão (Priority: P1)

Um comprador acessa uma oferta pública ativa, informa seus dados, escolhe Pix ou
cartão de crédito, cria um pedido e recebe o status inicial do pagamento.

**Why this priority**: A venda é o fluxo central do MVP e valida a proposta de
valor da plataforma.

**Independent Test**: Comprar uma oferta ativa com Pix e com cartão em modo de
teste, verificando criação de pedido, cobrança externa, dados seguros persistidos
e ausência de dados sensíveis de cartão.

**Acceptance Scenarios**:

1. **Given** uma oferta ativa com Pix permitido, **When** o comprador finaliza o
   checkout por Pix, **Then** um pedido é criado, uma cobrança é solicitada e os
   dados de pagamento retornados para Pix são exibidos quando disponíveis.
2. **Given** uma oferta ativa com cartão permitido, **When** o comprador finaliza
   o checkout por cartão, **Then** o pagamento é processado sem persistir dados
   sensíveis de cartão no sistema.
3. **Given** uma oferta que não permite o método escolhido, **When** o comprador
   tenta pagar, **Then** o pedido não é confirmado e o comprador vê a restrição.

---

### User Story 3 - Pagamento aprovado libera acesso na área de membros (Priority: P1)

Após confirmação de pagamento, o sistema libera acesso ao produto comprado para o
comprador e permite que ele visualize módulos e aulas na área de membros.

**Why this priority**: A entrega do acesso comprado fecha o ciclo mínimo de venda
e consumo do infoproduto.

**Independent Test**: Confirmar um pagamento, processar o evento assíncrono,
verificar criação de matrícula/acesso e validar que outro usuário sem matrícula
não acessa a aula.

**Acceptance Scenarios**:

1. **Given** um pedido aguardando pagamento, **When** o pagamento é aprovado,
   **Then** o pedido vira pago e o comprador recebe matrícula ativa no produto.
2. **Given** um comprador com matrícula ativa, **When** ele abre a área de
   membros, **Then** visualiza o produto comprado, seus módulos e aulas.
3. **Given** um usuário sem compra aprovada, **When** ele tenta acessar uma aula,
   **Then** o acesso é bloqueado.
4. **Given** um pagamento pendente, **When** o comprador acessa a área de membros,
   **Then** o produto aparece com status pendente ou não liberado.

---

### User Story 4 - Webhooks de pagamento são auditáveis e idempotentes (Priority: P1)

O sistema recebe eventos externos de pagamento, registra cada evento para
auditoria, processa o evento de forma assíncrona e evita efeitos duplicados.

**Why this priority**: Confirmações de pagamento dependem de eventos externos; o
MVP precisa ser resiliente a duplicidade, atraso e reenvio.

**Independent Test**: Enviar o mesmo evento de pagamento aprovado mais de uma
vez, confirmar que há registro auditável e que somente um pedido pago e uma
matrícula/acesso são efetivados.

**Acceptance Scenarios**:

1. **Given** um webhook válido de pagamento aprovado, **When** a API recebe o
   evento, **Then** o evento é salvo, enfileirado e processado pelo worker.
2. **Given** um webhook duplicado, **When** o worker processa o evento, **Then**
   nenhum pedido pago, matrícula ou acesso duplicado é criado.
3. **Given** um webhook inválido ou sem mecanismo de segurança válido, **When** a
   API recebe o evento, **Then** nenhum efeito de negócio é executado.
4. **Given** um evento de pagamento recusado, **When** o worker processa o evento,
   **Then** o pedido e o pagamento refletem o status recusado.

---

### User Story 5 - Admin acompanha operação da plataforma (Priority: P2)

Um admin da plataforma visualiza usuários, produtos, pedidos, pagamentos e
eventos de pagamento para acompanhar a operação e dar suporte.

**Why this priority**: A administração não é o fluxo de venda principal, mas é
necessária para suporte, auditoria e operação do MVP.

**Independent Test**: Acessar a administração como admin da plataforma e
visualizar listas filtráveis de usuários, produtos, pedidos, pagamentos e eventos.

**Acceptance Scenarios**:

1. **Given** um admin autenticado, **When** ele abre o painel administrativo,
   **Then** visualiza usuários, produtos, pedidos, pagamentos e eventos recebidos.
2. **Given** um produtor autenticado, **When** ele acessa a administração,
   **Then** visualiza e gerencia seus próprios produtos, módulos, aulas, ofertas,
   pedidos e pagamentos permitidos.
3. **Given** um usuário sem permissão administrativa, **When** ele tenta acessar
   telas de admin, **Then** o acesso é negado.

---

### User Story 6 - Operação local, staging e production é documentada (Priority: P2)

Um desenvolvedor ou operador configura ambientes, variáveis e documentação para
rodar, testar e publicar o MVP com segurança.

**Why this priority**: O MVP precisa sair do ambiente local sem depender de
conhecimento privado ou configuração implícita.

**Independent Test**: Validar que as variáveis obrigatórias estão documentadas,
que há documentação mínima em `/docs` e que deploy só é permitido após validações
obrigatórias passarem.

**Acceptance Scenarios**:

1. **Given** uma nova instalação local, **When** o desenvolvedor consulta o
   exemplo de ambiente, **Then** encontra todas as variáveis obrigatórias.
2. **Given** uma mudança pronta para publicação, **When** lint, typecheck ou
   testes obrigatórios falham, **Then** o deploy é bloqueado.
3. **Given** a necessidade de publicar o MVP, **When** a documentação é consultada,
   **Then** há guias para produto, arquitetura, dados, pagamento, deploy, decisões
   técnicas e testes.

### Edge Cases

- Produto inativo, oferta inativa ou método de pagamento não permitido bloqueia a
  compra.
- Comprador tenta acessar aula sem matrícula ativa.
- Webhook duplicado, fora de ordem ou inválido não cria efeitos duplicados.
- Pagamento pendente mantém pedido e acesso em estado aguardando confirmação.
- Pagamento recusado não libera matrícula/acesso.
- Falha temporária no processamento assíncrono mantém evento auditável para
  reprocessamento seguro.
- Cartão recusado mostra status de falha sem armazenar dados sensíveis.
- Dados de Pix ausentes no retorno deixam o pedido pendente e orientam o
  comprador com status claro.
- Usuário produtor não pode administrar produtos de outro produtor.
- Logs e telas administrativas não exibem tokens, senhas ou dados completos de
  cartão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir cadastro e login para produtor, comprador e admin da plataforma.
- **FR-002**: O sistema MUST permitir que um produtor crie e edite produtos digitais com título, slug, descrição, imagem opcional, status e produtor responsável.
- **FR-003**: O sistema MUST garantir que slugs públicos de produtos sejam únicos e usáveis em páginas públicas.
- **FR-004**: O sistema MUST permitir que um produtor crie, edite, ordene e visualize módulos vinculados a um produto.
- **FR-005**: O sistema MUST permitir que um produtor crie, edite, ordene e visualize aulas vinculadas a módulos.
- **FR-006**: Uma aula MUST conter título, descrição opcional, tipo de conteúdo, conteúdo em texto ou URL de vídeo e ordem.
- **FR-007**: O sistema MUST permitir que um produtor crie uma ou mais ofertas para um produto.
- **FR-008**: Uma oferta MUST conter nome, preço, status, métodos de pagamento permitidos e produto vinculado.
- **FR-009**: A página pública MUST exibir somente produtos ativos com ofertas ativas.
- **FR-010**: A página pública MUST exibir título, descrição, preço, imagem opcional e ação de compra para produto/oferta elegível.
- **FR-011**: O checkout MUST aceitar somente ofertas ativas e métodos de pagamento permitidos pela oferta.
- **FR-012**: O checkout MUST coletar os dados necessários do comprador para criar pedido e iniciar pagamento.
- **FR-013**: O checkout MUST criar um pedido antes de solicitar a cobrança externa.
- **FR-014**: O checkout MUST suportar pagamento por Pix no MVP.
- **FR-015**: O checkout MUST suportar pagamento por cartão de crédito no MVP.
- **FR-016**: O checkout MAY manter boleto preparado para fase futura, mas boleto MUST NOT ser apresentado como método entregue no MVP.
- **FR-017**: O sistema MUST criar ou localizar o cliente correspondente no provedor de pagamento antes ou durante a criação da cobrança.
- **FR-018**: O sistema MUST criar uma cobrança externa para cada tentativa de pagamento elegível.
- **FR-019**: O checkout MUST exibir o status inicial do pagamento ao comprador.
- **FR-020**: Para Pix, o checkout MUST exibir QR Code, payload ou instrução equivalente quando essas informações forem retornadas.
- **FR-021**: Para cartão, o sistema MUST processar o pagamento sem persistir dados sensíveis de cartão.
- **FR-022**: O sistema MUST persistir apenas IDs externos, status, método, valor, timestamps e metadados seguros de pagamento.
- **FR-023**: O sistema MUST evitar copiar marca, layout, texto proprietário ou código de terceiros.
- **FR-024**: Recursos de pagamento MUST usar Asaas por meio de `PaymentProvider` e `AsaasPaymentProvider`.
- **FR-025**: O domínio MUST depender de uma abstração de pagamento e MUST NOT depender diretamente de detalhes do Asaas.
- **FR-026**: O sistema MUST oferecer modo sandbox/fake configurável para desenvolvimento local e testes.
- **FR-027**: A API MUST receber webhooks do Asaas e validar o mecanismo de segurança configurado antes de efeitos de negócio.
- **FR-028**: Cada evento externo recebido MUST ser salvo com dados suficientes para auditoria, rastreio, status de processamento e idempotência.
- **FR-029**: Cada evento externo válido MUST ser encaminhado para processamento assíncrono pelo worker.
- **FR-030**: O worker MUST processar eventos de pagamento aprovado, recusado e pendente.
- **FR-031**: Quando um pagamento for aprovado, o pedido MUST mudar para paid.
- **FR-032**: Quando um pedido ficar paid, o sistema MUST criar matrícula/acesso para o comprador.
- **FR-033**: O processamento de pagamento aprovado MUST ser idempotente.
- **FR-034**: Um webhook duplicado MUST NOT gerar pedido pago duplicado, matrícula duplicada ou acesso duplicado.
- **FR-035**: Quando um pagamento for recusado, pedido e pagamento MUST refletir o status recusado.
- **FR-036**: Quando um pagamento permanecer pendente, pedido e pagamento MUST continuar aguardando confirmação.
- **FR-037**: O worker MUST simular envio de email registrando log auditável do evento de comunicação.
- **FR-038**: A área de membros MUST listar produtos comprados pelo comprador autenticado.
- **FR-039**: A área de membros MUST permitir acesso a módulos e aulas de produtos com matrícula ativa.
- **FR-040**: A área de membros MUST bloquear acesso a aulas para usuários sem matrícula ativa.
- **FR-041**: A área de membros MUST exibir status claro para compras pendentes ou não liberadas.
- **FR-042**: O admin do produtor MUST permitir criação e gestão de produtos, módulos, aulas, ofertas, pedidos e pagamentos do próprio produtor.
- **FR-043**: O admin da plataforma MUST permitir visualização de usuários, produtos, pedidos, pagamentos e eventos externos de pagamento.
- **FR-044**: O sistema MUST aplicar permissões distintas para produtor, comprador e admin da plataforma.
- **FR-045**: Secrets MUST ser configurados por variáveis de ambiente e MUST NOT aparecer em logs ou interfaces.
- **FR-046**: Logs MUST NOT expor tokens, senhas, dados sensíveis de cartão, número completo de cartão, CVV ou detalhes completos de cartão.
- **FR-047**: Trabalho relacionado a deploy MUST cobrir código no GitHub, frontends na Vercel, API no Dokploy, worker no Dokploy e ambientes local/staging/production.
- **FR-048**: API e worker MUST ser tratados como serviços publicáveis separados.
- **FR-049**: Valores de conexão de PostgreSQL e Redis MUST ser fornecidos para API e worker via configuração de ambiente.
- **FR-050**: Deploy MUST ser bloqueado quando lint, typecheck ou testes automatizados obrigatórios falharem.
- **FR-051**: Features that add or require configuration MUST update `.env.example`.
- **FR-052**: `.env.example` MUST include `DATABASE_URL`, `REDIS_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ASAAS_API_KEY`, `ASAAS_BASE_URL`, `ASAAS_ENVIRONMENT`, `ASAAS_WEBHOOK_TOKEN`, and `NEXT_PUBLIC_API_URL`.
- **FR-053**: Features that change product behavior, architecture, data, payments, deploy, technical decisions, or tests MUST update `/docs`.
- **FR-054**: `/docs` MUST cover product vision, architecture, data model, Asaas payment flow, Vercel plus Dokploy deploy flow, technical decisions, and testing strategy.
- **FR-055**: Every critical action MUST have automated validation required for completion.
- **FR-056**: O MVP MUST permanecer preparado para adicionar ou trocar provedores de pagamento no futuro sem alterar comportamento central do domínio.

### Automated Validation *(mandatory)*

- **AV-001**: Unit/static validation MUST cover pricing, offer eligibility, access rules, payment status mapping, idempotency decisions, and required permission checks.
- **AV-002**: Integration validation MUST cover product/offer management, checkout order creation, payment initiation, webhook receipt, webhook security rejection, event persistence, and admin views.
- **AV-003**: E2E validation MUST cover a buyer finding an active product, completing checkout, reaching pending/approved status, and accessing purchased content after approval.
- **AV-004**: Payment validation MUST prove a duplicated approved webhook does not duplicate paid order state, enrollment, or access.
- **AV-005**: Deploy/config validation MUST prove required environment variables are documented and deploy gates fail when lint, typecheck, or required tests fail.

### Key Entities *(include if feature involves data)*

- **User**: Represents an authenticated platform user with role capabilities for producer, buyer, or platform admin.
- **ProducerProfile**: Represents the producer identity and ownership context for products and offers.
- **Product**: Represents a digital product with public metadata, status, slug, image reference, and producer ownership.
- **ProductModule**: Represents an ordered group of lessons inside a product.
- **ProductLesson**: Represents an ordered lesson with text or video content metadata.
- **Offer**: Represents a purchasable commercial configuration for a product, including price, status, and allowed payment methods.
- **CustomerProfile**: Represents buyer information needed for purchase, access, and payment provider customer matching.
- **Order**: Represents a buyer purchase attempt and its lifecycle from pending to paid, refused, or canceled.
- **OrderItem**: Represents the product/offer included in an order and the commercial values used at purchase time.
- **Payment**: Represents internal payment state, amount, method, status, safe metadata, and relationship to an order.
- **PaymentProviderCustomer**: Represents the mapping between an internal customer and the external payment provider customer identifier.
- **PaymentProviderCharge**: Represents the mapping between an internal payment and the external provider charge identifier plus safe status metadata.
- **Enrollment**: Represents the buyer's active or pending access to a purchased product.
- **ExternalWebhookEvent**: Represents a received external event with provider, external ID, payload reference or safe payload subset, processing status, and idempotency key.
- **DomainEvent**: Represents an internal business event emitted by the platform for workflows and audit.
- **JobLog**: Represents asynchronous processing attempts, outcomes, and simulated email events.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A producer can create a product, add one module, add one lesson, create an active offer, and see it publicly available in under 10 minutes.
- **SC-002**: A buyer can complete checkout for an active offer in under 3 minutes for each MVP payment method.
- **SC-003**: 100% of approved payment confirmations in the test suite result in exactly one paid order and exactly one active enrollment.
- **SC-004**: 100% of duplicate approved payment confirmations in the test suite produce no duplicate enrollment or access grant.
- **SC-005**: 100% of unauthorized lesson access attempts in the test suite are blocked.
- **SC-006**: 100% of inactive products and inactive offers in the test suite are unavailable for public purchase.
- **SC-007**: 100% of sensitive-card-data persistence checks in the test suite confirm that only safe payment metadata is stored.
- **SC-008**: Platform admins can locate a user's order, payment, and received payment event from administrative views in under 2 minutes.
- **SC-009**: A new developer can identify all required environment variables and required operational documents from the repository without private instructions.
- **SC-010**: Release attempts with failing mandatory checks are rejected before deployment.

## Assumptions

- O MVP será lançado como uma única plataforma multiusuário, com produtores e compradores compartilhando a mesma base de usuários.
- O comprador pode criar conta durante ou depois do checkout, desde que consiga acessar a área de membros após pagamento aprovado.
- O modo sandbox/fake de pagamento é aceito para desenvolvimento local e testes automatizados, enquanto staging/production usam configuração real de provedor.
- Boleto é apenas preparação de modelagem/documentação para fase futura e não faz parte do comportamento vendável do MVP.
- Conteúdo de aula em vídeo será armazenado como URL informada pelo produtor; upload/hosting de vídeo próprio fica fora do MVP.
- Reembolsos, afiliados, cupons, assinaturas, order bumps, múltiplas moedas, split de pagamento e relatórios financeiros avançados ficam fora do MVP.
- Emails reais ficam fora do MVP; o worker registra simulação de envio em log.
- Dados sensíveis de cartão são tratados pelo fluxo seguro do provedor de pagamento e nunca ficam persistidos na plataforma.
- Os documentos em `/docs` podem começar objetivos e curtos, desde que cubram os tópicos obrigatórios e sejam atualizados conforme o plano evolui.
