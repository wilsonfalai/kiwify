import { beforeEach, describe, expect, it } from "vitest";
import { ordersRepository } from "../src/orders/orders.repository.js";
import {
  checkoutCard,
  checkoutCustomer,
  checkoutRequest,
  resetCheckout,
  seedOffer
} from "./checkout-helpers.js";

describe("checkout integration", () => {
  beforeEach(resetCheckout);

  it("starts checkout and creates a pending order with an offer snapshot", async () => {
    const { offer } = seedOffer();
    const offerId = offer.id as string;

    expect(await checkoutRequest("GET", `/checkout/offers/${offerId}`)).toMatchObject({
      statusCode: 200,
      body: {
        product: { title: "Curso Checkout" },
        offer: { id: offerId, priceCents: 14900 }
      }
    });

    const created = await checkoutRequest("POST", "/checkout/orders", {
      offerId,
      customer: checkoutCustomer
    });

    expect(created).toMatchObject({
      statusCode: 201,
      body: {
        order: { status: "pending", totalCents: 14900 },
        item: {
          offerId,
          titleSnapshot: "Curso Checkout — Acesso completo",
          priceCents: 14900
        }
      }
    });
  });

  it("creates a pending Pix payment and returns safe payment instructions", async () => {
    const { offer } = seedOffer(["pix"]);
    const created = await checkoutRequest("POST", "/checkout/orders", {
      offerId: offer.id,
      customer: checkoutCustomer
    });
    const order = created.body.order as Record<string, unknown>;
    const payment = await checkoutRequest(
      "POST",
      `/checkout/orders/${order.id as string}/payments/pix`
    );

    expect(payment).toMatchObject({
      statusCode: 201,
      body: {
        orderStatus: "pending",
        paymentStatus: "pending",
        paymentMethod: "pix",
        pix: {
          payload: expect.stringContaining("FAKE-PIX")
        }
      }
    });
    expect(ordersRepository.snapshot().payments).toHaveLength(1);
    expect(ordersRepository.snapshot().providerCharges).toHaveLength(1);
  });

  it("processes an approved card payment through the configured provider", async () => {
    const { offer } = seedOffer(["credit_card"]);
    const created = await checkoutRequest("POST", "/checkout/orders", {
      offerId: offer.id,
      customer: checkoutCustomer
    });
    const order = created.body.order as Record<string, unknown>;
    const payment = await checkoutRequest(
      "POST",
      `/checkout/orders/${order.id as string}/payments/credit-card`,
      { card: checkoutCard }
    );

    expect(payment).toMatchObject({
      statusCode: 201,
      body: {
        orderStatus: "paid",
        paymentStatus: "approved",
        paymentMethod: "credit_card"
      }
    });
    expect(
      await checkoutRequest("GET", `/checkout/orders/${order.id as string}`)
    ).toMatchObject({
      statusCode: 200,
      body: {
        orderStatus: "paid",
        paymentStatus: "approved"
      }
    });
  });

  it("blocks inactive offers and disallowed payment methods", async () => {
    const inactive = seedOffer(["pix"], "inactive");

    expect(
      await checkoutRequest("GET", `/checkout/offers/${inactive.offer.id as string}`)
    ).toMatchObject({
      statusCode: 409,
      body: { error: "offer_not_purchasable" }
    });

    resetCheckout();
    const { offer } = seedOffer(["pix"]);
    const created = await checkoutRequest("POST", "/checkout/orders", {
      offerId: offer.id,
      customer: checkoutCustomer
    });
    const order = created.body.order as Record<string, unknown>;

    expect(
      await checkoutRequest(
        "POST",
        `/checkout/orders/${order.id as string}/payments/credit-card`,
        { card: checkoutCard }
      )
    ).toMatchObject({
      statusCode: 409,
      body: { error: "payment_method_not_allowed" }
    });
  });
});
