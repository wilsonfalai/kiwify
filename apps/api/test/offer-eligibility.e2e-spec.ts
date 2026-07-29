import { beforeEach, describe, expect, it } from "vitest";
import { apiRequest, authHeaders, resetCatalog } from "./catalog-helpers.js";

describe("offer eligibility integration", () => {
  beforeEach(resetCatalog);

  it("blocks inactive offers and disallowed payment methods", () => {
    const product = apiRequest("POST", "/producer/products", {
      headers: authHeaders("producer", "producer_1"),
      body: {
        title: "Curso Ativo",
        slug: "curso-ativo",
        description: "Curso completo",
        status: "active"
      }
    }).body;
    const offer = apiRequest("POST", `/producer/products/${product.id as string}/offers`, {
      headers: authHeaders("producer", "producer_1"),
      body: {
        name: "Oferta",
        priceCents: 9900,
        allowedPaymentMethods: ["pix"],
        status: "active"
      }
    }).body;

    expect(apiRequest("GET", `/offers/${offer.id as string}/eligibility?method=pix`)).toMatchObject({
      statusCode: 200,
      body: { eligible: true }
    });
    expect(apiRequest("GET", `/offers/${offer.id as string}/eligibility?method=credit_card`)).toMatchObject({
      statusCode: 200,
      body: { eligible: false, reason: "payment_method_not_allowed" }
    });

    const inactiveOffer = apiRequest("POST", `/producer/products/${product.id as string}/offers`, {
      headers: authHeaders("producer", "producer_1"),
      body: {
        name: "Oferta inativa",
        priceCents: 9900,
        allowedPaymentMethods: ["pix"],
        status: "inactive"
      }
    }).body;

    expect(apiRequest("GET", `/offers/${inactiveOffer.id as string}/eligibility?method=pix`)).toMatchObject({
      statusCode: 200,
      body: { eligible: false, reason: "offer_not_purchasable" }
    });
  });
});
