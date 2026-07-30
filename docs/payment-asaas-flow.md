# Asaas Payment Flow

## Provider boundary

Domain and checkout code depend on `PaymentProvider`, never on an Asaas payload.
The contract exposes customer creation, Pix charge creation, credit-card charge
creation, and safe webhook parsing. `AsaasPaymentProvider` is the production
adapter and `FakePaymentProvider` supplies deterministic local/test behavior.

Provider responses are normalized to:

- payment statuses: `pending`, `approved`, `refused`, `canceled`;
- payment methods: `pix`, `credit_card`;
- safe references: external customer/charge/event IDs;
- Pix instructions: Base64 image, copy-and-paste payload, and expiration date.

Unknown provider statuses map to `null` and must not cause a domain state
transition.

## Configuration

- `ASAAS_ENVIRONMENT=local-fake` does not require an API key.
- `ASAAS_ENVIRONMENT=sandbox` requires `ASAAS_API_KEY` and defaults to
  `https://api-sandbox.asaas.com/v3`.
- `ASAAS_ENVIRONMENT=production` requires `ASAAS_API_KEY`, HTTPS, and defaults to
  `https://api.asaas.com/v3`.

Credentials are sent only through the Asaas `access_token` header and must never
appear in errors, logs, responses, or persisted metadata.

## Customer and charges

1. Create or reuse the provider customer and retain only its external ID.
2. Create one charge with `POST /payments`, a single `billingType`, the value in
   BRL, due date, and an internal `externalReference`.
3. For Pix, retrieve instructions with
   `GET /payments/{paymentId}/pixQrCode`.
4. For card, send `creditCard`, `creditCardHolderInfo`, and the buyer's
   `remoteIp` directly to Asaas over HTTPS.
5. Return only the charge ID and normalized status. Ignore card number, CVV,
   provider card token, and other sensitive response fields.

Card input is transient request data. It must never be persisted or logged.
Provider failures are converted to safe codes without including response
payloads. Requests time out and surface a retryable availability error.

Official references:

- https://docs.asaas.com/reference/criar-novo-cliente
- https://docs.asaas.com/reference/criar-nova-cobranca
- https://docs.asaas.com/reference/obter-qr-code-para-pagamentos-via-pix
- https://docs.asaas.com/reference/criar-cobranca-com-cartao-de-credito

## Webhooks

Webhook work is completed in later phases. The provider parser already reduces
incoming data to a safe event containing IDs, event type, external/internal
status, method, amount, and reference. The API will validate authenticity,
persist the safe subset, and enqueue it. The worker will process the event with
idempotency guarantees.
