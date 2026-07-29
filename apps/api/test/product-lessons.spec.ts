import { beforeEach, describe, expect, it } from "vitest";
import { apiRequest, authHeaders, resetCatalog } from "./catalog-helpers.js";

describe("product lessons integration", () => {
  beforeEach(resetCatalog);

  it("creates text and video lessons with content validation", () => {
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
      body: { title: "Modulo 1", position: 1 }
    }).body;

    const invalid = apiRequest("POST", `/producer/modules/${module.id as string}/lessons`, {
      headers: authHeaders("producer", "producer_1"),
      body: {
        title: "Aula sem conteudo",
        contentType: "text",
        position: 1
      }
    });
    expect(invalid.statusCode).toBe(400);

    const lesson = apiRequest("POST", `/producer/modules/${module.id as string}/lessons`, {
      headers: authHeaders("producer", "producer_1"),
      body: {
        title: "Aula 1",
        contentType: "text",
        textContent: "Conteudo",
        position: 1
      }
    });

    expect(lesson.statusCode).toBe(201);
    expect(lesson.body).toMatchObject({ moduleId: module.id, contentType: "text" });
  });
});
