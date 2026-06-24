import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

export function loadDatabaseEnv(cwd = process.cwd()): void {
  loadEnv({ path: resolve(cwd, ".env") });
  loadEnv({ path: resolve(cwd, ".env.local"), override: false });
  loadEnv({ path: resolve(cwd, "../../.env"), override: false });
  loadEnv({ path: resolve(cwd, "../../.env.local"), override: false });
}

export function getDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create a PostgreSQL connection.");
  }

  return databaseUrl;
}
