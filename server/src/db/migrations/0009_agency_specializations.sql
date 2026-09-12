ALTER TABLE "agency_profiles" ADD COLUMN IF NOT EXISTS "supported_countries" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "agency_profiles" ADD COLUMN IF NOT EXISTS "partner_university_ids" jsonb DEFAULT '[]'::jsonb;
