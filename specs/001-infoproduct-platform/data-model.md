# Data Model: Plataforma MVP de Infoprodutos

## Conventions

- IDs are UUIDs unless a provider supplies an external string ID.
- Monetary values are stored in integer cents plus currency.
- Timestamps use UTC.
- Soft deletion is not part of the MVP unless represented by a status field.
- Sensitive card data is never persisted.
- External provider raw payloads must be redacted or stored only as safe subsets.

## Entity: User

**Purpose**: Authenticated platform identity for producers, buyers, and platform
admins.

**Fields**:

- `id`: UUID, primary key
- `name`: string, required
- `email`: string, required, unique
- `role`: enum `buyer | producer | platform_admin`, required
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Relationships**:

- May have one `ProducerProfile`
- May have one `CustomerProfile`
- May own many `Product` records through producer profile
- May create many `Order` records as buyer

**Validation Rules**:

- Email must be unique and normalized.
- Platform-admin capabilities must not be inferred from producer/customer state.

## Entity: ProducerProfile

**Purpose**: Producer ownership context for products, offers, and producer admin.

**Fields**:

- `id`: UUID, primary key
- `userId`: UUID, required, unique
- `displayName`: string, required
- `status`: enum `active | inactive`, required
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Relationships**:

- Belongs to `User`
- Has many `Product`

## Entity: Product

**Purpose**: Digital product displayed publicly and delivered in the members area.

**Fields**:

- `id`: UUID, primary key
- `producerId`: UUID, required
- `title`: string, required
- `slug`: string, required, unique
- `description`: string, required
- `imageUrl`: string, optional
- `status`: enum `draft | active | inactive`, required
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Relationships**:

- Belongs to `ProducerProfile`
- Has many `ProductModule`
- Has many `Offer`
- Has many `Enrollment`

**Validation Rules**:

- Public pages expose only `status = active`.
- Slug must be URL-safe and unique.

## Entity: ProductModule

**Purpose**: Ordered content grouping inside a product.

**Fields**:

- `id`: UUID, primary key
- `productId`: UUID, required
- `title`: string, required
- `description`: string, optional
- `position`: integer, required
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Relationships**:

- Belongs to `Product`
- Has many `ProductLesson`

**Validation Rules**:

- Position must be unique within a product.

## Entity: ProductLesson

**Purpose**: Individual lesson available to enrolled buyers.

**Fields**:

- `id`: UUID, primary key
- `moduleId`: UUID, required
- `title`: string, required
- `description`: string, optional
- `contentType`: enum `text | video_url`, required
- `textContent`: text, optional
- `videoUrl`: string, optional
- `position`: integer, required
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Relationships**:

- Belongs to `ProductModule`

**Validation Rules**:

- Text lessons require `textContent`.
- Video URL lessons require `videoUrl`.
- Position must be unique within a module.

## Entity: Offer

**Purpose**: Commercial configuration used for public purchase.

**Fields**:

- `id`: UUID, primary key
- `productId`: UUID, required
- `name`: string, required
- `priceCents`: integer, required
- `currency`: string, required, default `BRL`
- `status`: enum `active | inactive`, required
- `allowedPaymentMethods`: array enum `pix | credit_card`, required
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Relationships**:

- Belongs to `Product`
- Has many `OrderItem`

**Validation Rules**:

- Checkout can use only active offers for active products.
- Price must be greater than zero.
- Boleto is not an MVP allowed method.

## Entity: CustomerProfile

**Purpose**: Buyer profile for purchases and provider customer mapping.

**Fields**:

- `id`: UUID, primary key
- `userId`: UUID, required, unique
- `name`: string, required
- `email`: string, required
- `document`: string, optional
- `phone`: string, optional
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Relationships**:

- Belongs to `User`
- Has many `Order`
- Has many `PaymentProviderCustomer`

## Entity: Order

**Purpose**: Buyer purchase attempt and commercial lifecycle.

**Fields**:

- `id`: UUID, primary key
- `customerId`: UUID, required
- `status`: enum `pending | paid | refused | canceled`, required
- `totalCents`: integer, required
- `currency`: string, required, default `BRL`
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `paidAt`: timestamp, optional

**Relationships**:

- Belongs to `CustomerProfile`
- Has many `OrderItem`
- Has one or many `Payment`
- May create `Enrollment`

**State Transitions**:

- `pending -> paid` when approved payment is processed
- `pending -> refused` when refused payment is processed
- `pending -> canceled` for future administrative cancellation
- `paid` is terminal for MVP access-grant behavior

## Entity: OrderItem

**Purpose**: Immutable purchased offer/product snapshot for an order.

**Fields**:

