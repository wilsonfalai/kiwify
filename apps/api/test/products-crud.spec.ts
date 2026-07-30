import { beforeEach, describe, expect, it } from "vitest";
import { apiRequest, authHeaders, resetCatalog } from "./catalog-helpers.js";

describe("products CRUD integration", () => {
  beforeEach(resetCatalog);

  it("allows producer to create, list, and update own products", () => {
    const create = apiRequest("POST", "/producer/products", {
      headers: authHeaders("producer", "producer_1"),
      body: {
        title: "Curso MVP",
        slug: "curso-mvp",
        description: "Curso completo",
        status: "draft"
      }
    });

    expect(create.statusCode).toBe(201);
    expect(create.body).toMatchObject({ title: "Curso MVP", producerId: "producer_1" });

    const list = apiRequest("GET", "/producer/products", {
      headers: authHeaders("producer", "producer_1")
    });

    expect(list.statusCode).toBe(200);
    expect(list.body.items).toHaveLength(1);

    const productId = create.body.id as string;
    const update = apiRequest("PATCH", `/producer/products/${productId}`, {
      headers: authHeaders("producer", "producer_1"),
      body: {
        status: "active"
      }
    });

    expect(update.statusCode).toBe(200);
    expect(update.body).toMatchObject({ id: productId, status: "active" });
  });

  it("blocks buyers from producer product management", () => {
    const response = apiRequest("POST", "/producer/products", {
      headers: authHeaders("buyer", "buyer_1"),
      body: {
        title: "Curso MVP",
        slug: "curso-mvp",
        description: "Curso completo"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({ error: "forbidden" });
  });
});
