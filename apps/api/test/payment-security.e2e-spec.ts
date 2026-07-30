import { beforeEach, describe, expect, it, vi } from "vitest";
import { ordersRepository } from "../src/orders/orders.repository.js";
import {
  checkoutCustomer,
  checkoutRequest,
  resetCheckout,
  seedOffer
} from "./checkout-helpers.js";

describe("payment security integration", () => {
  beforeEach(resetCheckout);

  it("never persists, exposes, or logs transient card data and secrets", async () => {
    const cardNumber = "5555444433331111";
    const ccv = "987";
    const apiKey = "asaas_key_must_never_leak";
    const webhookToken = "webhook_token_must_never_leak";
    const password = "buyer_password_must_never_leak";
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { offer } = seedOffer(["credit_card"]);
    const created = await checkoutRequest("POST", "/checkout/orders", {
      offerId: offer.id,
      customer: checkoutCustomer,
      password
    });
    const order = created.body.order as Record<string, unknown>;
    const response = await checkoutRequest(
      "POST",
      `/checkout/orders/${order.id as string}/payments/credit-card`,
      {
        card: {
          number: cardNumber,
          holderName: "MARIA COMPRADORA",
          expiryMonth: "12",
          expiryYear: "2030",
          ccv,
          postalCode: "01310000",
          addressNumber: "100"
        },
        apiKey,
        webhookToken,
        password
      }
    );

    const persisted = JSON.stringify(ordersRepository.safeSnapshot());
    const exposed = JSON.stringify(response.body);
    const logs = JSON.stringify([
      ...consoleLog.mock.calls,
      ...consoleError.mock.calls
    ]);

    for (const sensitive of [cardNumber, ccv, apiKey, webhookToken, password]) {
      expect(persisted).not.toContain(sensitive);
      expect(exposed).not.toContain(sensitive);
      expect(logs).not.toContain(sensitive);
    }

    expect(response.statusCode).toBe(201);
    expect(ordersRepository.snapshot().payments[0]?.safeMetadata).toEqual({
      externalStatus: "CONFIRMED"
    });

    consoleLog.mockRestore();
    consoleError.mockRestore();
  });
});
