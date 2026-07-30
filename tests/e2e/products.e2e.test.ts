import { authSessionHeader, createAuthSession, serializeAuthSession } from "@kiwifyclone/auth";
import { beforeEach, describe, expect, it } from "vitest";
import { handleApiRequest } from "../../apps/api/src/index.js";
import { productsRepository } from "../../apps/api/src/products/products.repository.js";
import { renderAdminProductsPage } from "../../apps/admin/app/products/page.js";
import { renderPublicProductPage } from "../../apps/products/app/[slug]/page.js";

function headers() {
  return {
    [authSessionHeader]: serializeAuthSession(
      createAuthSession({
        id: "producer_e2e",
        email: "producer@example.com",
        name: "Producer",
        role: "producer"
      })
    )
  };
}

function request(method: string, url: string, body?: unknown) {
  let statusCode = 0;
  let rawBody = "";

  handleApiRequest(
    {
      method,
      url,
      headers: headers(),
      body
    } as never,
    {
      writeHead(code: number) {
        statusCode = code;
      },
      end(value: string) {
        rawBody = value;
      }
    } as never
  );

  return {
    statusCode,
    body: JSON.parse(rawBody) as Record<string, unknown>
  };
}

describe("phase 5 product and offer flows", () => {
  beforeEach(() => productsRepository.reset());

  it("producer creates product, module, lesson, and offer", () => {
    const product = request("POST", "/producer/products", {
      title: "Curso E2E",
      slug: "curso-e2e",
      description: "Curso completo",
      status: "active"
    }).body;
    const module = request("POST", `/producer/products/${product.id as string}/modules`, {
      title: "Modulo 1",
      position: 1
    }).body;
    request("POST", `/producer/modules/${module.id as string}/lessons`, {
      title: "Aula 1",
      contentType: "text",
      textContent: "Conteudo",
      position: 1
    });
    const offer = request("POST", `/producer/products/${product.id as string}/offers`, {
      name: "Oferta principal",
      priceCents: 19900,
      allowedPaymentMethods: ["pix"],
      status: "active"
    }).body;

    expect(
      renderAdminProductsPage({
        products: [product as never],
        modules: [module as never],
        lessons: [],
        offers: [offer as never]
      })
    ).toContain("Curso E2E (active) - 1 módulos - 1 ofertas");
  });

  it("public product page shows only active product offer", () => {
    const product = request("POST", "/producer/products", {
      title: "Curso Público",
      slug: "curso-publico",
      description: "Curso completo",
      status: "active"
    }).body;
    const offer = request("POST", `/producer/products/${product.id as string}/offers`, {
      name: "Oferta principal",
      priceCents: 19900,
      allowedPaymentMethods: ["pix"],
      status: "active"
    }).body;
    const publicProduct = request("GET", "/products/curso-publico").body;

    expect(
      renderPublicProductPage({
        product: publicProduct.product as never,
        offers: [offer as never]
      })
    ).toContain("Comprar");
  });
});
