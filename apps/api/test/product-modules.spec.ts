import { beforeEach, describe, expect, it } from "vitest";
import { apiRequest, authHeaders, resetCatalog } from "./catalog-helpers.js";

describe("product modules integration", () => {
  beforeEach(resetCatalog);

  it("creates ordered modules for producer-owned product", () => {
    const product = apiRequest("POST", "/producer/products", {
      headers: authHeaders("producer", "producer_1"),
      body: {
        title: "Curso MVP",
        slug: "curso-mvp",
        description: "Curso completo"
      }
    }).body;

    const module = apiRequest("POST", `/producer/products/${product.id as string}/modules`, {
      headers: authHeaders("producer", "producer_1"),
      body: {
        title: "Modulo 1",
        position: 1
      }
    });

    expect(module.statusCode).toBe(201);
    expect(module.body).toMatchObject({ productId: product.id, title: "Modulo 1", position: 1 });
  });
});
