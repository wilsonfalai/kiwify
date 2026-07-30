import type { IncomingMessage, ServerResponse } from "node:http";
import { sendJson } from "../http.js";
import { paymentsService } from "../payments/payments.service.js";
import { sendCheckoutError } from "./checkout.errors.js";

export async function handlePixRequest(
  request: IncomingMessage,
  response: ServerResponse
): Promise<boolean> {
  const match = (request.url ?? "").match(
    /^\/checkout\/orders\/([^/?]+)\/payments\/pix$/
  );

  if (request.method !== "POST" || !match) {
    return false;
  }

  try {
    sendJson(
      response,
      201,
      await paymentsService.createPixPayment(decodeURIComponent(match[1]))
    );
  } catch (error) {
    sendCheckoutError(response, error);
  }

  return true;
}
