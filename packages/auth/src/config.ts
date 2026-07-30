import { betterAuth, type BetterAuthOptions } from "better-auth";
import { authRoles } from "./roles.js";

export interface AuthEnv {
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
}

export interface AuthConfig {
  secret: string;
  baseURL: string;
  roles: typeof authRoles;
  options: BetterAuthOptions;
}

export function createAuthConfig(env: AuthEnv = process.env as AuthEnv): AuthConfig {
  const secret = env.BETTER_AUTH_SECRET;
  const baseURL = env.BETTER_AUTH_URL;

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required.");
  }

  if (!baseURL) {
    throw new Error("BETTER_AUTH_URL is required.");
  }

  const options = {
    secret,
    baseURL,
    emailAndPassword: {
      enabled: true
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "buyer",
          input: false
        }
      }
    }
  } satisfies BetterAuthOptions;

  return {
    secret,
    baseURL,
    roles: authRoles,
    options
  };
}

export function createBetterAuth(env: AuthEnv = process.env as AuthEnv) {
  return betterAuth(createAuthConfig(env).options);
}
