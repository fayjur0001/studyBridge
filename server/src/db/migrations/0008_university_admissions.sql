ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "admission_requirements" text;
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "application_start_date" timestamp;
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "application_deadline" timestamp;
ALTER TABLE "universities" ADD COLUMN IF NOT EXISTS "gallery_image_urls" jsonb DEFAULT '[]'::jsonb;
