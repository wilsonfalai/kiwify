import {
  creditCardPaymentRequestSchema,
  customerForPaymentSchema,
  type CreditCardPaymentRequest,
  type Payment,
  type PaymentMethod,
  type PaymentStatus
} from "@kiwifyclone/schemas";
import { CheckoutDomainError, ordersService } from "../orders/orders.service.js";
import { ordersRepository } from "../orders/orders.repository.js";
import { offersService } from "../offers/offers.service.js";
import { AsaasPaymentProvider } from "./asaas-payment-provider.js";
import { FakePaymentProvider } from "./fake-payment-provider.js";
import type {
  PaymentProvider,
  ProviderChargeResult,
  ProviderPixChargeResult
} from "./payment-provider.js";
import { parsePaymentsEnv } from "./payments.env.js";

let nextPaymentId = 1;

function id(prefix: string): string {
  return `${prefix}_${nextPaymentId++}`;
}

function now(): string {
  return new Date().toISOString();
}

function dueDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function orderStatusForPayment(status: PaymentStatus | null) {
  if (status === "approved") {
    return "paid" as const;
  }

  if (status === "refused") {
    return "refused" as const;
  }

  if (status === "canceled") {
    return "canceled" as const;
  }

  return "pending" as const;
}

export function createPaymentProvider(): PaymentProvider {
  const env = parsePaymentsEnv();

  if (env.environment === "local-fake") {
    return new FakePaymentProvider();
  }

  return new AsaasPaymentProvider({
    apiKey: env.apiKey as string,
    baseUrl: env.baseUrl
  });
}

export class PaymentsService {
  constructor(public readonly provider: PaymentProvider) {}

  async createPixPayment(orderId: string) {
    const context = this.prepare(orderId, "pix");
    const externalCustomerId = await this.externalCustomer(context.customer);
    const charge = await this.provider.createPixCharge({
      externalCustomerId,
      amountCents: context.order.totalCents,
      dueDate: dueDate(),
      externalReference: context.order.id,
      description: context.item.titleSnapshot
    });

    return this.persistResult(context.order, "pix", charge);
  }

  async createCreditCardPayment(orderId: string, input: CreditCardPaymentRequest) {
    const value = creditCardPaymentRequestSchema.parse(input);
    const context = this.prepare(orderId, "credit_card");
    const customer = context.customer;
    customerForPaymentSchema({
      provider: this.provider.name,
      method: "credit_card"
    }).parse(customer);
    const externalCustomerId = await this.externalCustomer(customer);
    const charge = await this.provider.createCreditCardCharge({
      externalCustomerId,
      amountCents: context.order.totalCents,
      dueDate: dueDate(),
      externalReference: context.order.id,
      description: context.item.titleSnapshot,
      card: {
        number: value.card.number,
        holderName: value.card.holderName,
        expiryMonth: value.card.expiryMonth,
        expiryYear: value.card.expiryYear,
        ccv: value.card.ccv
      },
      holderInfo: {
        name: customer.name,
        email: customer.email,
        document: customer.document as string,
        postalCode: value.card.postalCode,
        addressNumber: value.card.addressNumber,
        addressComplement: value.card.addressComplement,
        phone: customer.phone
      },
      remoteIp: value.remoteIp
    });

    return this.persistResult(context.order, "credit_card", charge);
  }

  private prepare(orderId: string, method: PaymentMethod) {
    const context = ordersService.getOrderContext(orderId);

    if (context.order.status === "paid") {
      throw new CheckoutDomainError("checkout_already_paid");
    }

    if (ordersRepository.snapshot().payments.some((payment) => payment.orderId === orderId)) {
      throw new CheckoutDomainError("checkout_payment_exists");
    }

    try {
      offersService.ensureOfferCanBePurchased(context.item.offerId, method);
    } catch (error) {
      const code =
        error instanceof Error && error.message === "payment_method_not_allowed"
          ? "payment_method_not_allowed"
          : "offer_not_purchasable";
      throw new CheckoutDomainError(code);
    }

    customerForPaymentSchema({ provider: this.provider.name, method }).parse(context.customer);
    return context;
  }

  private async externalCustomer(customer: ReturnType<typeof ordersService.getOrderContext>["customer"]) {
    const records = ordersRepository.snapshot();
    const existing = records.providerCustomers.find(
      (item) => item.customerId === customer.id && item.provider === this.provider.name
    );

    if (existing) {
      return existing.externalCustomerId;
    }

    const result = await this.provider.createCustomer({
      name: customer.name,
      email: customer.email,
      document: customer.document,
      phone: customer.phone,
      externalReference: customer.id
    });
    const timestamp = now();

    records.providerCustomers.push({
      id: id("provider_customer"),
      customerId: customer.id,
      provider: this.provider.name,
      externalCustomerId: result.externalCustomerId,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    return result.externalCustomerId;
  }

  private persistResult(
    order: ReturnType<typeof ordersService.getOrder>,
    method: PaymentMethod,
    charge: ProviderChargeResult | ProviderPixChargeResult
  ) {
    const records = ordersRepository.snapshot();
    const timestamp = now();
    const status = charge.status ?? "pending";
    const payment: Payment = {
      id: id("payment"),
      orderId: order.id,
      provider: this.provider.name,
      method,
      status,
      amountCents: order.totalCents,
      currency: order.currency,
      safeMetadata: {
        externalStatus: charge.externalStatus
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      approvedAt: status === "approved" ? timestamp : undefined,
      refusedAt: status === "refused" ? timestamp : undefined
    };
    const pix = "pix" in charge ? charge.pix : undefined;

    records.payments.push(payment);
    records.providerCharges.push({
      id: id("provider_charge"),
      paymentId: payment.id,
      provider: this.provider.name,
      externalChargeId: charge.externalChargeId,
      externalStatus: charge.externalStatus,
      pixQrCode: pix?.encodedImage,
      pixPayload: pix?.payload,
      safeMetadata: pix?.expirationDate ? { expirationDate: pix.expirationDate } : undefined,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    order.status = orderStatusForPayment(charge.status);
    order.updatedAt = timestamp;
    order.paidAt = order.status === "paid" ? timestamp : undefined;

    return {
      orderId: order.id,
      paymentId: payment.id,
      orderStatus: order.status,
      paymentStatus: payment.status,
      paymentMethod: payment.method,
      pix: pix
        ? {
            qrCode: pix.encodedImage,
            payload: pix.payload,
            expirationDate: pix.expirationDate
          }
        : undefined
    };
  }
}

export const paymentsService = new PaymentsService(createPaymentProvider());
