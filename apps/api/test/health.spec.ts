import { describe, expect, it } from "vitest";
import { handleApiRequest } from "../src/index.js";

describe("GET /health", () => {
  it("returns ok status", async () => {
    let statusCode = 0;
    let body = "";
    const headers = new Map<string, string | number>();

    const request = {
      method: "GET",
      url: "/health"
    };
    const response = {
      writeHead(code: number, values: Record<string, string | number>) {
        statusCode = code;
        for (const [key, value] of Object.entries(values)) {
          headers.set(key, value);
        }
      },
      end(value: string) {
        body = value;
      }
    };

    handleApiRequest(request as never, response as never);

    expect(statusCode).toBe(200);
    expect(headers.get("content-type")).toBe("application/json");
    expect(JSON.parse(body)).toEqual({
      status: "ok",
      service: "api"
    });
  });
});
