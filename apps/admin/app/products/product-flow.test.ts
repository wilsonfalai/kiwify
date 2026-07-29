import { describe, expect, it } from "vitest";
import { createDefaultProductDraft, validateProductDraft } from "../../components/product-form.js";
import { renderAdminProductsPage } from "./page.js";

describe("admin product flow", () => {
  it("supports product, module, lesson, and offer creation states", () => {
    const draft = createDefaultProductDraft();

    expect(validateProductDraft(draft)).toEqual(["product.title_required", "product.slug_required"]);

    draft.product = {
      title: "Curso MVP",
      slug: "curso-mvp",
      description: "Curso completo",
      status: "active"
    };
    draft.modules.push({ title: "Modulo 1", position: 1 });
    draft.lessons.push({ title: "Aula 1", contentType: "text", textContent: "Conteudo", position: 1 });
    draft.offers.push({ name: "Oferta principal", priceCents: 19900, allowedPaymentMethods: ["pix", "credit_card"] });

    expect(validateProductDraft(draft)).toEqual([]);
  });

  it("renders a compact products admin page", () => {
    expect(
      renderAdminProductsPage({
        products: [
          {
            id: "product_1",
            producerId: "producer_1",
            title: "Curso MVP",
            slug: "curso-mvp",
            description: "Curso completo",
            status: "active",
            createdAt: "2026-06-24T00:00:00.000Z",
            updatedAt: "2026-06-24T00:00:00.000Z"
          }
        ],
        modules: [{ id: "module_1", productId: "product_1", title: "Modulo 1", position: 1, createdAt: "now", updatedAt: "now" }],
        lessons: [],
        offers: [
          {
            id: "offer_1",
            productId: "product_1",
            name: "Oferta principal",
            priceCents: 19900,
            currency: "BRL",
            status: "active",
            allowedPaymentMethods: ["pix"],
            createdAt: "now",
            updatedAt: "now"
          }
        ]
      })
    ).toContain("Curso MVP (active) - 1 módulos - 1 ofertas");
  });
});
