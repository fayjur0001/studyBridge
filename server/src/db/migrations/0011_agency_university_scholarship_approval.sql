ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "status" varchar(30) DEFAULT 'approved' NOT NULL;
--> statement-breakpoint
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "submitted_by_agency_id" uuid REFERENCES "users"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "rejection_reason" text;
--> statement-breakpoint
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "status" varchar(30) DEFAULT 'approved' NOT NULL;
--> statement-breakpoint
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "submitted_by_agency_id" uuid REFERENCES "users"("id") ON DELETE set null;
--> statement-breakpoint
ALTER TABLE "scholarships" ADD COLUMN IF NOT EXISTS "rejection_reason" text;
