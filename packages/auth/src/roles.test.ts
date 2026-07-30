import { describe, expect, it } from "vitest";
import { hasPermission, isAuthRole, roleCanAccess } from "./roles.js";

describe("auth roles", () => {
  it("recognizes supported roles only", () => {
    expect(isAuthRole("buyer")).toBe(true);
    expect(isAuthRole("producer")).toBe(true);
    expect(isAuthRole("platform_admin")).toBe(true);
    expect(isAuthRole("owner")).toBe(false);
  });

  it("separates buyer, producer, and platform admin permissions", () => {
    expect(hasPermission("buyer", "members:read")).toBe(true);
    expect(hasPermission("buyer", "producer:manage-products")).toBe(false);
    expect(hasPermission("producer", "producer:manage-products")).toBe(true);
    expect(hasPermission("platform_admin", "producer:manage-products")).toBe(true);
  });

  it("checks role access lists", () => {
    expect(roleCanAccess("producer", ["producer", "platform_admin"])).toBe(true);
    expect(roleCanAccess("buyer", ["producer", "platform_admin"])).toBe(false);
  });
});
