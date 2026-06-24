import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDatabaseClient } from "./client.js";
import { getDatabaseUrl, loadDatabaseEnv } from "./env.js";

export interface RunMigrationsOptions {
  connectionString?: string;
  migrationsFolder?: string;
}

export async function runMigrations(options: RunMigrationsOptions = {}): Promise<void> {
  loadDatabaseEnv();

  const { db, pool } = createDatabaseClient({
    connectionString: options.connectionString ?? getDatabaseUrl()
  });

  try {
    await migrate(db, {
      migrationsFolder: options.migrationsFolder ?? "drizzle"
    });
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && import.meta.url === new URL(process.argv[1], "file:").href) {
  await runMigrations();
}
