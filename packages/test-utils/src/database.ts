import { type DatabaseConnection, createDatabaseClient } from "@kiwifyclone/database";

export interface DatabaseTestHelperOptions {
  connectionString?: string;
  requireDatabase?: boolean;
}

export interface DatabaseTestHelper {
  canUseDatabase: boolean;
  createConnection: () => DatabaseConnection;
  reset: () => Promise<"skipped" | "completed">;
}

export function createDatabaseTestHelper(options: DatabaseTestHelperOptions = {}): DatabaseTestHelper {
  const connectionString = options.connectionString ?? process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  const requireDatabase = options.requireDatabase ?? process.env.RUN_DATABASE_TESTS === "true";
  const canUseDatabase = Boolean(connectionString && requireDatabase);

  return {
    canUseDatabase,
    createConnection: () => {
      if (!connectionString) {
        throw new Error("TEST_DATABASE_URL or DATABASE_URL is required for database integration tests.");
      }

      return createDatabaseClient({ connectionString });
    },
    reset: async () => {
      if (!canUseDatabase) {
        return "skipped";
      }

      const { pool } = createDatabaseClient({ connectionString: connectionString as string });

      try {
        await pool.query(`
          TRUNCATE TABLE
            job_logs,
            domain_events,
            external_webhook_events,
            enrollments,
            payment_provider_charges,
            payment_provider_customers,
            payments,
            order_items,
            orders,
            offers,
            product_lessons,
            product_modules,
            products,
            customer_profiles,
            producer_profiles,
            users
          RESTART IDENTITY CASCADE
        `);
      } finally {
        await pool.end();
      }

      return "completed";
    }
  };
}
