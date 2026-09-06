import { Request, Response } from "express";
import { z } from "zod";
import { and, asc, eq, gte, ilike, SQL } from "drizzle-orm";
import { db } from "@/db";
import { scholarships } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { paginationSchema, paginationMeta } from "@/utils/pagination";
import { optionalUrl } from "@/utils/zodHelpers";

const listQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  universityId: z.string().uuid().optional(),
  upcomingOnly: z.coerce.boolean().default(false),
});

export async function listScholarships(req: Request, res: Response) {
  const q = listQuerySchema.parse(req.query);

  const conditions: SQL[] = [];
  if (q.search) conditions.push(ilike(scholarships.title, `%${q.search}%`));
  if (q.category) conditions.push(eq(scholarships.category, q.category));
  if (q.universityId) conditions.push(eq(scholarships.universityId, q.universityId));
  if (q.upcomingOnly) conditions.push(gte(scholarships.deadline, new Date()));

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (q.page - 1) * q.limit;

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(scholarships)
      .where(where)
      .orderBy(asc(scholarships.deadline))
      .limit(q.limit)
      .offset(offset),
    db.$count(scholarships, where),
  ]);

  res.json({ data: rows, meta: paginationMeta(q.page, q.limit, total) });
}

export async function getScholarship(req: Request, res: Response) {
  const scholarship = await db.query.scholarships.findFirst({
    where: eq(scholarships.id, req.params.id),
  });
  if (!scholarship) throw new AppError("Scholarship not found.", 404);
  res.json(scholarship);
}

const scholarshipInputSchema = z.object({
  universityId: z.string().uuid().optional(),
  title: z.string().min(2),
  provider: z.string().optional(),
  category: z.string().optional(),
  amountUsd: z.coerce.number().nonnegative().optional(),
  coveragePercent: z.coerce.number().int().min(0).max(100).optional(),
  deadline: z.coerce.date().optional(),
  eligibility: z.string().optional(),
  description: z.string().optional(),
  applyUrl: optionalUrl(),
});

export async function createScholarship(req: Request, res: Response) {
  const data = scholarshipInputSchema.parse(req.body);
  const [row] = await db
    .insert(scholarships)
    .values({ ...data, amountUsd: data.amountUsd?.toString() })
    .returning();
  res.status(201).json(row);
}

export async function updateScholarship(req: Request, res: Response) {
  const data = scholarshipInputSchema.partial().parse(req.body);
  const [row] = await db
    .update(scholarships)
    .set({
      ...data,
      amountUsd: data.amountUsd !== undefined ? data.amountUsd.toString() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(scholarships.id, req.params.id))
    .returning();
  if (!row) throw new AppError("Scholarship not found.", 404);
  res.json(row);
}

export async function deleteScholarship(req: Request, res: Response) {
  const [row] = await db
    .delete(scholarships)
    .where(eq(scholarships.id, req.params.id))
    .returning({ id: scholarships.id });
  if (!row) throw new AppError("Scholarship not found.", 404);
  res.status(204).send();
}
