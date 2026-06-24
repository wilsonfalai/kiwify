import { parseAuthSessionHeader, type AuthSession } from "./session.js";

export const authSessionHeader = "x-kiwifyclone-session";

export interface HeaderReader {
  get(name: string): string | null;
}

export function getSessionFromHeaders(headers: HeaderReader): AuthSession | null {
  return parseAuthSessionHeader(headers.get(authSessionHeader) ?? undefined);
}

export interface RouteProtectionResult {
  allowed: boolean;
  redirectTo?: string;
}

export function createRouteProtection(session: AuthSession | null, redirectTo = "/login"): RouteProtectionResult {
  if (!session) {
    return {
      allowed: false,
      redirectTo
    };
  }

  return { allowed: true };
}
