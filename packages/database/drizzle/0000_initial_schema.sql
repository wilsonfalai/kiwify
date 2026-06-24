CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "user_role" AS ENUM ('buyer', 'producer', 'platform_admin');
CREATE TYPE "profile_status" AS ENUM ('active', 'inactive');
CREATE TYPE "product_status" AS ENUM ('draft', 'active', 'inactive');
CREATE TYPE "offer_status" AS ENUM ('active', 'inactive');
CREATE TYPE "lesson_content_type" AS ENUM ('text', 'video_url');
CREATE TYPE "payment_method" AS ENUM ('pix', 'credit_card');
CREATE TYPE "order_status" AS ENUM ('pending', 'paid', 'refused', 'canceled');
CREATE TYPE "payment_provider" AS ENUM ('asaas', 'fake');
CREATE TYPE "payment_status" AS ENUM ('pending', 'approved', 'refused', 'canceled');
CREATE TYPE "enrollment_status" AS ENUM ('active', 'pending', 'revoked');
CREATE TYPE "webhook_provider" AS ENUM ('asaas');
CREATE TYPE "webhook_status" AS ENUM ('received', 'queued', 'processing', 'processed', 'ignored', 'failed');
CREATE TYPE "job_status" AS ENUM ('queued', 'processing', 'completed', 'failed', 'skipped');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "email" varchar(320) NOT NULL,
  "role" "user_role" NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "producer_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "display_name" varchar(255) NOT NULL,
  "status" "profile_status" NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "customer_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "email" varchar(320) NOT NULL,
  "document" varchar(32),
  "phone" varchar(32),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "producer_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "image_url" text,
  "status" "product_status" NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "product_modules" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "position" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "product_lessons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "module_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "content_type" "lesson_content_type" NOT NULL,
  "text_content" text,
  "video_url" text,
  "position" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "offers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "product_id" uuid NOT NULL,
  "name" varchar(255) NOT NULL,
  "price_cents" integer NOT NULL,
  "currency" varchar(3) DEFAULT 'BRL' NOT NULL,
  "status" "offer_status" NOT NULL,
  "allowed_payment_methods" "payment_method"[] NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid NOT NULL,
  "status" "order_status" NOT NULL,
  "total_cents" integer NOT NULL,
  "currency" varchar(3) DEFAULT 'BRL' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "paid_at" timestamp with time zone
);

CREATE TABLE "order_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "offer_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "title_snapshot" varchar(255) NOT NULL,
  "price_cents" integer NOT NULL,
  "currency" varchar(3) DEFAULT 'BRL' NOT NULL
);

CREATE TABLE "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "provider" "payment_provider" NOT NULL,
  "method" "payment_method" NOT NULL,
  "status" "payment_status" NOT NULL,
  "amount_cents" integer NOT NULL,
  "currency" varchar(3) DEFAULT 'BRL' NOT NULL,
  "safe_metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "approved_at" timestamp with time zone,
  "refused_at" timestamp with time zone
);

CREATE TABLE "payment_provider_customers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid NOT NULL,
  "provider" "payment_provider" NOT NULL,
  "external_customer_id" varchar(255) NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "payment_provider_charges" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "payment_id" uuid NOT NULL,
  "provider" "payment_provider" NOT NULL,
  "external_charge_id" varchar(255) NOT NULL,
  "external_status" varchar(128),
  "pix_qr_code" text,
  "pix_payload" text,
  "safe_metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "enrollments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid NOT NULL,
  "product_id" uuid NOT NULL,
  "order_id" uuid NOT NULL,
  "status" "enrollment_status" NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "external_webhook_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "provider" "webhook_provider" NOT NULL,
  "external_event_id" varchar(255),
  "event_type" varchar(255) NOT NULL,
  "idempotency_key" varchar(512) NOT NULL,
  "received_at" timestamp with time zone DEFAULT now() NOT NULL,
  "processed_at" timestamp with time zone,
  "status" "webhook_status" NOT NULL,
  "safe_payload" jsonb NOT NULL,
  "processing_error" text
);

CREATE TABLE "domain_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" varchar(255) NOT NULL,
  "aggregate_type" varchar(255) NOT NULL,
  "aggregate_id" uuid NOT NULL,
  "payload" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "job_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "queue_name" varchar(255) NOT NULL,
  "job_name" varchar(255) NOT NULL,
  "job_id" varchar(255),
  "status" "job_status" NOT NULL,
  "input_summary" jsonb,
  "result_summary" jsonb,
  "error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "producer_profiles" ADD CONSTRAINT "producer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
ALTER TABLE "products" ADD CONSTRAINT "products_producer_id_producer_profiles_id_fk" FOREIGN KEY ("producer_id") REFERENCES "producer_profiles"("id") ON DELETE restrict;
ALTER TABLE "product_modules" ADD CONSTRAINT "product_modules_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE cascade;
ALTER TABLE "product_lessons" ADD CONSTRAINT "product_lessons_module_id_product_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "product_modules"("id") ON DELETE cascade;
ALTER TABLE "offers" ADD CONSTRAINT "offers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE cascade;
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customer_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE restrict;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE restrict;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE restrict;
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade;
ALTER TABLE "payment_provider_customers" ADD CONSTRAINT "payment_provider_customers_customer_id_customer_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE cascade;
ALTER TABLE "payment_provider_charges" ADD CONSTRAINT "payment_provider_charges_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE cascade;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_customer_id_customer_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE cascade;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE cascade;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE cascade;

CREATE UNIQUE INDEX "producer_profiles_user_id_unique" ON "producer_profiles" ("user_id");
CREATE UNIQUE INDEX "customer_profiles_user_id_unique" ON "customer_profiles" ("user_id");
CREATE UNIQUE INDEX "products_slug_unique" ON "products" ("slug");
CREATE UNIQUE INDEX "product_modules_product_position_unique" ON "product_modules" ("product_id", "position");
CREATE UNIQUE INDEX "product_lessons_module_position_unique" ON "product_lessons" ("module_id", "position");
CREATE UNIQUE INDEX "payment_provider_customers_provider_external_unique" ON "payment_provider_customers" ("provider", "external_customer_id");
CREATE UNIQUE INDEX "payment_provider_customers_provider_customer_unique" ON "payment_provider_customers" ("provider", "customer_id");
CREATE UNIQUE INDEX "payment_provider_charges_payment_unique" ON "payment_provider_charges" ("payment_id");
CREATE UNIQUE INDEX "payment_provider_charges_provider_external_unique" ON "payment_provider_charges" ("provider", "external_charge_id");
CREATE UNIQUE INDEX "enrollments_customer_product_order_unique" ON "enrollments" ("customer_id", "product_id", "order_id");
CREATE UNIQUE INDEX "external_webhook_events_provider_idempotency_unique" ON "external_webhook_events" ("provider", "idempotency_key");
