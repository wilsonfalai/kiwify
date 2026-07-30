import { describe, expect, it } from "vitest";
import { checkoutCustomerSchema, customerForPaymentSchema } from "./customer.js";

describe("checkout customer schema", () => {
  it("normalizes and validates optional document and phone", () => {
    expect(
      checkoutCustomerSchema.parse({
        name: "Maria Compradora",
        email: "MARIA@EXAMPLE.COM",
        document: "249.715.637-92",
        phone: "(11) 99999-9999"
      })
    ).toEqual({
      name: "Maria Compradora",
      email: "maria@example.com",
      document: "24971563792",
      phone: "11999999999"
    });

    expect(
      checkoutCustomerSchema.safeParse({
        name: "Maria",
        email: "maria@example.com",
        document: "123"
      }).success
    ).toBe(false);
  });

  it("requires provider-specific fields only when needed", () => {
    const pix = customerForPaymentSchema({ provider: "asaas", method: "pix" });
    const card = customerForPaymentSchema({ provider: "asaas", method: "credit_card" });
    const fake = customerForPaymentSchema({ provider: "fake", method: "pix" });
    const customer = { name: "Maria", email: "maria@example.com" };

    expect(pix.safeParse(customer).success).toBe(false);
    expect(card.safeParse({ ...customer, document: "24971563792" }).success).toBe(false);
    expect(fake.safeParse(customer).success).toBe(true);
  });
});
