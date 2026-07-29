import { beforeEach, describe, expect, it } from "vitest";
import { apiRequest, authHeaders, resetCatalog } from "./catalog-helpers.js";

describe("public products integration", () => {
  beforeEach(resetCatalog);

  it("returns only active products with active offers", () => {
    const product = apiRequest("POST", "/producer/products", {
      headers: authHeaders("producer", "producer_1"),
      body: {
        title: "Curso Ativo",
        slug: "curso-ativo",
        description: "Curso completo",
        status: "active"
      }
    }).body;

    apiRequest("POST", `/producer/products/${product.id as string}/offers`, {
      headers: authHeaders("producer", "producer_1"),
      body: {
        name: "Oferta ativa",
        priceCents: 9900,
        allowedPaymentMethods: ["pix"],
        status: "active"
      }
    });
    apiRequest("POST", `/producer/products/${product.id as string}/offers`, {
      headers: authHeaders("producer", "producer_1"),
      body: {
        name: "Oferta inativa",
        priceCents: 9900,
        allowedPaymentMethods: ["pix"],
        status: "inactive"
      }
    });

    const response = apiRequest("GET", "/products/curso-ativo");

    expect(response.statusCode).toBe(200);
    expect(response.body.product).toMatchObject({ slug: "curso-ativo", status: "active" });
    expect(response.body.offers).toHaveLength(1);
  });

  it("hides inactive products publicly", () => {
    apiRequest("POST", "/producer/products", {
      headers: authHeaders("producer", "producer_1"),
      body: {
        title: "Curso Inativo",
        slug: "curso-inativo",
        description: "Curso completo",
        status: "inactive"
      }
    });

    expect(apiRequest("GET", "/products/curso-inativo")).toMatchObject({
      statusCode: 404,
      body: { error: "product_not_found" }
    });
  });
});
