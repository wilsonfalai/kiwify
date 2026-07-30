import { describe, expect, it } from "vitest";
import * as paymentsModule from "../src/payments/payments.module.js";

describe("PaymentsModule", () => {
  it("injects the fake provider by default for local development", () => {
    expect(paymentsModule.paymentsService.provider.name).toBe("fake");
    expect(paymentsModule.paymentsService.createPixPayment).toBeTypeOf("function");
  });
});
