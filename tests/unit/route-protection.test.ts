import { authSessionHeader, createAuthSession, serializeAuthSession } from "@kiwifyclone/auth";
import { describe, expect, it } from "vitest";
import { middleware as adminMiddleware } from "../../apps/admin/middleware.js";
import { checkoutRouteProtection } from "../../apps/checkout/proxy.js";
import { middleware as membersMiddleware } from "../../apps/members/middleware.js";

function headersWithSession(role: "buyer" | "producer" | "platform_admin") {
  return new Headers({
    [authSessionHeader]: serializeAuthSession(
      createAuthSession({
        id: `${role}-1`,
        email: `${role}@example.com`,
        name: role,
        role
      })
    )
  });
}

describe("route protection", () => {
  it("blocks anonymous users from private frontend surfaces", () => {
    expect(adminMiddleware({ headers: new Headers() })).toEqual({ allowed: false, redirectTo: "/login" });
    expect(membersMiddleware({ headers: new Headers() })).toEqual({ allowed: false, redirectTo: "/login" });
    expect(checkoutRouteProtection({ headers: new Headers() })).toEqual({ allowed: false, redirectTo: "/login" });
  });

  it("allows authenticated users through private frontend middleware", () => {
    expect(adminMiddleware({ headers: headersWithSession("platform_admin") })).toEqual({ allowed: true });
    expect(membersMiddleware({ headers: headersWithSession("buyer") })).toEqual({ allowed: true });
    expect(checkoutRouteProtection({ headers: headersWithSession("buyer") })).toEqual({ allowed: true });
  });
});
