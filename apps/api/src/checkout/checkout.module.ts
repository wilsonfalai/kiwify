import type { IncomingMessage, ServerResponse } from "node:http";
import { handleCardRequest } from "./card.controller.js";
import { handleCheckoutRequest } from "./checkout.controller.js";
import { handlePixRequest } from "./pix.controller.js";

export async function handleCheckoutModuleRequest(
  request: IncomingMessage,
  response: ServerResponse
): Promise<boolean> {
  if (await handleCheckoutRequest(request, response)) {
    return true;
  }

  if (await handlePixRequest(request, response)) {
    return true;
  }

  return handleCardRequest(request, response);
}

export * from "./card.controller.js";
export * from "./checkout.controller.js";
export * from "./pix.controller.js";