- `id`: UUID, primary key
- `orderId`: UUID, required
- `offerId`: UUID, required
- `productId`: UUID, required
- `titleSnapshot`: string, required
- `priceCents`: integer, required
- `currency`: string, required

**Relationships**:

- Belongs to `Order`
- References `Offer`
- References `Product`

## Entity: Payment

**Purpose**: Internal payment record for an order.

**Fields**:

- `id`: UUID, primary key
- `orderId`: UUID, required
- `provider`: enum `asaas | fake`, required
- `method`: enum `pix | credit_card`, required
- `status`: enum `pending | approved | refused | canceled`, required
- `amountCents`: integer, required
- `currency`: string, required, default `BRL`
- `safeMetadata`: json, optional
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `approvedAt`: timestamp, optional
- `refusedAt`: timestamp, optional

**Relationships**:

- Belongs to `Order`
- Has one `PaymentProviderCharge`

**Validation Rules**:

- Must never include full card number, CVV, token secrets, or passwords.

## Entity: PaymentProviderCustomer

**Purpose**: Maps internal customer to external provider customer ID.

**Fields**:

- `id`: UUID, primary key
- `customerId`: UUID, required
- `provider`: enum `asaas | fake`, required
- `externalCustomerId`: string, required
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Constraints**:

- Unique `(provider, externalCustomerId)`
- Unique `(provider, customerId)`

## Entity: PaymentProviderCharge

**Purpose**: Maps internal payment to external provider charge ID.

**Fields**:

- `id`: UUID, primary key
- `paymentId`: UUID, required, unique
- `provider`: enum `asaas | fake`, required
- `externalChargeId`: string, required
- `externalStatus`: string, optional
- `pixQrCode`: string, optional
- `pixPayload`: string, optional
- `safeMetadata`: json, optional
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Constraints**:

- Unique `(provider, externalChargeId)`
- Pix fields may be stored only if they do not contain secrets beyond the payment instruction.

## Entity: Enrollment

**Purpose**: Product access grant for a buyer.

**Fields**:

- `id`: UUID, primary key
- `customerId`: UUID, required
- `productId`: UUID, required
- `orderId`: UUID, required
- `status`: enum `active | pending | revoked`, required
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Constraints**:

- Unique active access per `(customerId, productId, orderId)`

**State Transitions**:

- `pending -> active` after paid order/access grant
- `active -> revoked` reserved for future administrative action

## Entity: ExternalWebhookEvent

**Purpose**: Audit and idempotency record for provider events.

**Fields**:

- `id`: UUID, primary key
- `provider`: enum `asaas`, required
- `externalEventId`: string, required
- `eventType`: string, required
- `idempotencyKey`: string, required
- `receivedAt`: timestamp
- `processedAt`: timestamp, optional
- `status`: enum `received | queued | processing | processed | ignored | failed`, required
- `safePayload`: json, required
- `processingError`: text, optional

**Constraints**:

- Unique `(provider, idempotencyKey)`

**Validation Rules**:

- Store only safe payload fields needed for audit and reconciliation.
- Duplicate events must resolve to `ignored` or no-op without duplicate business effects.

## Entity: DomainEvent

**Purpose**: Internal business event for workflow and audit.

**Fields**:

- `id`: UUID, primary key
- `type`: string, required
- `aggregateType`: string, required
- `aggregateId`: UUID, required
- `payload`: json, required
- `createdAt`: timestamp

## Entity: JobLog

**Purpose**: Records asynchronous job attempts and simulated email sends.

**Fields**:

- `id`: UUID, primary key
- `queueName`: string, required
- `jobName`: string, required
- `jobId`: string, optional
- `status`: enum `queued | processing | completed | failed | skipped`, required
- `inputSummary`: json, optional
- `resultSummary`: json, optional
- `error`: text, optional
- `createdAt`: timestamp
- `updatedAt`: timestamp

## Provider Interface Model

`PaymentProvider` operations:

- `findOrCreateCustomer(customerProfile)`
- `createPixCharge(order, customer, safeMetadata)`
- `createCreditCardCharge(order, customer, cardInput, safeMetadata)`
- `parseWebhook(payload, securityContext)`
- `mapExternalStatus(providerStatus)`

`AsaasPaymentProvider` implements the interface and is the only component that
knows Asaas-specific customer, charge, and webhook details.

## Payment State Mapping

- Provider-approved status maps to `Payment.approved` and `Order.paid`.
- Provider-pending status maps to `Payment.pending` and `Order.pending`.
- Provider-refused status maps to `Payment.refused` and `Order.refused`.
- Unknown provider status records the event and leaves business state unchanged
  until explicitly mapped.
