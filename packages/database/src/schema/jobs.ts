import { jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { jobStatusEnum } from "./enums.js";

export const jobLogs = pgTable("job_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  queueName: varchar("queue_name", { length: 255 }).notNull(),
  jobName: varchar("job_name", { length: 255 }).notNull(),
  jobId: varchar("job_id", { length: 255 }),
  status: jobStatusEnum("status").notNull(),
  inputSummary: jsonb("input_summary"),
  resultSummary: jsonb("result_summary"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});
