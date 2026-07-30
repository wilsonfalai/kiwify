import { describe, expect, it } from "vitest";
import { FakePaymentProvider } from "./fake-payment-provider.js";

describe("PaymentProvider contract", () => {
  it("covers customer, Pix, credit card, and safe webhook parsing", async () => {
    const provider = new FakePaymentProvider();
    const customer = await provider.createCustomer({
      name: "Buyer",
      email: "buyer@example.com",
      document: "24971563792",
      externalReference: "buyer_1"
    });

    const pix = await provider.createPixCharge({
      externalCustomerId: customer.externalCustomerId,
      amountCents: 19900,
      dueDate: "2026-08-01",
      externalReference: "order_pix"
    });
    const card = await provider.createCreditCardCharge({
      externalCustomerId: customer.externalCustomerId,
      amountCents: 19900,
      dueDate: "2026-08-01",
      externalReference: "order_card",
      card: {
        number: "4111111111111111",
        holderName: "BUYER",
        expiryMonth: "12",
        expiryYear: "2030",
        ccv: "123"
      },
      holderInfo: {
        name: "Buyer",
        email: "buyer@example.com",
        document: "24971563792",
        postalCode: "01310000",
        addressNumber: "100"
      },
      remoteIp: "203.0.113.10"
    });
    const webhook = provider.parseWebhook({
      id: "evt_1",
      event: "PAYMENT_RECEIVED",
      payment: {
        id: "pay_1",
        status: "RECEIVED",
        billingType: "PIX",
        value: 199,
        creditCard: { number: "4111111111111111", ccv: "123" }
      }
    });

    expect(customer.externalCustomerId).toBe("fake_customer_buyer_1");
    expect(pix).toMatchObject({
      externalChargeId: "fake_pix_order_pix",
      status: "pending",
      pix: { payload: expect.any(String) }
    });
    expect(card).toMatchObject({
      externalChargeId: "fake_card_order_card",
      status: "approved"
    });
    expect(JSON.stringify(card)).not.toContain("4111111111111111");
    expect(JSON.stringify(card)).not.toContain("123");
    expect(webhook).toEqual({
      externalEventId: "evt_1",
      eventType: "PAYMENT_RECEIVED",
      externalChargeId: "pay_1",
      externalStatus: "RECEIVED",
      status: "approved",
      paymentMethod: "pix",
      amountCents: 19900,
      externalReference: undefined
    });
  });
});
