import type { ServerResponse } from "node:http";

export interface RequestWithBody {
  body?: unknown;
}

export function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  const payload = JSON.stringify(body);

  response.writeHead(statusCode, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(payload)
  });
  response.end(payload);
}

export function readBody<T>(request: unknown): T {
  return (request as RequestWithBody).body as T;
}
