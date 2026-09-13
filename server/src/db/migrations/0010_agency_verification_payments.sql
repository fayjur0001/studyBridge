DO $$ BEGIN
  CREATE TYPE "public"."verification_status" AS ENUM('pending_payment', 'paid', 'under_review', 'approved', 'rejected', 'documents_requested');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agency_verification_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
	"status" "verification_status" DEFAULT 'pending_payment' NOT NULL,
	"fee_amount" numeric(10, 2) DEFAULT '5000.00' NOT NULL,
	"currency" varchar(10) DEFAULT 'BDT' NOT NULL,
	"transaction_id" varchar(120) NOT NULL UNIQUE,
	"ssl_session_key" varchar(255),
	"payment_status" varchar(30) DEFAULT 'unpaid' NOT NULL,
	"payment_details" jsonb,
	"admin_notes" text,
	"service_fee_deducted" numeric(10, 2),
	"refund_amount" numeric(10, 2),
	"refund_status" varchar(30) DEFAULT 'none',
	"refund_details" jsonb,
	"reviewed_by" uuid REFERENCES "users"("id") ON DELETE set null,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
