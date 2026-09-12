import { Request, Response } from "express";
import { z } from "zod";
import { and, desc, eq, notInArray } from "drizzle-orm";
import { db } from "@/db";
import { applications, programs, universities, documents, users, agencyProfiles, agencyStudents } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { notifyUser, notifyAdmins, getUserFullName } from "@/services/notificationService";

export async function listMyApplications(req: Request, res: Response) {
  const rows = await db
    .select({
      id: applications.id,
      status: applications.status,
      intake: applications.intake,
      notes: applications.notes,
      agencyId: applications.agencyId,
      submittedAt: applications.submittedAt,
      decidedAt: applications.decidedAt,
      createdAt: applications.createdAt,
      program: {
        id: programs.id,
        name: programs.name,
        degreeLevel: programs.degreeLevel,
      },
      university: {
        id: universities.id,
        name: universities.name,
        country: universities.country,
        logoUrl: universities.logoUrl,
      },
    })
    .from(applications)
    .innerJoin(programs, eq(applications.programId, programs.id))
    .innerJoin(universities, eq(programs.universityId, universities.id))
    .where(eq(applications.studentId, req.user!.id))
    .orderBy(desc(applications.createdAt));

  res.json({ data: rows });
}

export async function getMyApplicationStats(req: Request, res: Response) {
  const rows = await db
    .select({ status: applications.status })
    .from(applications)
    .where(eq(applications.studentId, req.user!.id));

  const stats = {
    total: rows.length,
    submitted: rows.filter((r) => r.status !== "draft").length,
    underReview: rows.filter((r) => r.status === "under_review").length,
    accepted: rows.filter((r) => r.status === "accepted").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    actionNeeded: rows.filter((r) => r.status === "documents_requested").length,
  };

  res.json(stats);
}

export async function getMyApplication(req: Request, res: Response) {
  const application = await db.query.applications.findFirst({
    where: and(eq(applications.id, req.params.id), eq(applications.studentId, req.user!.id)),
  });
  if (!application) throw new AppError("Application not found.", 404);

  const [program, applicationDocuments] = await Promise.all([
    db.query.programs.findFirst({ where: eq(programs.id, application.programId) }),
    db.select().from(documents).where(eq(documents.applicationId, application.id)),
  ]);

  const university = program
    ? await db.query.universities.findFirst({ where: eq(universities.id, program.universityId) })
    : null;

  let agency = null;
  if (application.agencyId) {
    const [agencyRow] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        companyName: agencyProfiles.companyName,
        website: agencyProfiles.website,
        address: agencyProfiles.address,
        isVerified: agencyProfiles.isVerified,
      })
      .from(users)
      .innerJoin(agencyProfiles, eq(users.id, agencyProfiles.userId))
      .where(eq(users.id, application.agencyId));
    agency = agencyRow ?? null;
  }

  res.json({ ...application, program, university, agency, documents: applicationDocuments });
}

const createApplicationSchema = z.object({
  programId: z.string().uuid(),
  agencyId: z.string().uuid().optional(),
  intake: z.string().optional(),
  notes: z.string().optional(),
});

export async function createMyApplication(req: Request, res: Response) {
  const data = createApplicationSchema.parse(req.body);

  const program = await db.query.programs.findFirst({ where: eq(programs.id, data.programId) });
  if (!program) throw new AppError("Program not found.", 404);

  const duplicate = await db.query.applications.findFirst({
    where: and(
      eq(applications.studentId, req.user!.id),
      eq(applications.programId, data.programId),
      notInArray(applications.status, ["withdrawn", "rejected"])
    ),
  });
  if (duplicate) {
    throw new AppError("You already have an active application for this program.", 409);
  }

  const [row] = await db
    .insert(applications)
    .values({
      studentId: req.user!.id,
      programId: data.programId,
      agencyId: data.agencyId ?? null,
      intake: data.intake,
      notes: data.notes,
    })
    .returning();

  const studentName = await getUserFullName(req.user!.id);

  if (data.agencyId) {
    await db
      .insert(agencyStudents)
      .values({
        agencyId: data.agencyId,
        studentId: req.user!.id,
      })
      .onConflictDoNothing();

    await notifyUser(data.agencyId, {
      type: "application_assigned",
      title: "New Student Application Assigned",
      body: `${studentName} started an application for ${program.name} and selected your agency.`,
    });
  }

  await notifyUser(req.user!.id, {
    type: "application_started",
    title: "Application Started",
    body: `You successfully started an application for ${program.name}.`,
  });

  await notifyAdmins({
    type: "application_created",
    title: "New Application Started",
    body: `${studentName} created an application for ${program.name}.`,
  });

  res.status(201).json(row);
}

const updateApplicationSchema = z.object({
  intake: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateMyApplication(req: Request, res: Response) {
  const data = updateApplicationSchema.parse(req.body);

  const existing = await db.query.applications.findFirst({
    where: and(eq(applications.id, req.params.id), eq(applications.studentId, req.user!.id)),
  });
  if (!existing) throw new AppError("Application not found.", 404);
  if (existing.status !== "draft") {
    throw new AppError("Only draft applications can be edited.", 409);
  }

  const [row] = await db
    .update(applications)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(applications.id, req.params.id))
    .returning();

  res.json(row);
}

export async function submitMyApplication(req: Request, res: Response) {
  const existing = await db.query.applications.findFirst({
    where: and(eq(applications.id, req.params.id), eq(applications.studentId, req.user!.id)),
  });
  if (!existing) throw new AppError("Application not found.", 404);
  if (existing.status !== "draft") {
    throw new AppError("This application has already been submitted.", 409);
  }

  const [row] = await db
    .update(applications)
    .set({ status: "submitted", submittedAt: new Date(), updatedAt: new Date() })
    .where(eq(applications.id, req.params.id))
    .returning();

  const studentName = await getUserFullName(req.user!.id);

  await notifyUser(req.user!.id, {
    type: "application_submitted",
    title: "Application Formally Submitted",
    body: "Your application has been submitted and is ready for review.",
  });

  if (row.agencyId) {
    await notifyUser(row.agencyId, {
      type: "application_submitted",
      title: "Student Submitted Application",
      body: `${studentName} has officially submitted their application.`,
    });
  }

  await notifyAdmins({
    type: "application_submitted",
    title: "Application Formally Submitted",
    body: `${studentName} officially submitted an application.`,
  });

  res.json(row);
}

export async function withdrawMyApplication(req: Request, res: Response) {
  const existing = await db.query.applications.findFirst({
    where: and(eq(applications.id, req.params.id), eq(applications.studentId, req.user!.id)),
  });
  if (!existing) throw new AppError("Application not found.", 404);
  if (["accepted", "rejected", "withdrawn"].includes(existing.status)) {
    throw new AppError(`Cannot withdraw an application that is already ${existing.status}.`, 409);
  }

  const [row] = await db
    .update(applications)
    .set({ status: "withdrawn", updatedAt: new Date() })
    .where(eq(applications.id, req.params.id))
    .returning();

  res.json(row);
}
