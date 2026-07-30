import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { handleAuthRequest } from "./auth/auth.controller.js";
import { handleCheckoutModuleRequest } from "./checkout/checkout.module.js";
import { handleDocsRequest } from "./docs/docs.controller.js";
import { healthResponse } from "./health/health.controller.js";
import { readJsonBody, sendJson, type RequestWithBody } from "./http.js";
import { handleOffersRequest } from "./offers/offers.controller.js";
import { handleProductsRequest } from "./products/products.controller.js";

export const appName = "api";

export async function handleApiRequest(request: IncomingMessage, response: ServerResponse) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
      "access-control-allow-headers": "content-type,x-kiwifyclone-session"
    });
    response.end();
    return;
  }

  if (handleDocsRequest(request, response)) {
    return;
  }

  if (handleAuthRequest(request, response)) {
    return;
  }

  if (handleProductsRequest(request, response)) {
    return;
  }

  if (handleOffersRequest(request, response)) {
    return;
  }

  if (request.url === "/health" && request.method === "GET") {
    const body = JSON.stringify(healthResponse());

    response.writeHead(200, {
      "content-type": "application/json",
      "content-length": Buffer.byteLength(body)
    });
    response.end(body);
    return;
  }

  if ((request.url ?? "").startsWith("/checkout/")) {
    if (await handleCheckoutModuleRequest(request, response)) {
      return;
    }
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "not_found" }));
}

export function createApiServer() {
  return createServer((request, response) => {
    void (async () => {
      try {
        if (["POST", "PATCH", "PUT"].includes(request.method ?? "")) {
          (request as IncomingMessage & RequestWithBody).body =
            await readJsonBody<unknown>(request);
        }

        await handleApiRequest(request, response);
      } catch (error) {
        if (!response.headersSent) {
          sendJson(response, 400, {
            error: error instanceof SyntaxError ? "invalid_json" : "invalid_request"
          });
        }
      }
    })();
  });
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 3001);
  const server = createApiServer();

  server.listen(port, () => {
    console.log(`api listening on ${port}`);
  });
}
