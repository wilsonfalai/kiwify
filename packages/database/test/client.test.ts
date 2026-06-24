import { describe, expect, it } from "vitest";
import { createDatabaseClient } from "../src/client.js";
import { getDatabaseUrl } from "../src/env.js";

describe("database client", () => {
  it("requires DATABASE_URL when no explicit connection string is available", () => {
    expect(() => getDatabaseUrl({})).toThrow("DATABASE_URL is required");
  });

  it("creates a Drizzle client and pg pool without opening a connection eagerly", async () => {
    const { db, pool } = createDatabaseClient({
      connectionString: "postgresql://kiwifyclone:kiwifyclone@localhost:5432/kiwifyclone"
    });

    expect(db).toBeDefined();
    expect(pool).toBeDefined();

    await pool.end();
  });
});
