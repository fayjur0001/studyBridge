import { Request, Response } from "express";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { applications, users } from "@/db/schema";

export async function getAdminAnalytics(_req: Request, res: Response) {
  const [statusCounts, signupRows, applicationRows] = await Promise.all([
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
  ]);

  const countByStatus = Object.fromEntries(statusCounts.map((r) => [r.status, r.count]));
  const totalApplications = statusCounts.reduce((sum, r) => sum + r.count, 0);

  // A simple real funnel derived from actual status counts — not a
  // simulated/fake metric.
  const funnel = {
    draft: countByStatus.draft ?? 0,
    submitted:
      totalApplications - (countByStatus.draft ?? 0), // everything past draft
    underReview: countByStatus.under_review ?? 0,
    accepted: countByStatus.accepted ?? 0,
  };

  res.json({
    enrollmentFunnel: funnel,
    signupsByMonth: signupRows,
    applicationsByMonth: applicationRows,
  });
}
