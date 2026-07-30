import { authSessionHeader, createAuthSession, serializeAuthSession, type AuthRole } from "@kiwifyclone/auth";

export function createTestAuthSession(role: AuthRole = "buyer") {
  return createAuthSession({
    id: `${role}-test-user`,
    email: `${role}@example.com`,
    name: `Test ${role}`,
    role
  });
}

export function createTestAuthHeaders(role: AuthRole = "buyer"): Record<string, string> {
  return {
    [authSessionHeader]: serializeAuthSession(createTestAuthSession(role))
  };
}
