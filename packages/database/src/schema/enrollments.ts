import { pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { enrollmentStatusEnum } from "./enums.js";
import { customerProfiles } from "./customers.js";
import { orders } from "./orders.js";
import { products } from "./products.js";

export const enrollments = pgTable(
  "enrollments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customerProfiles.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    status: enrollmentStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("enrollments_customer_product_order_unique").on(table.customerId, table.productId, table.orderId)]
);
