import { Request, Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import path from "path";
import fs from "fs/promises";
import { db } from "@/db";
import { agencyFiles } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { env } from "@/config/env";

const categorySchema = z.enum(["business_document", "certification"]);

export async function listMyAgencyFiles(req: Request, res: Response) {
  const rows = await db.select().from(agencyFiles).where(eq(agencyFiles.agencyId, req.user!.id)).orderBy(desc(agencyFiles.createdAt));
  res.json({ data: rows });
}

export async function uploadAgencyFile(req: Request, res: Response) {
  if (!req.file) throw new AppError("No file was uploaded.", 422);
  const data = z.object({ category: categorySchema, title: z.string().min(2).max(255), expiresAt: z.string().datetime().optional() }).parse(req.body);
  const relativePath = path.relative(path.resolve(env.uploadDir), req.file.path);
  const [row] = await db.insert(agencyFiles).values({
    agencyId: req.user!.id, category: data.category, title: data.title,
    fileName: req.file.originalname, filePath: relativePath, mimeType: req.file.mimetype,
    sizeBytes: req.file.size, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
  }).returning();
  res.status(201).json(row);
}

export async function deleteMyAgencyFile(req: Request, res: Response) {
  const file = await db.query.agencyFiles.findFirst({ where: and(eq(agencyFiles.id, req.params.id), eq(agencyFiles.agencyId, req.user!.id)) });
  if (!file) throw new AppError("File not found.", 404);
  await db.delete(agencyFiles).where(eq(agencyFiles.id, file.id));
  await fs.unlink(path.join(path.resolve(env.uploadDir), file.filePath)).catch(() => {});
  res.status(204).send();
}

export async function viewAgencyFile(req: Request, res: Response) {
  const file = await db.query.agencyFiles.findFirst({ where: eq(agencyFiles.id, req.params.id) });
  if (!file || (file.category === "business_document" && file.agencyId !== req.user?.id && req.user?.role !== "admin")) throw new AppError("File not found.", 404);
  const root = path.resolve(env.uploadDir); const fullPath = path.resolve(root, file.filePath);
  if (!fullPath.startsWith(`${root}${path.sep}`)) throw new AppError("Invalid file path.", 400);
  try { await fs.access(fullPath); } catch { throw new AppError("File is no longer available.", 404); }
  res.type(file.mimeType ?? "application/octet-stream");
  res.setHeader("Content-Disposition", `${req.query.download === "true" ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(file.fileName)}`);
  res.sendFile(fullPath);
}
