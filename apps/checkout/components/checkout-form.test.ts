import { checkoutFormSchema } from "@kiwifyclone/schemas";
import { describe, expect, it } from "vitest";

const customer = {
  name: "Maria Compradora",
  email: "maria@example.com",
  document: "24971563792",
  phone: "11999999999"
};

describe("checkout form validation", () => {
  it("accepts Pix without card fields", () => {
    expect(
      checkoutFormSchema.safeParse({
        customer,
        paymentMethod: "pix"
      }).success
    ).toBe(true);
  });

  it("requires valid transient card fields for credit card", () => {
    expect(
      checkoutFormSchema.safeParse({
        customer,
        paymentMethod: "credit_card",
        card: {
          number: "4111111111111111",
          holderName: "MARIA COMPRADORA",
          expiryMonth: "12",
          expiryYear: "2030",
          ccv: "123",
          postalCode: "01310000",
          addressNumber: "100"
        }
      }).success
    ).toBe(true);

    expect(
      checkoutFormSchema.safeParse({
        customer,
        paymentMethod: "credit_card"
      }).success
    ).toBe(false);
  });
});
