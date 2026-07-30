import { ordersRepository } from "../src/orders/orders.repository.js";
import { handleApiRequest } from "../src/index.js";
import { apiRequest, authHeaders, resetCatalog } from "./catalog-helpers.js";

export interface AsyncApiTestResponse {
  statusCode: number;
  body: Record<string, unknown>;
}

export async function checkoutRequest(
  method: string,
  url: string,
  body?: unknown
): Promise<AsyncApiTestResponse> {
  let statusCode = 0;
  let rawBody = "";

  await handleApiRequest(
    {
      method,
      url,
      headers: {
        "content-type": "application/json"
      },
      body
    } as never,
    {
      writeHead(code: number) {
        statusCode = code;
      },
      end(value = "") {
        rawBody = value;
      }
    } as never
  );

  return {
    statusCode,
    body: rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {}
  };
}

export function resetCheckout(): void {
  resetCatalog();
  ordersRepository.reset();
}

export function seedOffer(
  allowedPaymentMethods: Array<"pix" | "credit_card"> = ["pix", "credit_card"],
  status: "active" | "inactive" = "active"
) {
  const product = apiRequest("POST", "/producer/products", {
    headers: authHeaders("producer", "producer_checkout"),
    body: {
      title: "Curso Checkout",
      slug: `curso-checkout-${Date.now()}`,
      description: "Aprenda no seu ritmo",
      status: "active"
    }
  }).body;
  const offer = apiRequest(
    "POST",
    `/producer/products/${product.id as string}/offers`,
    {
      headers: authHeaders("producer", "producer_checkout"),
      body: {
        name: "Acesso completo",
        priceCents: 14900,
        allowedPaymentMethods,
        status
      }
    }
  ).body;

  return { product, offer };
}

export const checkoutCustomer = {
  name: "Maria Compradora",
  email: "maria@example.com",
  document: "24971563792",
  phone: "11999999999"
};

export const checkoutCard = {
  number: "4111111111111111",
  holderName: "MARIA COMPRADORA",
  expiryMonth: "12",
  expiryYear: "2030",
  ccv: "123",
  postalCode: "01310000",
  addressNumber: "100"
};
