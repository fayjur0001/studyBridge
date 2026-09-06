import { Request, Response } from "express";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { agencyServices } from "@/db/schema";
import { AppError } from "@/utils/AppError";

export async function listMyServices(req: Request, res: Response) {
  const rows = await db
    .select()
    .from(agencyServices)
    .where(eq(agencyServices.agencyId, req.user!.id));
  res.json({ data: rows });
}

const serviceInputSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  priceUsd: z.coerce.number().nonnegative().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function createMyService(req: Request, res: Response) {
  const data = serviceInputSchema.parse(req.body);
  const [row] = await db
    .insert(agencyServices)
    .values({ ...data, agencyId: req.user!.id, priceUsd: data.priceUsd?.toString() })
    .returning();
  res.status(201).json(row);
}

export async function updateMyService(req: Request, res: Response) {
  const data = serviceInputSchema.partial().parse(req.body);
  const [row] = await db
    .update(agencyServices)
    .set({
      ...data,
      priceUsd: data.priceUsd !== undefined ? data.priceUsd.toString() : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(agencyServices.id, req.params.id), eq(agencyServices.agencyId, req.user!.id)))
    .returning();
  if (!row) throw new AppError("Service not found.", 404);
  res.json(row);
}

export async function deleteMyService(req: Request, res: Response) {
  const [row] = await db
    .delete(agencyServices)
    .where(and(eq(agencyServices.id, req.params.id), eq(agencyServices.agencyId, req.user!.id)))
    .returning({ id: agencyServices.id });
  if (!row) throw new AppError("Service not found.", 404);
  res.status(204).send();
}
