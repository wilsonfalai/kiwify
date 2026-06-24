import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema/index.js";

export type DatabaseSchema = typeof schema;
export type DatabaseClient = NodePgDatabase<DatabaseSchema>;

export interface DatabaseConnection {
  db: DatabaseClient;
  pool: Pool;
}

export interface CreateDatabaseClientOptions {
  connectionString: string;
  pool?: Omit<PoolConfig, "connectionString">;
}

export function createDatabaseClient(options: CreateDatabaseClientOptions): DatabaseConnection {
  const pool = new Pool({
    connectionString: options.connectionString,
    ...options.pool
  });

  return {
    db: drizzle(pool, { schema }),
    pool
  };
}

export async function withTransaction<T>(
  db: DatabaseClient,
  callback: Parameters<DatabaseClient["transaction"]>[0]
): Promise<T> {
  return db.transaction(callback) as Promise<T>;
}
