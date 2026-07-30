import { describe, expect, it } from "vitest";
import { renderPublicProductPage } from "./page.js";

const product = {
  id: "product_1",
  producerId: "producer_1",
  title: "Curso MVP",
  slug: "curso-mvp",
  description: "Curso completo",
  status: "active",
  createdAt: "now",
  updatedAt: "now"
} as const;

describe("public product page", () => {
  it("renders active product and active offer", () => {
    const page = renderPublicProductPage({
      product,
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
    });

    expect(page).toContain("Curso MVP");
    expect(page).toContain("R$");
    expect(page).toContain("Comprar");
  });

  it("hides inactive products and inactive offers", () => {
    expect(renderPublicProductPage({ product: { ...product, status: "inactive" }, offers: [] })).toBe("Produto indisponível");
    expect(
      renderPublicProductPage({
        product,
        offers: [
          {
            id: "offer_1",
            productId: "product_1",
            name: "Oferta principal",
            priceCents: 19900,
            currency: "BRL",
            status: "inactive",
            allowedPaymentMethods: ["pix"],
            createdAt: "now",
            updatedAt: "now"
          }
        ]
      })
    ).toBe("Produto indisponível");
  });
});
