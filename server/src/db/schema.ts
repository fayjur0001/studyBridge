import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const userRoleEnum = pgEnum("user_role", ["student", "agency", "admin"]);

export const applicationStatusEnum = pgEnum("application_status", [
  "draft",
  "submitted",
  "under_review",
  "documents_requested",
  "accepted",
  "rejected",
  "withdrawn",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "pending",
  "approved",
  "rejected",
]);

export const savedItemTypeEnum = pgEnum("saved_item_type", [
  "university",
  "program",
  "scholarship",
]);

/* -------------------------------------------------------------------------- */
/* Users & role-specific profiles                                            */
/* -------------------------------------------------------------------------- */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  emailVerifiedAt: timestamp("email_verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const studentProfiles = pgTable("student_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  dateOfBirth: timestamp("date_of_birth"),
  nationality: varchar("nationality", { length: 120 }),
  currentEducationLevel: varchar("current_education_level", { length: 120 }),
  gpa: numeric("gpa", { precision: 4, scale: 2 }),
  preferredCountries: jsonb("preferred_countries").$type<string[]>().default([]),
  preferredFields: jsonb("preferred_fields").$type<string[]>().default([]),
  bio: text("bio"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const agencyProfiles = pgTable("agency_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  licenseNumber: varchar("license_number", { length: 120 }),
  website: varchar("website", { length: 255 }),
  address: text("address"),
  description: text("description"),
  isVerified: boolean("is_verified").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// A student can be linked to more than one agency at the same time, and an
// agency can track many students — so this is a many-to-many join table
// rather than a single agencyId column on student_profiles.
export const agencyStudents = pgTable(
  "agency_students",
  {
    agencyId: uuid("agency_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    linkedAt: timestamp("linked_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.agencyId, table.studentId] }),
  })
);

/* -------------------------------------------------------------------------- */
/* Universities, programs, scholarships                                      */
/* -------------------------------------------------------------------------- */

export const universities = pgTable("universities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 120 }).notNull(),
  region: varchar("region", { length: 80 }), // e.g. North America, Europe, Asia-Pacific, Middle East
  city: varchar("city", { length: 120 }),
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  description: text("description"),
  ranking: integer("ranking"),
  websiteUrl: text("website_url"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const programs = pgTable("programs", {
  id: uuid("id").defaultRandom().primaryKey(),
  universityId: uuid("university_id")
    .notNull()
    .references(() => universities.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  degreeLevel: varchar("degree_level", { length: 80 }).notNull(), // e.g. Bachelor, Master, PhD
  field: varchar("field", { length: 150 }),
  durationMonths: integer("duration_months"),
  tuitionFeeUsd: numeric("tuition_fee_usd", { precision: 12, scale: 2 }),
  intakeMonths: jsonb("intake_months").$type<string[]>().default([]),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const scholarships = pgTable("scholarships", {
  id: uuid("id").defaultRandom().primaryKey(),
  universityId: uuid("university_id").references(() => universities.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }),
  category: varchar("category", { length: 80 }), // e.g. Merit Based, Need Based, Portfolio Based
  amountUsd: numeric("amount_usd", { precision: 12, scale: 2 }),
  coveragePercent: integer("coverage_percent"),
  deadline: timestamp("deadline"),
  eligibility: text("eligibility"),
  description: text("description"),
  applyUrl: text("apply_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Applications & documents                                                  */
/* -------------------------------------------------------------------------- */

export const applications = pgTable("applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  programId: uuid("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  agencyId: uuid("agency_id").references(() => users.id, { onDelete: "set null" }),
  status: applicationStatusEnum("status").notNull().default("draft"),
  intake: varchar("intake", { length: 60 }),
  notes: text("notes"),
  agencyNotes: text("agency_notes"),
  submittedAt: timestamp("submitted_at"),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id").references(() => applications.id, {
    onDelete: "set null",
  }),
  type: varchar("type", { length: 100 }).notNull(), // e.g. passport, transcript, sop, recommendation
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: text("file_path").notNull(), // relative path on local disk
  mimeType: varchar("mime_type", { length: 120 }),
  sizeBytes: integer("size_bytes"),
  status: documentStatusEnum("status").notNull().default("pending"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewNote: text("review_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const savedItems = pgTable(
  "saved_items",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemType: savedItemTypeEnum("item_type").notNull(),
    itemId: uuid("item_id").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.itemType, t.itemId] }),
  })
);

/* -------------------------------------------------------------------------- */
/* Messaging                                                                  */
/* -------------------------------------------------------------------------- */

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  subject: varchar("subject", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.conversationId, t.userId] }),
  })
);

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Notifications                                                             */
/* -------------------------------------------------------------------------- */

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 80 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Auth support: refresh token store (for revocation / rotation)             */
/* -------------------------------------------------------------------------- */

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Agency service packages (agency's own consulting offerings)               */
/* -------------------------------------------------------------------------- */

export const agencyServices = pgTable("agency_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  agencyId: uuid("agency_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  priceUsd: numeric("price_usd", { precision: 10, scale: 2 }),
  features: jsonb("features").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Site content (simple admin-editable CMS blocks, e.g. SEO title/description)*/
/* -------------------------------------------------------------------------- */

export const siteContent = pgTable("site_content", {
  key: varchar("key", { length: 120 }).primaryKey(),
  title: varchar("title", { length: 255 }),
  body: text("body"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
});

/* -------------------------------------------------------------------------- */
/* Notification preferences (per-user, simple on/off per channel per event)  */
/* -------------------------------------------------------------------------- */

export const notificationPreferences = pgTable("notification_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  emailOnApplicationUpdate: boolean("email_on_application_update").notNull().default(true),
  emailOnMessage: boolean("email_on_message").notNull().default(true),
  emailOnNewStudentLead: boolean("email_on_new_student_lead").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Relations                                                                  */
/* -------------------------------------------------------------------------- */

export const usersRelations = relations(users, ({ one, many }) => ({
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  agencyProfile: one(agencyProfiles, {
    fields: [users.id],
    references: [agencyProfiles.userId],
  }),
  applications: many(applications),
  documents: many(documents),
  agencyLinksAsStudent: many(agencyStudents, { relationName: "studentLinks" }),
  agencyLinksAsAgency: many(agencyStudents, { relationName: "agencyLinks" }),
}));

export const agencyStudentsRelations = relations(agencyStudents, ({ one }) => ({
  agency: one(users, {
    fields: [agencyStudents.agencyId],
    references: [users.id],
    relationName: "agencyLinks",
  }),
  student: one(users, {
    fields: [agencyStudents.studentId],
    references: [users.id],
    relationName: "studentLinks",
  }),
}));

export const universitiesRelations = relations(universities, ({ many }) => ({
  programs: many(programs),
  scholarships: many(scholarships),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  university: one(universities, {
    fields: [programs.universityId],
    references: [universities.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  student: one(users, { fields: [applications.studentId], references: [users.id] }),
  program: one(programs, { fields: [applications.programId], references: [programs.id] }),
  documents: many(documents),
}));