import { describe, expect, it } from "vitest";
import { FakePaymentProvider } from "./fake-payment-provider.js";

describe("FakePaymentProvider", () => {
  it("returns deterministic customer and charge identifiers", async () => {
    const provider = new FakePaymentProvider();

    await expect(
      provider.createCustomer({
        name: "Buyer",
        email: "buyer@example.com",
        externalReference: "customer_42"
      })
    ).resolves.toEqual({ externalCustomerId: "fake_customer_customer_42" });

    await expect(
      provider.createPixCharge({
        externalCustomerId: "fake_customer_customer_42",
        amountCents: 5000,
        dueDate: "2026-08-01",
        externalReference: "order_42"
      })
    ).resolves.toMatchObject({
      externalChargeId: "fake_pix_order_42",
      externalStatus: "PENDING",
      status: "pending"
    });
  });

  it("never returns transient card fields", async () => {
    const provider = new FakePaymentProvider();
    const result = await provider.createCreditCardCharge({
      externalCustomerId: "fake_customer_1",
      amountCents: 5000,
      dueDate: "2026-08-01",
      externalReference: "order_1",
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

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("4111111111111111");
    expect(serialized).not.toContain("123");
  });
});
