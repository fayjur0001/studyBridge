import { Request, Response } from "express";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, programs, universities, users, agencyStudents } from "@/db/schema";
import { AppError } from "@/utils/AppError";

// An application belongs to "my" agency scope if the student it belongs to
// is currently linked to this agency (agencyStudents join table — a student
// can be linked to more than one agency).
async function assertOwnedByAgency(applicationId: string, agencyId: string) {
  const [row] = await db
    .select({ id: applications.id })
    .from(applications)
    .innerJoin(agencyStudents, eq(applications.studentId, agencyStudents.studentId))
    .where(and(eq(applications.id, applicationId), eq(agencyStudents.agencyId, agencyId)));

  if (!row) throw new AppError("Application not found.", 404);
}

export async function listAgencyApplications(req: Request, res: Response) {
  const rows = await db
    .select({
      id: applications.id,
      status: applications.status,
      intake: applications.intake,
      submittedAt: applications.submittedAt,
      createdAt: applications.createdAt,
      studentName: users.fullName,
      studentEmail: users.email,
      programName: programs.name,
      universityName: universities.name,
    })
    .from(applications)
    .innerJoin(agencyStudents, eq(applications.studentId, agencyStudents.studentId))
    .innerJoin(users, eq(applications.studentId, users.id))
    .innerJoin(programs, eq(applications.programId, programs.id))
    .innerJoin(universities, eq(programs.universityId, universities.id))
    .where(eq(agencyStudents.agencyId, req.user!.id))
    .orderBy(desc(applications.createdAt));

  res.json({ data: rows });
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

  res.json(row);
}