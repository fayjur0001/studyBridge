import { Request, Response } from "express";
import { z } from "zod";
import { and, desc, eq, ilike, SQL } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { paginationSchema, paginationMeta } from "@/utils/pagination";

const listQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).optional(),
  role: z.enum(["student", "agency", "admin"]).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export async function listUsers(req: Request, res: Response) {
  const q = listQuerySchema.parse(req.query);

  const conditions: SQL[] = [];
  if (q.search) conditions.push(ilike(users.fullName, `%${q.search}%`));
  if (q.role) conditions.push(eq(users.role, q.role));
  if (q.isActive !== undefined) conditions.push(eq(users.isActive, q.isActive));

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (q.page - 1) * q.limit;

  const [rows, total] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(q.limit)
      .offset(offset),
    db.$count(users, where),
  ]);

  res.json({ data: rows, meta: paginationMeta(q.page, q.limit, total) });
}

export async function getUser(req: Request, res: Response) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.params.id),
    with: { studentProfile: true, agencyProfile: true },
  });
  if (!user) throw new AppError("User not found.", 404);
  const { passwordHash, ...safeUser } = user;
  void passwordHash;
  res.json(safeUser);
}

const setActiveSchema = z.object({ isActive: z.boolean() });

export async function setUserActive(req: Request, res: Response) {
  const data = setActiveSchema.parse(req.body);

  if (req.params.id === req.user!.id && !data.isActive) {
    throw new AppError("You cannot suspend your own account.", 400);
  }

  const [row] = await db
    .update(users)
    .set({ isActive: data.isActive, updatedAt: new Date() })
    .where(eq(users.id, req.params.id))
    .returning({ id: users.id, isActive: users.isActive });

  if (!row) throw new AppError("User not found.", 404);
  res.json(row);
}
