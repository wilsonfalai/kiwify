import type { ServerResponse } from "node:http";

export interface RequestWithBody {
  body?: unknown;
}

export function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  const payload = JSON.stringify(body);

  response.writeHead(statusCode, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(payload),
    "access-control-allow-origin": "*"
  });
  response.end(payload);
}

export function readBody<T>(request: unknown): T {
  return (request as RequestWithBody).body as T;
}

export async function readJsonBody<T>(request: unknown): Promise<T> {
  const injectedBody = (request as RequestWithBody).body;

  if (injectedBody !== undefined) {
    return injectedBody as T;
  }

  const incoming = request as AsyncIterable<Uint8Array>;
  const chunks: Uint8Array[] = [];

  for await (const chunk of incoming) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");

  if (!raw) {
    return {} as T;
  }

  return JSON.parse(raw) as T;
}
