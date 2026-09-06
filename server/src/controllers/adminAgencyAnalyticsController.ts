import { Request, Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  applications,
  agencyStudents,
  agencyProfiles,
  universities,
  programs,
  users,
} from "@/db/schema";

// Platform-wide agency performance — mirrors the shape of the agency's own
// /api/agency/analytics endpoint, but aggregated across every agency so
// admins can see who's driving volume/acceptance and who is idle or
// unverified. All numbers are derived from real application rows, no
// simulated data.
export async function getAdminAgencyAnalytics(_req: Request, res: Response) {
  const [agencyRows, applicationRows] = await Promise.all([
    db
      .select({
        userId: agencyProfiles.userId,
        companyName: agencyProfiles.companyName,
        isVerified: agencyProfiles.isVerified,
        isActive: users.isActive,
      })
      .from(agencyProfiles)
      .innerJoin(users, eq(users.id, agencyProfiles.userId)),
    db
      .select({
        agencyId: agencyStudents.agencyId,
        studentId: applications.studentId,
        status: applications.status,
        country: universities.country,
        month: sql<string>`to_char(${applications.createdAt}, 'YYYY-MM')`,
        createdAt: applications.createdAt,
      })
      .from(applications)
      .innerJoin(agencyStudents, eq(applications.studentId, agencyStudents.studentId))
      .innerJoin(programs, eq(applications.programId, programs.id))
      .innerJoin(universities, eq(programs.universityId, universities.id)),
  ]);

  const byAgency: Record<
    string,
    { total: number; accepted: number; rejected: number; students: Set<string> }
  > = {};
  const byCountry: Record<string, { total: number; accepted: number }> = {};
  const byMonth: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  for (const row of applicationRows) {
    byAgency[row.agencyId] ??= { total: 0, accepted: 0, rejected: 0, students: new Set() };
    byAgency[row.agencyId].total += 1;
    byAgency[row.agencyId].students.add(row.studentId);
    if (row.status === "accepted") byAgency[row.agencyId].accepted += 1;
    if (row.status === "rejected") byAgency[row.agencyId].rejected += 1;

    byCountry[row.country] ??= { total: 0, accepted: 0 };
    byCountry[row.country].total += 1;
    if (row.status === "accepted") byCountry[row.country].accepted += 1;

    byMonth[row.month] = (byMonth[row.month] ?? 0) + 1;
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }

  const agencyLeaderboard = agencyRows
    .map((agency) => {
      const stats = byAgency[agency.userId] ?? { total: 0, accepted: 0, rejected: 0, students: new Set<string>() };
      return {
        userId: agency.userId,
        companyName: agency.companyName,
        isVerified: agency.isVerified,
        isActive: agency.isActive,
        totalApplications: stats.total,
        accepted: stats.accepted,
        rejected: stats.rejected,
        totalStudents: stats.students.size,
        acceptanceRate: stats.total ? Math.round((stats.accepted / stats.total) * 100) : 0,
      };
    })
    .sort((a, b) => b.totalApplications - a.totalApplications);

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
    totalAgencies: agencyRows.length,
    verifiedAgencies: agencyRows.filter((a) => a.isVerified).length,
    pendingAgencies: agencyRows.filter((a) => !a.isVerified).length,
    suspendedAgencies: agencyRows.filter((a) => !a.isActive).length,
    totalApplications: applicationRows.length,
    acceptedApplications: statusCounts.accepted ?? 0,
    rejectedApplications: statusCounts.rejected ?? 0,
    documentsRequested: statusCounts.documents_requested ?? 0,
    acceptanceRate: applicationRows.length
      ? Math.round(((statusCounts.accepted ?? 0) / applicationRows.length) * 100)
      : 0,
    statusCounts,
    conversionByCountry,
    monthlyVolume,
    agencyLeaderboard,
  });
}