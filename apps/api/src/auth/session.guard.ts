import { authSessionHeader, parseAuthSessionHeader, roleCanAccess, type AuthRole, type AuthSession } from "@kiwifyclone/auth";
import type { IncomingMessage } from "node:http";

export interface AuthGuardResult {
  ok: true;
  session: AuthSession;
}

export interface AuthGuardFailure {
  ok: false;
  statusCode: 401 | 403;
  error: "unauthorized" | "forbidden";
}

export function readSessionFromRequest(request: IncomingMessage): AuthSession | null {
  const header = request.headers[authSessionHeader];
  const value = Array.isArray(header) ? header[0] : header;

  return parseAuthSessionHeader(value);
}

export function requireSession(request: IncomingMessage): AuthGuardResult | AuthGuardFailure {
  const session = readSessionFromRequest(request);

  if (!session) {
    return {
      ok: false,
      statusCode: 401,
      error: "unauthorized"
    };
  }

  return {
    ok: true,
    session
  };
}

export function requireRole(request: IncomingMessage, allowedRoles: readonly AuthRole[]): AuthGuardResult | AuthGuardFailure {
  const result = requireSession(request);

  if (!result.ok) {
    return result;
  }

  if (!roleCanAccess(result.session.user.role, allowedRoles)) {
    return {
      ok: false,
      statusCode: 403,
      error: "forbidden"
    };
  }

  return result;
}
