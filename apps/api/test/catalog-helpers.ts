import { authSessionHeader, createAuthSession, serializeAuthSession, type AuthRole } from "@kiwifyclone/auth";
import { productsRepository } from "../src/products/products.repository.js";
import { handleApiRequest } from "../src/index.js";

export interface ApiTestResponse {
  statusCode: number;
  body: Record<string, unknown>;
}

export function resetCatalog(): void {
  productsRepository.reset();
}

export function authHeaders(role: AuthRole = "producer", id = `${role}_1`): Record<string, string> {
  return {
    [authSessionHeader]: serializeAuthSession(
      createAuthSession({
        id,
        email: `${id}@example.com`,
        name: id,
        role
      })
    )
  };
}

export function apiRequest(
  method: string,
  url: string,
  options: { headers?: Record<string, string>; body?: unknown } = {}
): ApiTestResponse {
  let statusCode = 0;
  let rawBody = "";

  handleApiRequest(
    {
      method,
      url,
      headers: options.headers ?? {},
      body: options.body
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

export function createProduct(status: "draft" | "active" | "inactive" = "active") {
  return apiRequest("POST", "/producer/products", {
    headers: authHeaders("producer", "producer_1"),
    body: {
      title: `Curso ${status}`,
      slug: `curso-${status}-${Date.now()}`,
      description: "Curso completo",
      status
    }
  }).body;
}
