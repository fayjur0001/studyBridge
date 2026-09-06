import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, agencyStudents } from "@/db/schema";

export async function getAgencyDashboardStats(req: Request, res: Response) {
  const [students, apps] = await Promise.all([
    db
      .select({ userId: agencyStudents.studentId })
      .from(agencyStudents)
      .where(eq(agencyStudents.agencyId, req.user!.id)),
    db
      .select({ id: applications.id, status: applications.status })
      .from(applications)
      .innerJoin(agencyStudents, eq(applications.studentId, agencyStudents.studentId))
      .where(eq(agencyStudents.agencyId, req.user!.id)),
  ]);

  res.json({
    totalStudents: students.length,
    totalApplications: apps.length,
    underReview: apps.filter((a) => a.status === "under_review").length,
    accepted: apps.filter((a) => a.status === "accepted").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
    documentsRequested: apps.filter((a) => a.status === "documents_requested").length,
  });
}