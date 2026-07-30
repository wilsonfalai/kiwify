import type {
  CreditCardHolderInfo,
  PaymentCustomerInput,
  PaymentMethod,
  PaymentProviderName,
  PaymentStatus,
  TransientCreditCardInput
} from "@kiwifyclone/schemas";

export type PaymentProviderErrorCode =
  | "asaas_invalid_response"
  | "asaas_request_failed"
  | "asaas_timeout"
  | "asaas_unavailable"
  | "customer_document_required"
  | "invalid_payment_input";

export class PaymentProviderError extends Error {
  constructor(
    public readonly code: PaymentProviderErrorCode,
    message: string
  ) {
    super(message);
    this.name = "PaymentProviderError";
  }
}

export interface ProviderCustomerResult {
  externalCustomerId: string;
}

export interface ProviderChargeInput {
  externalCustomerId: string;
  amountCents: number;
  dueDate: string;
  externalReference?: string;
  description?: string;
}

export interface ProviderCreditCardChargeInput extends ProviderChargeInput {
  card: TransientCreditCardInput;
  holderInfo: CreditCardHolderInfo;
  remoteIp: string;
}

export interface ProviderPixInstructions {
  encodedImage?: string;
  payload?: string;
  expirationDate?: string;
}

export interface ProviderChargeResult {
  externalChargeId: string;
  externalStatus: string;
  status: PaymentStatus | null;
}

export interface ProviderPixChargeResult extends ProviderChargeResult {
  pix: ProviderPixInstructions;
}

export interface ProviderWebhookEvent {
  externalEventId?: string;
  eventType: string;
  externalChargeId: string;
  externalStatus: string;
  status: PaymentStatus | null;
  paymentMethod: PaymentMethod | null;
  amountCents?: number;
  externalReference?: string;
}

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  createCustomer(input: PaymentCustomerInput): Promise<ProviderCustomerResult>;
  createPixCharge(input: ProviderChargeInput): Promise<ProviderPixChargeResult>;
  createCreditCardCharge(input: ProviderCreditCardChargeInput): Promise<ProviderChargeResult>;
  parseWebhook(payload: unknown): ProviderWebhookEvent;
}
