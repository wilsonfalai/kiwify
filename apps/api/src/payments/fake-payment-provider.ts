import {
  paymentCustomerInputSchema,
  transientCreditCardSchema,
  creditCardHolderInfoSchema
} from "@kiwifyclone/schemas";
import type {
  PaymentProvider,
  ProviderChargeInput,
  ProviderChargeResult,
  ProviderCreditCardChargeInput,
  ProviderCustomerResult,
  ProviderPixChargeResult,
  ProviderWebhookEvent
} from "./payment-provider.js";

function stableKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function chargeKey(input: ProviderChargeInput): string {
  return stableKey(input.externalReference ?? input.externalCustomerId);
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function methodFromBillingType(value: unknown): "pix" | "credit_card" | null {
  if (value === "PIX") {
    return "pix";
  }

  if (value === "CREDIT_CARD") {
    return "credit_card";
  }

  return null;
}

function fakeStatus(value: unknown): "pending" | "approved" | "refused" | "canceled" | null {
  if (value === "RECEIVED" || value === "CONFIRMED") {
    return "approved";
  }

  if (value === "PENDING") {
    return "pending";
  }

  if (value === "OVERDUE" || value === "REFUSED") {
    return "refused";
  }

  if (value === "REFUNDED" || value === "DELETED") {
    return "canceled";
  }

  return null;
}

export class FakePaymentProvider implements PaymentProvider {
  readonly name = "fake" as const;

  async createCustomer(input: Parameters<PaymentProvider["createCustomer"]>[0]): Promise<ProviderCustomerResult> {
    const value = paymentCustomerInputSchema.parse(input);
    const key = stableKey(value.externalReference ?? value.email);
    return { externalCustomerId: `fake_customer_${key}` };
  }

  async createPixCharge(input: ProviderChargeInput): Promise<ProviderPixChargeResult> {
    const key = chargeKey(input);
    return {
      externalChargeId: `fake_pix_${key}`,
      externalStatus: "PENDING",
      status: "pending",
      pix: {
        encodedImage: `ZmFrZS1waXgtaW1hZ2Ut${key}`,
        payload: `FAKE-PIX-${key.toUpperCase()}`,
        expirationDate: input.dueDate
      }
    };
  }

  async createCreditCardCharge(input: ProviderCreditCardChargeInput): Promise<ProviderChargeResult> {
    transientCreditCardSchema.parse(input.card);
    creditCardHolderInfoSchema.parse(input.holderInfo);
    const key = chargeKey(input);

    return {
      externalChargeId: `fake_card_${key}`,
      externalStatus: "CONFIRMED",
      status: "approved"
    };
  }

  parseWebhook(payload: unknown): ProviderWebhookEvent {
    const event = record(payload);
    const payment = record(event?.payment);

    if (
      !event ||
      !payment ||
      typeof event.event !== "string" ||
      typeof payment.id !== "string" ||
      typeof payment.status !== "string"
    ) {
      throw new Error("Invalid fake payment webhook.");
    }

    return {
      externalEventId: typeof event.id === "string" ? event.id : undefined,
      eventType: event.event,
      externalChargeId: payment.id,
      externalStatus: payment.status,
      status: fakeStatus(payment.status),
      paymentMethod: methodFromBillingType(payment.billingType),
      amountCents: typeof payment.value === "number" ? Math.round(payment.value * 100) : undefined,
      externalReference:
        typeof payment.externalReference === "string" ? payment.externalReference : undefined
    };
  }
}
