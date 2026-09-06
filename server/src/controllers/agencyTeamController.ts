import { Request, Response } from "express";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { agencyTeamMembers } from "@/db/schema";
import { AppError } from "@/utils/AppError";

const roles = ["Admin", "Senior Agent", "Counselor", "Support"] as const;
const memberInput = z.object({
  fullName: z.string().trim().min(2).max(255),
  email: z.string().trim().email().max(255).transform((email) => email.toLowerCase()),
  role: z.enum(roles).default("Counselor"),
});

export async function listMyTeam(req: Request, res: Response) {
  const data = await db.select().from(agencyTeamMembers)
    .where(eq(agencyTeamMembers.agencyId, req.user!.id))
    .orderBy(asc(agencyTeamMembers.createdAt));
  res.json({ data });
}

export async function inviteTeamMember(req: Request, res: Response) {
  const data = memberInput.parse(req.body);
  const duplicate = await db.query.agencyTeamMembers.findFirst({
    where: and(eq(agencyTeamMembers.agencyId, req.user!.id), eq(agencyTeamMembers.email, data.email)),
  });
  if (duplicate) throw new AppError("This email is already part of your team.", 409);
  const [member] = await db.insert(agencyTeamMembers)
    .values({ agencyId: req.user!.id, ...data, status: "pending" })
    .returning();
  // An email delivery provider is not configured yet. The persisted pending
  // invitation keeps the workflow ready for that integration.
  res.status(201).json(member);
}

export async function updateTeamMember(req: Request, res: Response) {
  const memberId = z.string().uuid().parse(req.params.id);
  const data = z.object({ role: z.enum(roles).optional(), status: z.enum(["pending", "active"]).optional() }).parse(req.body);
  const [member] = await db.update(agencyTeamMembers).set({ ...data, updatedAt: new Date() })
    .where(and(eq(agencyTeamMembers.id, memberId), eq(agencyTeamMembers.agencyId, req.user!.id))).returning();
  if (!member) throw new AppError("Team member not found.", 404);
  res.json(member);
}

export async function removeTeamMember(req: Request, res: Response) {
  const memberId = z.string().uuid().parse(req.params.id);
  const [member] = await db.delete(agencyTeamMembers)
    .where(and(eq(agencyTeamMembers.id, memberId), eq(agencyTeamMembers.agencyId, req.user!.id)))
    .returning({ id: agencyTeamMembers.id });
  if (!member) throw new AppError("Team member not found.", 404);
  res.status(204).send();
}
