import { describe, expect, it } from "vitest";
import { parsePaymentsEnv } from "./payments.env.js";

describe("payments environment", () => {
  it("allows local fake mode without Asaas credentials", () => {
    expect(
      parsePaymentsEnv({
        ASAAS_ENVIRONMENT: "local-fake",
        ASAAS_BASE_URL: "https://api-sandbox.asaas.com/v3"
      })
    ).toEqual({
      environment: "local-fake",
      baseUrl: "https://api-sandbox.asaas.com/v3",
      apiKey: undefined
    });
  });

  it("requires a secure Asaas configuration outside fake mode", () => {
    expect(() =>
      parsePaymentsEnv({
        ASAAS_ENVIRONMENT: "sandbox",
        ASAAS_BASE_URL: "https://api-sandbox.asaas.com/v3"
      })
    ).toThrow("ASAAS_API_KEY is required");

    expect(() =>
      parsePaymentsEnv({
        ASAAS_ENVIRONMENT: "production",
        ASAAS_BASE_URL: "http://api.asaas.com/v3",
        ASAAS_API_KEY: "secret"
      })
    ).toThrow("ASAAS_BASE_URL must use HTTPS");
  });

  it("rejects unsupported environments and invalid URLs", () => {
    expect(() => parsePaymentsEnv({ ASAAS_ENVIRONMENT: "staging" })).toThrow(
      "ASAAS_ENVIRONMENT must be local-fake, sandbox, or production"
    );
    expect(() =>
      parsePaymentsEnv({
        ASAAS_ENVIRONMENT: "sandbox",
        ASAAS_BASE_URL: "not-a-url",
        ASAAS_API_KEY: "secret"
      })
    ).toThrow("ASAAS_BASE_URL must be a valid URL");
  });
});
