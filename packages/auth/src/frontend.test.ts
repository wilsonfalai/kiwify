import { describe, expect, it } from "vitest";
import { authSessionHeader, createRouteProtection, getSessionFromHeaders } from "./frontend.js";
import { createAuthSession, serializeAuthSession } from "./session.js";

describe("frontend session helpers", () => {
  it("reads a shared session header", () => {
    const session = createAuthSession({
      id: "user-1",
      email: "buyer@example.com",
      name: "Buyer",
      role: "buyer"
    });
    const headers = new Headers({
      [authSessionHeader]: serializeAuthSession(session)
    });

    expect(getSessionFromHeaders(headers)).toEqual(session);
  });

  it("returns route protection results for authenticated and anonymous users", () => {
    expect(createRouteProtection(null)).toEqual({
      allowed: false,
      redirectTo: "/login"
    });
    expect(
      createRouteProtection(
        createAuthSession({
          id: "user-1",
          email: "buyer@example.com",
          name: "Buyer",
          role: "buyer"
        })
      )
    ).toEqual({ allowed: true });
  });
});
