import { Request, Response } from "express";
import { z } from "zod";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import path from "path";
import { db } from "@/db";
import {
  applications,
  programs,
  universities,
  users,
  agencyStudents,
  documents,
  agencyProfiles,
} from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { env } from "@/config/env";
import { notifyUser, notifyAdmins } from "@/services/notificationService";

// An application belongs to "my" agency scope if:
// 1. It was specifically assigned to my agency (applications.agencyId = agencyId), OR
// 2. No specific agency was selected (applications.agencyId is null) but the student
//    is linked to this agency in agencyStudents.
async function assertOwnedByAgency(applicationId: string, agencyId: string) {
  const [row] = await db
    .select({ id: applications.id })
    .from(applications)
    .leftJoin(agencyStudents, eq(applications.studentId, agencyStudents.studentId))
    .where(
      and(
        eq(applications.id, applicationId),
        or(
          eq(applications.agencyId, agencyId),
          and(isNull(applications.agencyId), eq(agencyStudents.agencyId, agencyId))
        )
      )
    );

  if (!row) throw new AppError("Application not found.", 404);
}

export async function listAgencyApplications(req: Request, res: Response) {
  const rows = await db
    .select({
      id: applications.id,
      status: applications.status,
      intake: applications.intake,
      agencyNotes: applications.agencyNotes,
      submittedAt: applications.submittedAt,
      createdAt: applications.createdAt,
      studentName: users.fullName,
      studentEmail: users.email,
      programName: programs.name,
      universityName: universities.name,
    })
    .from(applications)
    .leftJoin(agencyStudents, eq(applications.studentId, agencyStudents.studentId))
    .innerJoin(users, eq(applications.studentId, users.id))
    .innerJoin(programs, eq(applications.programId, programs.id))
    .innerJoin(universities, eq(programs.universityId, universities.id))
    .where(
      or(
        eq(applications.agencyId, req.user!.id),
        and(isNull(applications.agencyId), eq(agencyStudents.agencyId, req.user!.id))
      )
    )
    .orderBy(desc(applications.createdAt));

  const uniqueRows = Array.from(new Map(rows.map((r) => [r.id, r])).values());
  res.json({ data: uniqueRows });
}

const updateStatusSchema = z.object({
  status: z.enum(["under_review", "documents_requested", "accepted", "rejected"]),
  agencyNotes: z.string().optional(),
});

export async function updateAgencyApplicationStatus(req: Request, res: Response) {
  await assertOwnedByAgency(req.params.id, req.user!.id);

  const data = updateStatusSchema.parse(req.body);
  const isFinal = data.status === "accepted" || data.status === "rejected";

  const [row] = await db
    .update(applications)
    .set({
      status: data.status,
      agencyNotes: data.agencyNotes,
      decidedAt: isFinal ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, req.params.id))
    .returning();

  // If agency counselor uploaded a file (e.g. Offer Letter or University Submission Proof)
  let attachedDocument = null;
  if (req.file) {
    const relativePath = path.relative(path.resolve(env.uploadDir), req.file.path);
    const docType =
      data.status === "accepted"
        ? "Official Offer Letter"
        : data.status === "under_review"
        ? "University Submission Confirmation"
        : "Agency Attached Document";

    const [doc] = await db
      .insert(documents)
      .values({
        studentId: row.studentId,
        applicationId: row.id,
        type: docType,
        fileName: req.file.originalname,
        filePath: relativePath,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        status: "approved",
        reviewedBy: req.user!.id,
        reviewNote: data.agencyNotes ?? `Document uploaded by agency counselor for status: ${data.status}`,
      })
      .returning();
    attachedDocument = doc;
  }

  // Fetch agency profile details for personalized notification
  const agencyProfile = await db.query.agencyProfiles.findFirst({
    where: eq(agencyProfiles.userId, req.user!.id),
  });
  const agencyUser = await db.query.users.findFirst({
    where: eq(users.id, req.user!.id),
  });
  const agencyName = agencyProfile?.companyName ?? agencyUser?.fullName ?? "Your guidance agency";

  const formattedStatus = data.status.replace("_", " ");
  let studentNotifTitle = `Application Status: ${formattedStatus.charAt(0).toUpperCase() + formattedStatus.slice(1)}`;
  let studentNotifBody = `${agencyName} updated your application status to "${formattedStatus}".${data.agencyNotes ? ` Counselor Note: "${data.agencyNotes}"` : ""}`;
  let notifType = "application_status_updated";

  if (data.status === "accepted") {
    notifType = "offer_letter_issued";
    studentNotifTitle = "🎉 Congratulations! Offer Letter Issued";
    studentNotifBody = `${agencyName} has updated your application to ACCEPTED! Your admissions offer is officially confirmed.${data.agencyNotes ? ` Counselor Note: "${data.agencyNotes}"` : ""}`;
  } else if (data.status === "documents_requested") {
    notifType = "documents_requested";
    studentNotifTitle = "⚠️ Additional Documents Required";
    studentNotifBody = `Action needed: ${agencyName} requested additional or updated documents for your application.${data.agencyNotes ? ` Note: "${data.agencyNotes}"` : ""}`;
  } else if (data.status === "under_review") {
    studentNotifTitle = "Application Submitted to University 🎓";
    studentNotifBody = `${agencyName} has submitted your application to the university (Under Review).${data.agencyNotes ? ` Note: "${data.agencyNotes}"` : ""}`;
  }

  if (req.file) {
    studentNotifBody += `\n📎 Document attached: ${req.file.originalname}`;
  }
  studentNotifBody += `\n(Application Ref: ${row.id})`;

  await notifyUser(row.studentId, {
    type: notifType,
    title: studentNotifTitle,
    body: studentNotifBody,
  });

  await notifyAdmins({
    type: notifType,
    title: data.status === "accepted" ? "🎉 Student Admission Accepted" : "Application Status Updated",
    body: `${agencyName} updated application ${row.id.slice(0, 8)} status to "${formattedStatus}".${req.file ? ` Attached: ${req.file.originalname}` : ""}`,
  });

  res.json({ application: row, attachedDocument });
}