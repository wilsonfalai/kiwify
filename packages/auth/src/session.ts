import { isAuthRole, type AuthRole } from "./roles.js";

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
}

export interface AuthSession {
  user: AuthSessionUser;
}

export function createAuthSession(user: AuthSessionUser): AuthSession {
  return { user };
}

export function parseAuthSessionHeader(value: string | undefined): AuthSession | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<AuthSession>;
    const user = parsed.user;

    if (!user || typeof user.id !== "string" || typeof user.email !== "string" || typeof user.name !== "string") {
      return null;
    }

    if (!isAuthRole(user.role)) {
      return null;
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch {
    return null;
  }
}

export function serializeAuthSession(session: AuthSession): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}
