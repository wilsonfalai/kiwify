import { integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { paymentMethodEnum, paymentProviderEnum, paymentStatusEnum } from "./enums.js";
import { customerProfiles } from "./customers.js";
import { orders } from "./orders.js";

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  provider: paymentProviderEnum("provider").notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("BRL"),
  safeMetadata: jsonb("safe_metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  refusedAt: timestamp("refused_at", { withTimezone: true })
});

export const paymentProviderCustomers = pgTable(
  "payment_provider_customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customerProfiles.id, { onDelete: "cascade" }),
    provider: paymentProviderEnum("provider").notNull(),
    externalCustomerId: varchar("external_customer_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("payment_provider_customers_provider_external_unique").on(table.provider, table.externalCustomerId),
    uniqueIndex("payment_provider_customers_provider_customer_unique").on(table.provider, table.customerId)
  ]
);

export const paymentProviderCharges = pgTable(
  "payment_provider_charges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "cascade" }),
    provider: paymentProviderEnum("provider").notNull(),
    externalChargeId: varchar("external_charge_id", { length: 255 }).notNull(),
    externalStatus: varchar("external_status", { length: 128 }),
    pixQrCode: text("pix_qr_code"),
    pixPayload: text("pix_payload"),
    safeMetadata: jsonb("safe_metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    uniqueIndex("payment_provider_charges_payment_unique").on(table.paymentId),
    uniqueIndex("payment_provider_charges_provider_external_unique").on(table.provider, table.externalChargeId)
  ]
);
