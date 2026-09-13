import { Request, Response } from "express";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { applications, agencyStudents, users, programs, universities } from "@/db/schema";

export async function getAgencyDashboardStats(req: Request, res: Response) {
  const agencyId = req.user!.id;

  // 1. Linked students count
  const students = await db
    .select({ studentId: agencyStudents.studentId })
    .from(agencyStudents)
    .where(eq(agencyStudents.agencyId, agencyId));

  // 2. Query all applications belonging to this agency
  // Either assigned specifically (applications.agencyId = agencyId)
  // or via student linkage (agencyStudents.agencyId = agencyId)
  const rawApps = await db
    .select({
      id: applications.id,
      status: applications.status,
      applicationFee: applications.applicationFee,
      platformCommission: applications.platformCommission,
      agencyShare: applications.agencyShare,
      paymentStatus: applications.paymentStatus,
      paidAt: applications.paidAt,
      createdAt: applications.createdAt,
      studentId: applications.studentId,
      studentName: users.fullName,
      studentEmail: users.email,
      programName: programs.name,
      universityName: universities.name,
    })
    .from(applications)
    .leftJoin(agencyStudents, eq(applications.studentId, agencyStudents.studentId))
    .leftJoin(users, eq(applications.studentId, users.id))
    .leftJoin(programs, eq(applications.programId, programs.id))
    .leftJoin(universities, eq(programs.universityId, universities.id))
    .where(
      or(
        eq(applications.agencyId, agencyId),
        and(isNull(applications.agencyId), eq(agencyStudents.agencyId, agencyId))
      )
    )
    .orderBy(desc(applications.createdAt));

  // Deduplicate by application id
  const appMap = new Map<string, (typeof rawApps)[0]>();
  for (const app of rawApps) {
    if (!appMap.has(app.id)) {
      appMap.set(app.id, app);
    }
  }
  const apps = Array.from(appMap.values());

  // Financial calculations
  let totalRevenue = 0;
  let grossTurnover = 0;
  let platformCommission = 0;
  let paidApplications = 0;
  let pendingPaymentApplications = 0;

  let underReview = 0;
  let accepted = 0;
  let rejected = 0;
  let documentsRequested = 0;
  let submitted = 0;
  let draft = 0;

  for (const app of apps) {
    if (app.paymentStatus === "paid") {
      paidApplications += 1;
      totalRevenue += Number(app.agencyShare) || 0;
      grossTurnover += Number(app.applicationFee) || 0;
      platformCommission += Number(app.platformCommission) || 0;
    } else {
      pendingPaymentApplications += 1;
    }

    if (app.status === "under_review") underReview += 1;
    else if (app.status === "accepted") accepted += 1;
    else if (app.status === "rejected") rejected += 1;
    else if (app.status === "documents_requested") documentsRequested += 1;
    else if (app.status === "submitted") submitted += 1;
    else if (app.status === "draft") draft += 1;
  }

  const totalApplications = apps.length;
  const successRate =
    totalApplications > 0 ? Math.round((accepted / totalApplications) * 100) : 0;

  // Real urgent tasks derived from live applications
  interface UrgentTask {
    id: string;
    title: string;
    description: string;
    type: "warning" | "info" | "alert";
    count: number;
    link: string;
  }
  const urgentTasks: UrgentTask[] = [];

  if (documentsRequested > 0) {
    urgentTasks.push({
      id: "docs_requested",
      title: "Document Review Needed",
      description: `${documentsRequested} student application(s) require document review or re-submission`,
      type: "warning",
      count: documentsRequested,
      link: "/agency/applications",
    });
  }
  if (underReview > 0) {
    urgentTasks.push({
      id: "under_review",
      title: "University Decisions Pending",
      description: `${underReview} application(s) currently under review with university admissions`,
      type: "info",
      count: underReview,
      link: "/agency/applications",
    });
  }
  if (pendingPaymentApplications > 0) {
    urgentTasks.push({
      id: "pending_payment",
      title: "Pending Fee Payments",
      description: `${pendingPaymentApplications} application(s) awaiting student processing fee payment`,
      type: "alert",
      count: pendingPaymentApplications,
      link: "/agency/applications",
    });
  }

  // Top 5 recent applications
  const recentApplications = apps.slice(0, 5).map((a) => ({
    id: a.id,
    studentName: a.studentName || "Student",
    studentEmail: a.studentEmail || "",
    programName: a.programName || "Program",
    universityName: a.universityName || "University",
    status: a.status,
    paymentStatus: a.paymentStatus,
    agencyShare: a.agencyShare || "0.00",
    applicationFee: a.applicationFee || "0.00",
    createdAt: a.createdAt,
    paidAt: a.paidAt,
  }));

  res.json({
    totalStudents: students.length,
    totalApplications,
    underReview,
    accepted,
    rejected,
    documentsRequested,
    submitted,
    draft,
    totalRevenue,
    grossTurnover,
    platformCommission,
    paidApplications,
    pendingPaymentApplications,
    successRate,
    urgentTasks,
    recentApplications,
  });
}