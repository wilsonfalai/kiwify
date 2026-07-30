import { describe, expect, it } from "vitest";
import { createAuthConfig } from "./config.js";

describe("auth config", () => {
  it("requires Better Auth secret and URL", () => {
    expect(() => createAuthConfig({})).toThrow("BETTER_AUTH_SECRET is required");
    expect(() => createAuthConfig({ BETTER_AUTH_SECRET: "secret" })).toThrow("BETTER_AUTH_URL is required");
  });

  it("configures Better Auth with email/password and role metadata", () => {
    const config = createAuthConfig({
      BETTER_AUTH_SECRET: "test-secret",
      BETTER_AUTH_URL: "http://localhost:3001"
    });

    expect(config.options.emailAndPassword).toEqual({ enabled: true });
    expect(config.roles).toEqual(["buyer", "producer", "platform_admin"]);
    expect(config.options.user?.additionalFields?.role).toMatchObject({
      type: "string",
      required: true,
      defaultValue: "buyer",
      input: false
    });
  });
});
