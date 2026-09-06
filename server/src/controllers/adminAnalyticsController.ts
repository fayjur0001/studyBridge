import { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  applications,
  users,
  agencyProfiles,
  universities,
  programs,
  scholarships,
} from "@/db/schema";

export async function getAdminAnalytics(_req: Request, res: Response) {
  const [
    statusCounts,
    signupRows,
    applicationRows,
    totalUsers,
    totalAgencies,
    verifiedAgencies,
    totalUniversities,
    totalPrograms,
    totalScholarships,
  ] = await Promise.all([
    db
      .select({ status: applications.status, count: sql<number>`count(*)::int` })
      .from(applications)
      .groupBy(applications.status),
    db
      .select({ month: sql<string>`to_char(${users.createdAt}, 'YYYY-MM')`, count: sql<number>`count(*)::int` })
      .from(users)
      .groupBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${users.createdAt}, 'YYYY-MM')`),
    db
      .select({ month: sql<string>`to_char(${applications.createdAt}, 'YYYY-MM')`, count: sql<number>`count(*)::int` })
      .from(applications)
      .groupBy(sql`to_char(${applications.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${applications.createdAt}, 'YYYY-MM')`),
    db.$count(users),
    db.$count(agencyProfiles),
    db.$count(agencyProfiles, eq(agencyProfiles.isVerified, true)),
    db.$count(universities),
    db.$count(programs),
    db.$count(scholarships),
  ]);

  const countByStatus = Object.fromEntries(statusCounts.map((r) => [r.status, r.count]));
  const totalApplications = statusCounts.reduce((sum, r) => sum + r.count, 0);
  const submittedCount = totalApplications - (countByStatus.draft ?? 0);

  // A simple real funnel derived from actual status counts — not a
  // simulated/fake metric.
  const funnel = {
    draft: countByStatus.draft ?? 0,
    submitted: submittedCount, // everything past draft
    underReview: countByStatus.under_review ?? 0,
    accepted: countByStatus.accepted ?? 0,
  };

  res.json({
    enrollmentFunnel: funnel,
    signupsByMonth: signupRows,
    applicationsByMonth: applicationRows,
    platformTotals: {
      users: totalUsers,
      agencies: totalAgencies,
      verifiedAgencies,
      universities: totalUniversities,
      programs: totalPrograms,
      scholarships: totalScholarships,
    },
    applicationOutcomes: {
      rejected: countByStatus.rejected ?? 0,
      withdrawn: countByStatus.withdrawn ?? 0,
      rejectionRate:
        submittedCount > 0 ? Math.round(((countByStatus.rejected ?? 0) / submittedCount) * 100) : 0,
    },
  });
}