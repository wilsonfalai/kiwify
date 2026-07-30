import { describe, expect, it } from "vitest";
import {
  creditCardHolderInfoSchema,
  paymentCustomerInputSchema,
  paymentStatusSchema,
  transientCreditCardSchema
} from "./payment.js";

describe("payment schemas", () => {
  it("accepts canonical payment statuses and rejects provider-specific values", () => {
    expect(paymentStatusSchema.options).toEqual(["pending", "approved", "refused", "canceled"]);
    expect(paymentStatusSchema.safeParse("RECEIVED").success).toBe(false);
  });

  it("validates customer and transient card inputs at the provider boundary", () => {
    expect(
      paymentCustomerInputSchema.safeParse({
        name: "Buyer",
        email: "buyer@example.com",
        document: "24971563792"
      }).success
    ).toBe(true);
    expect(
      transientCreditCardSchema.safeParse({
        number: "4111111111111111",
        holderName: "BUYER",
        expiryMonth: "13",
        expiryYear: "2030",
        ccv: "123"
      }).success
    ).toBe(false);
    expect(
      creditCardHolderInfoSchema.safeParse({
        name: "Buyer",
        email: "buyer@example.com",
        document: "24971563792",
        postalCode: "01310000",
        addressNumber: "100"
      }).success
    ).toBe(true);
  });
});
