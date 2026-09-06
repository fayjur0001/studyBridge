CREATE TABLE IF NOT EXISTS "agency_students" (
	"agency_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"linked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agency_students_agency_id_student_id_pk" PRIMARY KEY("agency_id","student_id")
);
--> statement-breakpoint
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_agency_id_agency_profiles_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_students" ADD CONSTRAINT "agency_students_agency_id_users_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agency_students" ADD CONSTRAINT "agency_students_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "student_profiles" DROP COLUMN IF EXISTS "agency_id";