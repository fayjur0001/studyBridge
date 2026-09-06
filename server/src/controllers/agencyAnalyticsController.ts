import { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { applications, agencyStudents, universities, programs } from "@/db/schema";

export async function getAgencyAnalytics(req: Request, res: Response) {
  const rows = await db
    .select({
      status: applications.status,
      studentId: applications.studentId,
      country: universities.country,
      programName: programs.name,
      universityName: universities.name,
      month: sql<string>`to_char(${applications.createdAt}, 'YYYY-MM')`,
      createdAt: applications.createdAt,
    })
    .from(applications)
    .innerJoin(agencyStudents, eq(applications.studentId, agencyStudents.studentId))
    .innerJoin(programs, eq(applications.programId, programs.id))
    .innerJoin(universities, eq(programs.universityId, universities.id))
    .where(eq(agencyStudents.agencyId, req.user!.id));

  const byCountry: Record<string, { total: number; accepted: number }> = {};
  const byMonth: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  for (const row of rows) {
    byCountry[row.country] ??= { total: 0, accepted: 0 };
    byCountry[row.country].total += 1;
    if (row.status === "accepted") byCountry[row.country].accepted += 1;

    byMonth[row.month] = (byMonth[row.month] ?? 0) + 1;
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }

  const conversionByCountry = Object.entries(byCountry)
    .map(([country, { total, accepted }]) => ({
      country,
      total,
      accepted,
      conversionRate: total ? Math.round((accepted / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const monthlyVolume = Object.entries(byMonth)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  res.json({
    totalApplications: rows.length,
    activeApplications: rows.filter((row) => ["draft", "submitted", "under_review", "documents_requested"].includes(row.status)).length,
    acceptedApplications: statusCounts.accepted ?? 0,
    rejectedApplications: statusCounts.rejected ?? 0,
    documentsRequested: statusCounts.documents_requested ?? 0,
    totalStudents: new Set(rows.map((row) => row.studentId)).size,
    acceptanceRate: rows.length ? Math.round(((statusCounts.accepted ?? 0) / rows.length) * 100) : 0,
    statusCounts,
    conversionByCountry,
    monthlyVolume,
    recentApplications: rows.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5).map((row) => ({ programName: row.programName, universityName: row.universityName, status: row.status, createdAt: row.createdAt })),
  });
}
