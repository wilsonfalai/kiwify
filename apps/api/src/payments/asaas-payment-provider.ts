import {
  creditCardHolderInfoSchema,
  paymentCustomerInputSchema,
  transientCreditCardSchema
} from "@kiwifyclone/schemas";
import { mapAsaasPaymentStatus } from "./payment-status.mapper.js";
import {
  PaymentProviderError,
  type PaymentProvider,
  type ProviderChargeInput,
  type ProviderChargeResult,
  type ProviderCreditCardChargeInput,
  type ProviderCustomerResult,
  type ProviderPixChargeResult,
  type ProviderWebhookEvent
} from "./payment-provider.js";

export interface AsaasPaymentProviderOptions {
  apiKey: string;
  baseUrl: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function requiredString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function paymentMethod(value: unknown): "pix" | "credit_card" | null {
  if (value === "PIX") {
    return "pix";
  }

  if (value === "CREDIT_CARD") {
    return "credit_card";
  }

  return null;
}

function validateChargeInput(input: ProviderChargeInput): void {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new PaymentProviderError("invalid_payment_input", "Payment amount must be a positive integer.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) {
    throw new PaymentProviderError("invalid_payment_input", "Payment due date must use YYYY-MM-DD.");
  }
}

export class AsaasPaymentProvider implements PaymentProvider {
  readonly name = "asaas" as const;
  private readonly fetchImplementation: typeof fetch;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly options: AsaasPaymentProviderOptions) {
    if (!options.apiKey.trim()) {
      throw new PaymentProviderError("invalid_payment_input", "Asaas API key is required.");
    }

    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.fetchImplementation = options.fetch ?? globalThis.fetch;
    this.timeoutMs = options.timeoutMs ?? 60_000;
  }

  async createCustomer(
    input: Parameters<PaymentProvider["createCustomer"]>[0]
  ): Promise<ProviderCustomerResult> {
    const customer = paymentCustomerInputSchema.parse(input);

    if (!customer.document) {
      throw new PaymentProviderError(
        "customer_document_required",
        "Customer document is required by Asaas."
      );
    }

    const response = await this.request("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: customer.name,
        email: customer.email,
        cpfCnpj: customer.document,
        mobilePhone: customer.phone,
        externalReference: customer.externalReference
      })
    });
    const externalCustomerId = requiredString(response.id);

    if (!externalCustomerId) {
      throw new PaymentProviderError(
        "asaas_invalid_response",
        "Asaas returned an invalid customer response."
      );
    }

    return { externalCustomerId };
  }

  async createPixCharge(input: ProviderChargeInput): Promise<ProviderPixChargeResult> {
    validateChargeInput(input);
    const charge = await this.createCharge("PIX", input);
    const qrCode = await this.request(`/payments/${encodeURIComponent(charge.externalChargeId)}/pixQrCode`, {
      method: "GET"
    });

    return {
      ...charge,
      pix: {
        encodedImage: requiredString(qrCode.encodedImage) ?? undefined,
        payload: requiredString(qrCode.payload) ?? undefined,
        expirationDate: requiredString(qrCode.expirationDate) ?? undefined
      }
    };
  }

  async createCreditCardCharge(
    input: ProviderCreditCardChargeInput
  ): Promise<ProviderChargeResult> {
    validateChargeInput(input);
    const card = transientCreditCardSchema.parse(input.card);
    const holder = creditCardHolderInfoSchema.parse(input.holderInfo);

    return this.createCharge("CREDIT_CARD", input, {
      creditCard: {
        number: card.number,
        holderName: card.holderName,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        ccv: card.ccv
      },
      creditCardHolderInfo: {
        name: holder.name,
        email: holder.email,
        cpfCnpj: holder.document,
        postalCode: holder.postalCode,
        addressNumber: holder.addressNumber,
        addressComplement: holder.addressComplement,
        phone: holder.phone
      },
      remoteIp: input.remoteIp
    });
  }

  parseWebhook(payload: unknown): ProviderWebhookEvent {
    const event = asRecord(payload);
    const payment = asRecord(event?.payment);
    const eventType = requiredString(event?.event);
    const externalChargeId = requiredString(payment?.id);
    const externalStatus = requiredString(payment?.status);

    if (!event || !payment || !eventType || !externalChargeId || !externalStatus) {
      throw new PaymentProviderError(
        "asaas_invalid_response",
        "Asaas returned an invalid webhook payload."
      );
    }

    return {
      externalEventId: requiredString(event.id) ?? undefined,
      eventType,
      externalChargeId,
      externalStatus,
      status: mapAsaasPaymentStatus(externalStatus),
      paymentMethod: paymentMethod(payment.billingType),
      amountCents: typeof payment.value === "number" ? Math.round(payment.value * 100) : undefined,
      externalReference: requiredString(payment.externalReference) ?? undefined
    };
  }

  private async createCharge(
    billingType: "PIX" | "CREDIT_CARD",
    input: ProviderChargeInput,
    extra: JsonRecord = {}
  ): Promise<ProviderChargeResult> {
    const response = await this.request("/payments", {
      method: "POST",
      body: JSON.stringify({
        customer: input.externalCustomerId,
        billingType,
        value: input.amountCents / 100,
        dueDate: input.dueDate,
        description: input.description,
        externalReference: input.externalReference,
        ...extra
      })
    });
    const externalChargeId = requiredString(response.id);
    const externalStatus = requiredString(response.status);

    if (!externalChargeId || !externalStatus) {
      throw new PaymentProviderError(
        "asaas_invalid_response",
        "Asaas returned an invalid charge response."
      );
    }

    return {
      externalChargeId,
      externalStatus,
      status: mapAsaasPaymentStatus(externalStatus)
    };
  }

  private async request(path: string, init: RequestInit): Promise<JsonRecord> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImplementation(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "user-agent": "KiwifyClone/0.1.0",
          access_token: this.options.apiKey
        }
      });

      if (!response.ok) {
        throw new PaymentProviderError(
          "asaas_request_failed",
          `Asaas request failed with status ${response.status}.`
        );
      }

      let payload: unknown;

      try {
        payload = await response.json();
      } catch {
        throw new PaymentProviderError(
          "asaas_invalid_response",
          "Asaas returned a malformed response."
        );
      }

      const result = asRecord(payload);

      if (!result) {
        throw new PaymentProviderError(
          "asaas_invalid_response",
          "Asaas returned an invalid response."
        );
      }

      return result;
    } catch (error) {
      if (error instanceof PaymentProviderError) {
        throw error;
      }

      if (
        (error instanceof DOMException && error.name === "AbortError") ||
        (error instanceof Error && error.name === "AbortError")
      ) {
        throw new PaymentProviderError("asaas_timeout", "Asaas request timed out.");
      }

      throw new PaymentProviderError("asaas_unavailable", "Asaas is temporarily unavailable.");
    } finally {
      clearTimeout(timeout);
    }
  }
}
