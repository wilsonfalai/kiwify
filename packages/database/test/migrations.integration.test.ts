import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const requiredTables = [
  "users",
  "producer_profiles",
  "customer_profiles",
  "products",
  "product_modules",
  "product_lessons",
  "offers",
  "orders",
  "order_items",
  "payments",
  "payment_provider_customers",
  "payment_provider_charges",
  "enrollments",
  "external_webhook_events",
  "domain_events",
  "job_logs"
];

describe("database migrations", () => {
  it("creates every required phase 3 table", async () => {
    const migration = await readFile(resolve(import.meta.dirname, "../drizzle/0000_initial_schema.sql"), "utf8");

    for (const tableName of requiredTables) {
      expect(migration).toContain(`CREATE TABLE "${tableName}"`);
    }
  });

  it("keeps sensitive card data out of the persistent schema", async () => {
    const migration = await readFile(resolve(import.meta.dirname, "../drizzle/0000_initial_schema.sql"), "utf8");

    expect(migration).not.toMatch(/card_number|cvv|cvc|security_code|holder_name|expiration/i);
  });
});
