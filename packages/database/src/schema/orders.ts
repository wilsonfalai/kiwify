import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { orderStatusEnum } from "./enums.js";
import { customerProfiles } from "./customers.js";
import { offers } from "./offers.js";
import { products } from "./products.js";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customerProfiles.id, { onDelete: "restrict" }),
  status: orderStatusEnum("status").notNull(),
  totalCents: integer("total_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("BRL"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true })
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  offerId: uuid("offer_id")
    .notNull()
    .references(() => offers.id, { onDelete: "restrict" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  titleSnapshot: varchar("title_snapshot", { length: 255 }).notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("BRL")
});
