import { Request, Response } from "express";
import { z } from "zod";
import { and, eq, ilike, or, SQL } from "drizzle-orm";
import { db } from "@/db";
import { programs, universities } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { paginationSchema, paginationMeta } from "@/utils/pagination";

const listQuerySchema = paginationSchema.extend({
  universityId: z.string().uuid().optional(),
  field: z.string().trim().min(1).optional(),
  degreeLevel: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});

export async function listPrograms(req: Request, res: Response) {
  const q = listQuerySchema.parse(req.query);

  const conditions: SQL[] = [];
  if (q.universityId) conditions.push(eq(programs.universityId, q.universityId));
  if (q.field) conditions.push(ilike(programs.field, `%${q.field}%`));
  if (q.degreeLevel) conditions.push(eq(programs.degreeLevel, q.degreeLevel));
  if (q.search) conditions.push(or(
    ilike(programs.name, `%${q.search}%`),
    ilike(programs.field, `%${q.search}%`),
    ilike(programs.description, `%${q.search}%`),
  )!);

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (q.page - 1) * q.limit;

  const [rows, total] = await Promise.all([
    db.select().from(programs).where(where).limit(q.limit).offset(offset),
    db.$count(programs, where),
  ]);

  res.json({ data: rows, meta: paginationMeta(q.page, q.limit, total) });
}

export async function getProgram(req: Request, res: Response) {
  const program = await db.query.programs.findFirst({
    where: eq(programs.id, req.params.id),
  });
  if (!program) throw new AppError("Program not found.", 404);
  res.json(program);
}

const programInputSchema = z.object({
  universityId: z.string().uuid(),
  name: z.string().min(2),
  degreeLevel: z.string().min(2),
  field: z.string().optional(),
  durationMonths: z.coerce.number().int().positive().optional(),
  tuitionFeeUsd: z.coerce.number().nonnegative().optional(),
  intakeMonths: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export async function createProgram(req: Request, res: Response) {
  const data = programInputSchema.parse(req.body);

  const university = await db.query.universities.findFirst({
    where: eq(universities.id, data.universityId),
  });
  if (!university) throw new AppError("University not found.", 404);

  const [row] = await db
    .insert(programs)
    .values({ ...data, tuitionFeeUsd: data.tuitionFeeUsd?.toString() })
    .returning();
  res.status(201).json(row);
}

export async function updateProgram(req: Request, res: Response) {
  const data = programInputSchema.partial().parse(req.body);
  const [row] = await db
    .update(programs)
    .set({
      ...data,
      tuitionFeeUsd: data.tuitionFeeUsd !== undefined ? data.tuitionFeeUsd.toString() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(programs.id, req.params.id))
    .returning();
  if (!row) throw new AppError("Program not found.", 404);
  res.json(row);
}

export async function deleteProgram(req: Request, res: Response) {
  const [row] = await db
    .delete(programs)
    .where(eq(programs.id, req.params.id))
    .returning({ id: programs.id });
  if (!row) throw new AppError("Program not found.", 404);
  res.status(204).send();
}
