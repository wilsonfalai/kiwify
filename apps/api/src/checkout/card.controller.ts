import type { IncomingMessage, ServerResponse } from "node:http";
import type { CreditCardPaymentRequest } from "@kiwifyclone/schemas";
import { readJsonBody, sendJson } from "../http.js";
import { paymentsService } from "../payments/payments.service.js";
import { sendCheckoutError } from "./checkout.errors.js";

export async function handleCardRequest(
  request: IncomingMessage,
  response: ServerResponse
): Promise<boolean> {
  const match = (request.url ?? "").match(
    /^\/checkout\/orders\/([^/?]+)\/payments\/credit-card$/
  );

  if (request.method !== "POST" || !match) {
    return false;
  }

  try {
    const input = await readJsonBody<CreditCardPaymentRequest>(request);
    sendJson(
      response,
      201,
      await paymentsService.createCreditCardPayment(decodeURIComponent(match[1]), input)
    );
  } catch (error) {
    sendCheckoutError(response, error);
  }

  return true;
}
