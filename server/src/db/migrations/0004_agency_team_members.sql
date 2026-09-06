CREATE TABLE IF NOT EXISTS "agency_team_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "agency_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "full_name" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  "role" varchar(40) DEFAULT 'Counselor' NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "agency_team_members_agency_email_unique" UNIQUE("agency_id", "email")
);
