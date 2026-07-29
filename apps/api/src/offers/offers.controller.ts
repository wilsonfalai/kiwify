import type { IncomingMessage, ServerResponse } from "node:http";
import { requireRole } from "../auth/session.guard.js";
import { readBody, sendJson } from "../http.js";
import { offerEligibilityService } from "./offer-eligibility.service.js";
import { offersService } from "./offers.service.js";

export function handleOffersRequest(request: IncomingMessage, response: ServerResponse): boolean {
  const method = request.method;
  const url = request.url ?? "";
  const offerPost = url.match(/^\/producer\/products\/([^/]+)\/offers$/);

  if (method === "POST" && offerPost) {
    const auth = requireRole(request, ["producer", "platform_admin"]);

    if (!auth.ok) {
      sendJson(response, auth.statusCode, { error: auth.error });
      return true;
    }

    try {
      sendJson(response, 201, offersService.createOffer(auth.session.user.id, offerPost[1], readBody(request)));
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : "invalid_offer" });
    }

    return true;
  }

  const eligibility = url.match(/^\/offers\/([^/]+)\/eligibility\?method=([^&]+)$/);
  if (method === "GET" && eligibility) {
    sendJson(response, 200, offerEligibilityService.check(eligibility[1], eligibility[2] as never));
    return true;
  }

  return false;
}
