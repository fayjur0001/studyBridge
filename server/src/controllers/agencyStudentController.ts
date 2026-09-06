import { Request, Response } from "express";
import { z } from "zod";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users, studentProfiles, applications, programs, universities, documents, agencyStudents } from "@/db/schema";
import { AppError } from "@/utils/AppError";

export async function listMyStudents(req: Request, res: Response) {
  const rows = await db
    .select({
      userId: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      avatarUrl: users.avatarUrl,
      nationality: studentProfiles.nationality,
      currentEducationLevel: studentProfiles.currentEducationLevel,
      preferredCountries: studentProfiles.preferredCountries,
    })
    .from(agencyStudents)
    .innerJoin(users, eq(agencyStudents.studentId, users.id))
    .innerJoin(studentProfiles, eq(studentProfiles.userId, agencyStudents.studentId))
    .where(eq(agencyStudents.agencyId, req.user!.id));

  res.json({ data: rows });
}

export async function getMyStudent(req: Request, res: Response) {
  const link = await db.query.agencyStudents.findFirst({
    where: and(eq(agencyStudents.studentId, req.params.id), eq(agencyStudents.agencyId, req.user!.id)),
  });
  if (!link) throw new AppError("Student not found.", 404);

  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, req.params.id),
  });
  if (!profile) throw new AppError("Student not found.", 404);

  const user = await db.query.users.findFirst({ where: eq(users.id, profile.userId) });

  const studentApplications = await db
    .select({
      id: applications.id,
      status: applications.status,
      createdAt: applications.createdAt,
      programName: programs.name,
      universityName: universities.name,
    })
    .from(applications)
    .innerJoin(programs, eq(applications.programId, programs.id))
    .innerJoin(universities, eq(programs.universityId, universities.id))
    .where(eq(applications.studentId, profile.userId));

  const applicationIds = studentApplications.map((a) => a.id);
  const applicationDocuments =
    applicationIds.length > 0
      ? await db
          .select({
            id: documents.id,
            applicationId: documents.applicationId,
            type: documents.type,
            fileName: documents.fileName,
            status: documents.status,
            reviewNote: documents.reviewNote,
          })
          .from(documents)
          .where(inArray(documents.applicationId, applicationIds))
      : [];

  const applicationsWithDocuments = studentApplications.map((app) => ({
    ...app,
    documents: applicationDocuments.filter((d) => d.applicationId === app.id),
  }));

  const { passwordHash, ...safeUser } = user!;
  void passwordHash;

  res.json({ ...safeUser, profile, applications: applicationsWithDocuments });
}

const linkStudentSchema = z.object({
  email: z.string().email(),
});

// Links an existing (unaffiliated) student account to this agency.
// A student can be linked to more than one agency at the same time — this
// only rejects a duplicate link to the SAME agency, not to other agencies.
export async function linkStudent(req: Request, res: Response) {
  const data = linkStudentSchema.parse(req.body);

  const student = await db.query.users.findFirst({
    where: and(eq(users.email, data.email.toLowerCase()), eq(users.role, "student")),
  });
  if (!student) throw new AppError("No student account found with this email.", 404);

  const profile = await db.query.studentProfiles.findFirst({
    where: eq(studentProfiles.userId, student.id),
  });
  if (!profile) throw new AppError("Student profile not found.", 404);

  const existingLink = await db.query.agencyStudents.findFirst({
    where: and(eq(agencyStudents.studentId, student.id), eq(agencyStudents.agencyId, req.user!.id)),
  });
  if (existingLink) {
    throw new AppError("This student is already linked to your agency.", 409);
  }

  const [row] = await db
    .insert(agencyStudents)
    .values({ agencyId: req.user!.id, studentId: student.id })
    .returning();

  res.json(row);
}

export async function unlinkStudent(req: Request, res: Response) {
  const link = await db.query.agencyStudents.findFirst({
    where: and(eq(agencyStudents.studentId, req.params.id), eq(agencyStudents.agencyId, req.user!.id)),
  });
  if (!link) throw new AppError("Student not found.", 404);

  await db
    .delete(agencyStudents)
    .where(and(eq(agencyStudents.studentId, req.params.id), eq(agencyStudents.agencyId, req.user!.id)));

  res.status(204).send();
}