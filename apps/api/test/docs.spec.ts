import { describe, expect, it } from "vitest";
import { handleApiRequest } from "../src/index.js";

interface TestResponse {
  statusCode: number;
  headers: Map<string, string | number>;
  body: string;
}

function get(path: string): TestResponse {
  const result: TestResponse = {
    statusCode: 0,
    headers: new Map<string, string | number>(),
    body: ""
  };

  handleApiRequest(
    {
      method: "GET",
      url: path,
      headers: {}
    } as never,
    {
      writeHead(code: number, headers: Record<string, string | number>) {
        result.statusCode = code;
        for (const [key, value] of Object.entries(headers)) {
          result.headers.set(key, value);
        }
      },
      end(body: string) {
        result.body = body;
      }
    } as never
  );

  return result;
}

describe("API documentation", () => {
  it("serves the current runtime contract as OpenAPI JSON", () => {
    const response = get("/openapi.json");
    const document = JSON.parse(response.body) as {
      openapi: string;
      paths: Record<string, Record<string, unknown>>;
    };

    expect(response.statusCode).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(document.openapi).toBe("3.1.0");
    expect(document.paths["/health"]?.get).toBeDefined();
    expect(document.paths["/producer/products/{productId}"]?.patch).toBeDefined();
    expect(document.paths["/checkout/orders"]).toBeUndefined();
  });

  it.each(["/docs", "/docs/"])("serves Scalar at %s", (path) => {
    const response = get(path);

    expect(response.statusCode).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/html; charset=utf-8");
    expect(response.body).toContain("@scalar/api-reference");
    expect(response.body).toContain('url: "/openapi.json"');
  });
});
