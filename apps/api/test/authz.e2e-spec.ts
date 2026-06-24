import { authSessionHeader, createAuthSession, serializeAuthSession } from "@kiwifyclone/auth";
import { describe, expect, it } from "vitest";
import { handleApiRequest } from "../src/index.js";

function request(path: string, role: "buyer" | "producer" | "platform_admin") {
  let statusCode = 0;
  let body = "";
  const session = serializeAuthSession(
    createAuthSession({
      id: `${role}-1`,
      email: `${role}@example.com`,
      name: role,
      role
    })
  );

  handleApiRequest(
    {
      method: "GET",
      url: path,
      headers: {
        [authSessionHeader]: session
      }
    } as never,
    {
      writeHead(code: number) {
        statusCode = code;
      },
      end(value: string) {
        body = value;
      }
    } as never
  );

  return { statusCode, body: JSON.parse(body) as Record<string, unknown> };
}

describe("authz integration", () => {
  it("allows producers and platform admins to access producer routes", () => {
    expect(request("/auth/producer", "producer")).toMatchObject({
      statusCode: 200,
      body: { allowed: true, role: "producer" }
    });
    expect(request("/auth/producer", "platform_admin")).toMatchObject({
      statusCode: 200,
      body: { allowed: true, role: "platform_admin" }
    });
  });

  it("blocks buyers from producer routes", () => {
    expect(request("/auth/producer", "buyer")).toMatchObject({
      statusCode: 403,
      body: { error: "forbidden" }
    });
  });

  it("allows only platform admins to access platform admin routes", () => {
    expect(request("/auth/platform-admin", "platform_admin")).toMatchObject({
      statusCode: 200,
      body: { allowed: true, role: "platform_admin" }
    });
    expect(request("/auth/platform-admin", "producer")).toMatchObject({
      statusCode: 403,
      body: { error: "forbidden" }
    });
  });
});
