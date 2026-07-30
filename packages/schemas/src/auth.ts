import { authRoles, type AuthRole } from "@kiwifyclone/auth";

export const authRoleValues = authRoles;

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
}

export function isAuthUserDto(value: unknown): value is AuthUserDto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuthUserDto>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.role === "string" &&
    authRoles.includes(candidate.role as AuthRole)
  );
}
