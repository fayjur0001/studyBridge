import { Request, Response } from "express";
import { eq, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  universities,
  programs,
  scholarships,
  applications,
  agencyProfiles,
} from "@/db/schema";

export async function getAdminOverviewStats(_req: Request, res: Response) {
  const [
    totalUsers,
    students,
    agencies,
    admins,
    suspended,
    totalAgencies,
    pendingVerification,
    totalApplications,
    submitted,
    underReview,
    accepted,
    rejected,
    universityCount,
    programCount,
    scholarshipCount,
  ] = await Promise.all([
    db.$count(users),
    db.$count(users, eq(users.role, "student")),
    db.$count(users, eq(users.role, "agency")),
    db.$count(users, eq(users.role, "admin")),
    db.$count(users, eq(users.isActive, false)),
    db.$count(agencyProfiles),
    db.$count(agencyProfiles, eq(agencyProfiles.isVerified, false)),
    db.$count(applications),
    db.$count(applications, ne(applications.status, "draft")),
    db.$count(applications, eq(applications.status, "under_review")),
    db.$count(applications, eq(applications.status, "accepted")),
    db.$count(applications, eq(applications.status, "rejected")),
    db.$count(universities),
    db.$count(programs),
    db.$count(scholarships),
  ]);

  res.json({
    users: { total: totalUsers, students, agencies, admins, suspended },
    agencies: { total: totalAgencies, pendingVerification },
    applications: { total: totalApplications, submitted, underReview, accepted, rejected },
    catalog: { universities: universityCount, programs: programCount, scholarships: scholarshipCount },
  });
}

// Alias used by the /admin/reports and /admin/analytics pages — same
// underlying numbers, kept as a separate route so the frontend's two
// pages can evolve independently without changing this response shape.
export const getAdminReportStats = getAdminOverviewStats;
