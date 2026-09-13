ALTER TABLE "agency_profiles" ADD COLUMN IF NOT EXISTS "service_fee" numeric(10, 2) DEFAULT '3000.00' NOT NULL;
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "application_fee" numeric(10, 2) DEFAULT '0.00';
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "platform_commission" numeric(10, 2) DEFAULT '0.00';
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "agency_share" numeric(10, 2) DEFAULT '0.00';
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "payment_status" varchar(30) DEFAULT 'unpaid' NOT NULL;
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "transaction_id" varchar(120);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "payment_details" jsonb;
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN IF NOT EXISTS "paid_at" timestamp;
