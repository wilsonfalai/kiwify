import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { offerStatusEnum, paymentMethodEnum } from "./enums.js";
import { products } from "./products.js";

export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("BRL"),
  status: offerStatusEnum("status").notNull(),
  allowedPaymentMethods: paymentMethodEnum("allowed_payment_methods").array().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
