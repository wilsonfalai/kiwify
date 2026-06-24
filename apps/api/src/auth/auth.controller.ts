import type { IncomingMessage, ServerResponse } from "node:http";
import { requireRole, requireSession, type AuthGuardFailure } from "./session.guard.js";

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  const payload = JSON.stringify(body);

  response.writeHead(statusCode, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(payload)
  });
  response.end(payload);
}

function sendGuardFailure(response: ServerResponse, failure: AuthGuardFailure): void {
  sendJson(response, failure.statusCode, { error: failure.error });
}

export function handleAuthRequest(request: IncomingMessage, response: ServerResponse): boolean {
  if (request.url === "/auth/session" && request.method === "GET") {
    const result = requireSession(request);

    if (!result.ok) {
      sendGuardFailure(response, result);
      return true;
    }

    sendJson(response, 200, {
      user: result.session.user
    });
    return true;
  }

  if (request.url === "/auth/producer" && request.method === "GET") {
    const result = requireRole(request, ["producer", "platform_admin"]);

    if (!result.ok) {
      sendGuardFailure(response, result);
      return true;
    }

    sendJson(response, 200, {
      allowed: true,
      role: result.session.user.role
    });
    return true;
  }

  if (request.url === "/auth/platform-admin" && request.method === "GET") {
    const result = requireRole(request, ["platform_admin"]);

    if (!result.ok) {
      sendGuardFailure(response, result);
      return true;
    }

    sendJson(response, 200, {
      allowed: true,
      role: result.session.user.role
    });
    return true;
  }

  return false;
}
