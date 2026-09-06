CREATE TABLE IF NOT EXISTS "agency_service_interests" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "agency_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "service_id" uuid NOT NULL REFERENCES "agency_services"("id") ON DELETE CASCADE,
  "student_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" varchar(30) DEFAULT 'requested' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY("service_id", "student_id")
);
