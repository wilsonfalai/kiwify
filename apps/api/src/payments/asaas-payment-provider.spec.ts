import { describe, expect, it, vi } from "vitest";
import { AsaasPaymentProvider } from "./asaas-payment-provider.js";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

describe("AsaasPaymentProvider", () => {
  it("creates a customer and returns only its external identifier", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        id: "cus_1",
        name: "Buyer",
        apiKey: "must-not-leak"
      })
    );
    const provider = new AsaasPaymentProvider({
      apiKey: "asaas_secret",
      baseUrl: "https://api-sandbox.asaas.com/v3",
      fetch: fetchMock as typeof fetch
    });

    await expect(
      provider.createCustomer({
        name: "Buyer",
        email: "buyer@example.com",
        document: "24971563792",
        phone: "11999999999",
        externalReference: "buyer_1"
      })
    ).resolves.toEqual({ externalCustomerId: "cus_1" });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api-sandbox.asaas.com/v3/customers");
    expect(init.headers).toMatchObject({ access_token: "asaas_secret" });
    expect(JSON.parse(init.body as string)).toMatchObject({
      name: "Buyer",
      email: "buyer@example.com",
      cpfCnpj: "24971563792",
      mobilePhone: "11999999999",
      externalReference: "buyer_1"
    });
  });

  it("creates a Pix charge and retrieves safe QR Code instructions", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: "pay_pix", status: "PENDING", billingType: "PIX" }))
      .mockResolvedValueOnce(
        jsonResponse({
          encodedImage: "base64-image",
          payload: "pix-copy-and-paste",
          expirationDate: "2026-08-02"
        })
      );
    const provider = new AsaasPaymentProvider({
      apiKey: "asaas_secret",
      baseUrl: "https://api-sandbox.asaas.com/v3",
      fetch: fetchMock as typeof fetch
    });

    await expect(
      provider.createPixCharge({
        externalCustomerId: "cus_1",
        amountCents: 19990,
        dueDate: "2026-08-01",
        externalReference: "order_1",
        description: "Curso"
      })
    ).resolves.toEqual({
      externalChargeId: "pay_pix",
      externalStatus: "PENDING",
      status: "pending",
      pix: {
        encodedImage: "base64-image",
        payload: "pix-copy-and-paste",
        expirationDate: "2026-08-02"
      }
    });

    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "https://api-sandbox.asaas.com/v3/payments/pay_pix/pixQrCode"
    );
  });

  it("submits transient card data but returns only safe charge fields", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        id: "pay_card",
        status: "CONFIRMED",
        billingType: "CREDIT_CARD",
        creditCardNumber: "1111",
        creditCardToken: "token_must_not_leak"
      })
    );
    const provider = new AsaasPaymentProvider({
      apiKey: "asaas_secret",
      baseUrl: "https://api-sandbox.asaas.com/v3",
      fetch: fetchMock as typeof fetch
    });

    const result = await provider.createCreditCardCharge({
      externalCustomerId: "cus_1",
      amountCents: 19990,
      dueDate: "2026-08-01",
      externalReference: "order_1",
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
        addressNumber: "100",
        phone: "11999999999"
      },
      remoteIp: "203.0.113.10"
    });

    expect(result).toEqual({
      externalChargeId: "pay_card",
      externalStatus: "CONFIRMED",
      status: "approved"
    });
    expect(JSON.stringify(result)).not.toContain("4111111111111111");
    expect(JSON.stringify(result)).not.toContain("123");
    expect(JSON.stringify(result)).not.toContain("token_must_not_leak");

    const [, cardRequestInit] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const requestBody = JSON.parse(cardRequestInit.body as string);
    expect(requestBody).toMatchObject({
      billingType: "CREDIT_CARD",
      creditCard: { number: "4111111111111111", ccv: "123" },
      creditCardHolderInfo: { cpfCnpj: "24971563792" },
      remoteIp: "203.0.113.10"
    });
  });

  it("parses a webhook into a safe provider-neutral event", () => {
    const provider = new AsaasPaymentProvider({
      apiKey: "asaas_secret",
      baseUrl: "https://api-sandbox.asaas.com/v3",
      fetch: vi.fn() as typeof fetch
    });

    const result = provider.parseWebhook({
      id: "evt_1",
      event: "PAYMENT_RECEIVED",
      payment: {
        id: "pay_1",
        status: "RECEIVED",
        billingType: "PIX",
        value: 199.9,
        externalReference: "order_1",
        creditCard: {
          number: "4111111111111111",
          ccv: "123"
        }
      },
      accessToken: "must-not-leak"
    });

    expect(result).toEqual({
      externalEventId: "evt_1",
      eventType: "PAYMENT_RECEIVED",
      externalChargeId: "pay_1",
      externalStatus: "RECEIVED",
      status: "approved",
      paymentMethod: "pix",
      amountCents: 19990,
      externalReference: "order_1"
    });
    expect(JSON.stringify(result)).not.toMatch(/4111111111111111|123|must-not-leak/);
  });
});
