import { describe, expect, it, vi } from "vitest";
import { AsaasPaymentProvider } from "./asaas-payment-provider.js";
import { PaymentProviderError } from "./payment-provider.js";

function providerWith(fetchMock: typeof fetch, timeoutMs = 50): AsaasPaymentProvider {
  return new AsaasPaymentProvider({
    apiKey: "asaas_secret",
    baseUrl: "https://api-sandbox.asaas.com/v3",
    fetch: fetchMock,
    timeoutMs
  });
}

describe("AsaasPaymentProvider errors", () => {
  it("turns HTTP errors into safe provider failures", async () => {
    const provider = providerWith(
      vi.fn(async () =>
        new Response(JSON.stringify({ errors: [{ description: "card 4111111111111111 cvv 123" }] }), {
          status: 400
        })
      ) as typeof fetch
    );

    const promise = provider.createCreditCardCharge({
      externalCustomerId: "cus_1",
      amountCents: 19990,
      dueDate: "2026-08-01",
      externalReference: "order_refused",
      card: {
        number: "4111111111111111",
        holderName: "BUYER",
        expiryMonth: "12",
        expiryYear: "2030",
        ccv: "123"
      },
      holderInfo: {
        name: "Buyer",
        email: "buyer@example.com",
        document: "24971563792",
        postalCode: "01310000",
        addressNumber: "100"
      },
      remoteIp: "203.0.113.10"
    });

    await expect(promise).rejects.toMatchObject({
      name: "PaymentProviderError",
      code: "asaas_request_failed"
    });
    await expect(promise).rejects.not.toThrow(/4111111111111111|123/);
  });

  it("rejects malformed provider responses", async () => {
    const provider = providerWith(
      vi.fn(async () => new Response("not-json", { status: 200 })) as typeof fetch
    );

    await expect(
      provider.createCustomer({
        name: "Buyer",
        email: "buyer@example.com",
        document: "24971563792"
      })
    ).rejects.toMatchObject({
      code: "asaas_invalid_response"
    });
  });

  it("normalizes communication failures and timeout", async () => {
    const networkProvider = providerWith(
      vi.fn(async () => {
        throw new Error("socket exposed secret");
      }) as typeof fetch
    );

    await expect(
      networkProvider.createCustomer({
        name: "Buyer",
        email: "buyer@example.com",
        document: "24971563792"
      })
    ).rejects.toMatchObject({
      code: "asaas_unavailable"
    });

    const timeoutFetch = vi.fn(
      (_input: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        })
    ) as typeof fetch;
    const timeoutProvider = providerWith(timeoutFetch, 5);

    await expect(
      timeoutProvider.createCustomer({
        name: "Buyer",
        email: "buyer@example.com",
        document: "24971563792"
      })
    ).rejects.toEqual(
      expect.objectContaining<Partial<PaymentProviderError>>({
        code: "asaas_timeout"
      })
    );
  });
});
