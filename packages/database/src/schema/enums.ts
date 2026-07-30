import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["buyer", "producer", "platform_admin"]);
export const profileStatusEnum = pgEnum("profile_status", ["active", "inactive"]);
export const productStatusEnum = pgEnum("product_status", ["draft", "active", "inactive"]);
export const offerStatusEnum = pgEnum("offer_status", ["active", "inactive"]);
export const lessonContentTypeEnum = pgEnum("lesson_content_type", ["text", "video_url"]);
export const paymentMethodEnum = pgEnum("payment_method", ["pix", "credit_card"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "refused", "canceled"]);
export const paymentProviderEnum = pgEnum("payment_provider", ["asaas", "fake"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "approved", "refused", "canceled"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", ["active", "pending", "revoked"]);
export const webhookProviderEnum = pgEnum("webhook_provider", ["asaas"]);
export const webhookStatusEnum = pgEnum("webhook_status", [
  "received",
  "queued",
  "processing",
  "processed",
  "ignored",
  "failed"
]);
export const jobStatusEnum = pgEnum("job_status", ["queued", "processing", "completed", "failed", "skipped"]);
