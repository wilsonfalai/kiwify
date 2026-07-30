import { describe, expect, it } from "vitest";
import { createDatabaseTestHelper } from "../src/index.js";

describe("database test helper", () => {
  it("can be created without a real database for default CI runs", async () => {
    const helper = createDatabaseTestHelper({ requireDatabase: false });

    expect(helper.canUseDatabase).toBe(false);
    await expect(helper.reset()).resolves.toBe("skipped");
  });

  it("requires a connection string before creating a real database client", () => {
    const helper = createDatabaseTestHelper({
      connectionString: undefined,
      requireDatabase: true
    });

    expect(() => helper.createConnection()).toThrow("TEST_DATABASE_URL or DATABASE_URL is required");
  });
});
