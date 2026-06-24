# Asaas Payment Flow

Payments must be accessed through the `PaymentProvider` abstraction. The Asaas
implementation will be named `AsaasPaymentProvider`.

The MVP supports Pix and credit card. Boleto can remain prepared for a future
phase but is not delivered as an MVP payment method.

The platform must never persist sensitive card data. Webhooks are received by
the API, saved as safe auditable events, and processed asynchronously by the
worker with idempotency guarantees.
