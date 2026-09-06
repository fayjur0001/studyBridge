import { Request, Response } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notificationPreferences } from "@/db/schema";

export async function getMyNotificationPreferences(req: Request, res: Response) {
  const existing = await db.query.notificationPreferences.findFirst({
    where: eq(notificationPreferences.userId, req.user!.id),
  });
  if (existing) return res.json(existing);

  // Defaults for a user who hasn't saved preferences yet.
  res.json({
    userId: req.user!.id,
    emailOnApplicationUpdate: true,
    emailOnMessage: true,
    emailOnNewStudentLead: true,
  });
}

const updateSchema = z.object({
  emailOnApplicationUpdate: z.boolean().optional(),
  emailOnMessage: z.boolean().optional(),
  emailOnNewStudentLead: z.boolean().optional(),
});

export async function updateMyNotificationPreferences(req: Request, res: Response) {
  const data = updateSchema.parse(req.body);

  const [row] = await db
    .insert(notificationPreferences)
    .values({ userId: req.user!.id, ...data })
    .onConflictDoUpdate({
      target: notificationPreferences.userId,
      set: { ...data, updatedAt: new Date() },
    })
    .returning();

  res.json(row);
}
