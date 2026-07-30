import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { handleAuthRequest } from "./auth/auth.controller.js";
import { handleDocsRequest } from "./docs/docs.controller.js";
import { healthResponse } from "./health/health.controller.js";
import { handleOffersRequest } from "./offers/offers.controller.js";
import { handleProductsRequest } from "./products/products.controller.js";

export const appName = "api";

export function handleApiRequest(request: IncomingMessage, response: ServerResponse) {
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

  response.writeHead(404, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "not_found" }));
}

export function createApiServer() {
  return createServer(handleApiRequest);
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 3001);
  const server = createApiServer();

  server.listen(port, () => {
    console.log(`api listening on ${port}`);
  });
}
