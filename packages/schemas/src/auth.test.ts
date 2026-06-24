import { describe, expect, it } from "vitest";
import { authRoleValues, isAuthUserDto } from "./auth.js";

describe("auth schemas", () => {
  it("exports the required auth roles", () => {
    expect(authRoleValues).toEqual(["buyer", "producer", "platform_admin"]);
  });

  it("validates auth user DTO shape", () => {
    expect(
      isAuthUserDto({
        id: "user-1",
        name: "User",
        email: "user@example.com",
        role: "producer"
      })
    ).toBe(true);
    expect(
      isAuthUserDto({
        id: "user-1",
        name: "User",
        email: "user@example.com",
        role: "owner"
      })
    ).toBe(false);
  });
});
