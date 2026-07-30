import type { IncomingMessage, ServerResponse } from "node:http";
import type { CreateOrderInput } from "@kiwifyclone/schemas";
import { readJsonBody, sendJson } from "../http.js";
import { ordersService } from "../orders/orders.service.js";
import { sendCheckoutError } from "./checkout.errors.js";

export async function handleCheckoutRequest(
  request: IncomingMessage,
  response: ServerResponse
): Promise<boolean> {
  const method = request.method;
  const url = request.url ?? "";
  const start = url.match(/^\/checkout\/offers\/([^/?]+)$/);

  if (method === "GET" && start) {
    try {
      sendJson(response, 200, ordersService.startCheckout(decodeURIComponent(start[1])));
    } catch (error) {
      sendCheckoutError(response, error);
    }

    return true;
  }

  if (method === "POST" && url === "/checkout/orders") {
    try {
      const result = ordersService.createOrder(await readJsonBody<CreateOrderInput>(request));
      sendJson(response, 201, result);
    } catch (error) {
      sendCheckoutError(response, error);
    }

    return true;
  }

  const status = url.match(/^\/checkout\/orders\/([^/?]+)$/);

  if (method === "GET" && status) {
    try {
      sendJson(response, 200, ordersService.getOrderStatus(decodeURIComponent(status[1])));
    } catch (error) {
      sendCheckoutError(response, error);
    }

    return true;
  }

  return false;
}
