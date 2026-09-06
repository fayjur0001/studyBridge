CREATE TABLE IF NOT EXISTS "agency_files" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "agency_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "category" varchar(30) NOT NULL,
  "title" varchar(255) NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "file_path" text NOT NULL,
  "mime_type" varchar(120),
  "size_bytes" integer,
  "expires_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
