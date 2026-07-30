import type { IncomingMessage, ServerResponse } from "node:http";
import { runtimeOpenApiDocument } from "./openapi.js";

const scalarHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>KiwifyClone API — Documentação</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      Scalar.createApiReference("#app", {
        url: "/openapi.json",
        theme: "purple",
        pageTitle: "KiwifyClone API"
      })
    </script>
  </body>
</html>`;

function send(response: ServerResponse, statusCode: number, contentType: string, body: string): void {
  response.writeHead(statusCode, {
    "content-type": contentType,
    "content-length": Buffer.byteLength(body)
  });
  response.end(body);
}

export function handleDocsRequest(request: IncomingMessage, response: ServerResponse): boolean {
  if (request.method !== "GET") {
    return false;
  }

  if (request.url === "/openapi.json") {
    send(response, 200, "application/json", JSON.stringify(runtimeOpenApiDocument));
    return true;
  }

  if (request.url === "/docs" || request.url === "/docs/") {
    send(response, 200, "text/html; charset=utf-8", scalarHtml);
    return true;
  }

  return false;
}
