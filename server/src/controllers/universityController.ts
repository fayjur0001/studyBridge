import { Request, Response } from "express";
import { z } from "zod";
import { and, asc, desc, eq, ilike, lte, or, SQL } from "drizzle-orm";
import { db } from "@/db";
import { universities, programs } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { paginationSchema, paginationMeta } from "@/utils/pagination";
import { optionalUrl } from "@/utils/zodHelpers";

const listQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).optional(),
  country: z.string().trim().min(1).optional(),
  region: z.string().trim().min(1).optional(),
  maxRanking: z.coerce.number().int().positive().optional(),
  sort: z.enum(["ranking", "name"]).default("ranking"),
});

export async function listUniversities(req: Request, res: Response) {
  const q = listQuerySchema.parse(req.query);

  const conditions: SQL[] = [];
  if (q.search) conditions.push(or(
    ilike(universities.name, `%${q.search}%`),
    ilike(universities.country, `%${q.search}%`),
    ilike(universities.city, `%${q.search}%`),
    ilike(universities.region, `%${q.search}%`),
  )!);
  if (q.country) conditions.push(eq(universities.country, q.country));
  if (q.region) conditions.push(eq(universities.region, q.region));
  if (q.maxRanking) conditions.push(lte(universities.ranking, q.maxRanking));

  const where = conditions.length ? and(...conditions) : undefined;
  const orderBy = q.sort === "name" ? asc(universities.name) : asc(universities.ranking);

  const offset = (q.page - 1) * q.limit;

  const [rows, total] = await Promise.all([
    db.select().from(universities).where(where).orderBy(orderBy).limit(q.limit).offset(offset),
    db.$count(universities, where),
  ]);

  res.json({ data: rows, meta: paginationMeta(q.page, q.limit, total) });
}

export async function getUniversity(req: Request, res: Response) {
  const university = await db.query.universities.findFirst({
    where: eq(universities.id, req.params.id),
  });
  if (!university) throw new AppError("University not found.", 404);

  const universityPrograms = await db
    .select()
    .from(programs)
    .where(eq(programs.universityId, university.id))
    .orderBy(desc(programs.createdAt));

  res.json({ ...university, programs: universityPrograms });
}

const universityInputSchema = z.object({
  name: z.string().min(2),
  country: z.string().min(2),
  region: z.string().optional(),
  city: z.string().optional(),
  logoUrl: optionalUrl(),
  coverImageUrl: optionalUrl(),
  description: z.string().optional(),
  ranking: z.coerce.number().int().positive().optional(),
  websiteUrl: optionalUrl(),
  isFeatured: z.boolean().optional(),
});

export async function createUniversity(req: Request, res: Response) {
  const data = universityInputSchema.parse(req.body);
  const [row] = await db.insert(universities).values(data).returning();
  res.status(201).json(row);
}

export async function updateUniversity(req: Request, res: Response) {
  const data = universityInputSchema.partial().parse(req.body);
  const [row] = await db
    .update(universities)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(universities.id, req.params.id))
    .returning();
  if (!row) throw new AppError("University not found.", 404);
  res.json(row);
}

export async function deleteUniversity(req: Request, res: Response) {
  const [row] = await db
    .delete(universities)
    .where(eq(universities.id, req.params.id))
    .returning({ id: universities.id });
  if (!row) throw new AppError("University not found.", 404);
  res.status(204).send();
}
