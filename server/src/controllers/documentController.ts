import { Request, Response } from "express";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import path from "path";
import fs from "fs/promises";
import { db } from "@/db";
import { documents, applications, agencyStudents } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { env } from "@/config/env";

export async function listMyDocuments(req: Request, res: Response) {
  const rows = await db
    .select()
    .from(documents)
    .where(eq(documents.studentId, req.user!.id))
    .orderBy(desc(documents.createdAt));
  res.json({ data: rows });
}

const uploadBodySchema = z.object({
  type: z.string().min(2),
  applicationId: z.string().uuid().optional(),
});

export async function uploadMyDocument(req: Request, res: Response) {
  if (!req.file) {
    throw new AppError("No file was uploaded.", 422);
  }
  const data = uploadBodySchema.parse(req.body);

  if (data.applicationId) {
    const owned = await db.query.applications.findFirst({
      where: and(eq(applications.id, data.applicationId), eq(applications.studentId, req.user!.id)),
    });
    if (!owned) throw new AppError("Application not found.", 404);
  }

  const relativePath = path.relative(path.resolve(env.uploadDir), req.file.path);

  const [row] = await db
    .insert(documents)
    .values({
      studentId: req.user!.id,
      applicationId: data.applicationId,
      type: data.type,
      fileName: req.file.originalname,
      filePath: relativePath,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    })
    .returning();

  res.status(201).json(row);
}

export async function deleteMyDocument(req: Request, res: Response) {
  const doc = await db.query.documents.findFirst({
    where: and(eq(documents.id, req.params.id), eq(documents.studentId, req.user!.id)),
  });
  if (!doc) throw new AppError("Document not found.", 404);
  if (doc.status === "approved") {
    throw new AppError("An approved document cannot be deleted.", 409);
  }

  await db.delete(documents).where(eq(documents.id, doc.id));

  const fullPath = path.join(path.resolve(env.uploadDir), doc.filePath);
  await fs.unlink(fullPath).catch(() => {
    // File already missing on disk — nothing further to clean up.
  });

  res.status(204).send();
}

const reviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewNote: z.string().optional(),
});

// Used by agency/admin reviewers.
export async function reviewDocument(req: Request, res: Response) {
  const data = reviewSchema.parse(req.body);

  const doc = await db.query.documents.findFirst({ where: eq(documents.id, req.params.id) });
  if (!doc) throw new AppError("Document not found.", 404);

  if (req.user!.role === "agency") {
    const link = await db.query.agencyStudents.findFirst({
      where: and(eq(agencyStudents.studentId, doc.studentId), eq(agencyStudents.agencyId, req.user!.id)),
    });
    if (!link) throw new AppError("Document not found.", 404);
  }

  const [row] = await db
    .update(documents)
    .set({
      status: data.status,
      reviewNote: data.reviewNote,
      reviewedBy: req.user!.id,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, req.params.id))
    .returning();

  res.json(row);
}