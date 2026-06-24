import { authSessionHeader, createAuthSession, serializeAuthSession } from "@kiwifyclone/auth";
import { describe, expect, it } from "vitest";
import { handleApiRequest } from "../src/index.js";

interface TestResponse {
  statusCode: number;
  headers: Map<string, string | number>;
  body: string;
}

function request(path: string, headers: Record<string, string> = {}): TestResponse {
  const result: TestResponse = {
    statusCode: 0,
    headers: new Map<string, string | number>(),
    body: ""
  };
  const req = {
    method: "GET",
    url: path,
    headers
  };
  const res = {
    writeHead(code: number, values: Record<string, string | number>) {
      result.statusCode = code;
      for (const [key, value] of Object.entries(values)) {
        result.headers.set(key, value);
      }
    },
    end(value: string) {
      result.body = value;
    }
  };

  handleApiRequest(req as never, res as never);

  return result;
}

function sessionHeader(role: "buyer" | "producer" | "platform_admin") {
  return {
    [authSessionHeader]: serializeAuthSession(
      createAuthSession({
        id: `${role}-1`,
        email: `${role}@example.com`,
        name: role,
        role
      })
    )
  };
}

describe("auth integration", () => {
  it("requires a valid session for protected endpoints", () => {
    const response = request("/auth/session");

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({ error: "unauthorized" });
  });

  it("returns the authenticated user session", () => {
    const response = request("/auth/session", sessionHeader("buyer"));

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      user: {
        id: "buyer-1",
        email: "buyer@example.com",
        role: "buyer"
      }
    });
  });
});
