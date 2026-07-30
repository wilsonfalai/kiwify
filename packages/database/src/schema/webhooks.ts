import { jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { webhookProviderEnum, webhookStatusEnum } from "./enums.js";

export const externalWebhookEvents = pgTable(
  "external_webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: webhookProviderEnum("provider").notNull(),
    externalEventId: varchar("external_event_id", { length: 255 }),
    eventType: varchar("event_type", { length: 255 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 512 }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    status: webhookStatusEnum("status").notNull(),
    safePayload: jsonb("safe_payload").notNull(),
    processingError: text("processing_error")
  },
  (table) => [uniqueIndex("external_webhook_events_provider_idempotency_unique").on(table.provider, table.idempotencyKey)]
);
