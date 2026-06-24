import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const domainEvents = pgTable("domain_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 255 }).notNull(),
  aggregateType: varchar("aggregate_type", { length: 255 }).notNull(),
  aggregateId: uuid("aggregate_id").notNull(),
  payload: jsonb("payload").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
