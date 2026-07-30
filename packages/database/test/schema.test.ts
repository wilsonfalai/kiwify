import { getTableColumns, getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
  customerProfiles,
  domainEvents,
  enrollments,
  externalWebhookEvents,
  jobLogs,
  offers,
  orderItems,
  orders,
  paymentProviderCharges,
  paymentProviderCustomers,
  payments,
  producerProfiles,
  productLessons,
  productModules,
  products,
  users
} from "../src/schema/index.js";

const tables = {
  users,
  producer_profiles: producerProfiles,
  customer_profiles: customerProfiles,
  products,
  product_modules: productModules,
  product_lessons: productLessons,
  offers,
  orders,
  order_items: orderItems,
  payments,
  payment_provider_customers: paymentProviderCustomers,
  payment_provider_charges: paymentProviderCharges,
  enrollments,
  external_webhook_events: externalWebhookEvents,
  domain_events: domainEvents,
  job_logs: jobLogs
};

describe("database schema", () => {
  it("declares every required MVP table", () => {
    expect(Object.entries(tables).map(([expected, table]) => [expected, getTableName(table)])).toEqual(
      Object.keys(tables).map((tableName) => [tableName, tableName])
    );
  });

  it("keeps payment storage limited to safe fields", () => {
    const paymentColumnNames = [
      ...Object.keys(getTableColumns(payments)),
      ...Object.keys(getTableColumns(paymentProviderCustomers)),
      ...Object.keys(getTableColumns(paymentProviderCharges))
    ];

    expect(paymentColumnNames).toEqual(expect.arrayContaining(["externalCustomerId", "externalChargeId", "safeMetadata"]));
    expect(paymentColumnNames.join(" ")).not.toMatch(/cardNumber|cvv|cvc|securityCode|expiration|holderName/i);
  });

  it("has idempotency and audit columns for external webhook events", () => {
    expect(Object.keys(getTableColumns(externalWebhookEvents))).toEqual(
      expect.arrayContaining(["provider", "externalEventId", "idempotencyKey", "receivedAt", "processedAt", "safePayload"])
    );
  });

  it("has an enrollment model that can protect against duplicate access grants", () => {
    expect(Object.keys(getTableColumns(enrollments))).toEqual(
      expect.arrayContaining(["customerId", "productId", "orderId", "status"])
    );
  });
});
