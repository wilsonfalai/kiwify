export const authRoles = ["buyer", "producer", "platform_admin"] as const;

export type AuthRole = (typeof authRoles)[number];

export const rolePermissions = {
  buyer: ["members:read", "checkout:create"],
  producer: ["producer:manage-products", "producer:read-orders"],
  platform_admin: ["platform:admin"]
} as const satisfies Record<AuthRole, readonly string[]>;

export type AuthPermission = (typeof rolePermissions)[AuthRole][number];

export function isAuthRole(value: unknown): value is AuthRole {
  return typeof value === "string" && authRoles.includes(value as AuthRole);
}

export function hasPermission(role: AuthRole, permission: AuthPermission): boolean {
  if (role === "platform_admin") {
    return true;
  }

  return rolePermissions[role].includes(permission as never);
}

export function roleCanAccess(role: AuthRole, allowedRoles: readonly AuthRole[]): boolean {
  return allowedRoles.includes(role);
}
