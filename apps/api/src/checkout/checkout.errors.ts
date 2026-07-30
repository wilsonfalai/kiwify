import { PaymentProviderError } from "../payments/payment-provider.js";
import { CheckoutDomainError } from "../orders/orders.service.js";
import { sendJson } from "../http.js";
import type { ServerResponse } from "node:http";
import { ZodError } from "zod";

export function sendCheckoutError(response: ServerResponse, error: unknown): void {
  if (error instanceof ZodError) {
    sendJson(response, 400, {
      error: "invalid_checkout_input",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  if (error instanceof CheckoutDomainError) {
    const statusCode = error.code === "order_not_found" ? 404 : 409;
    sendJson(response, statusCode, { error: error.code });
    return;
  }

  if (error instanceof PaymentProviderError) {
    sendJson(response, 502, { error: error.code });
    return;
  }

  if (error instanceof SyntaxError) {
    sendJson(response, 400, { error: "invalid_json" });
    return;
  }

  sendJson(response, 500, { error: "checkout_failed" });
}
