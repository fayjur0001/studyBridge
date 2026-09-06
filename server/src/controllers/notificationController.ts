import { Request, Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";

export async function listMyNotifications(req: Request, res: Response) {
  const rows = await db.select().from(notifications).where(eq(notifications.userId, req.user!.id)).orderBy(desc(notifications.createdAt)).limit(20);
  res.json({ data: rows });
}

export async function markMyNotificationsRead(req: Request, res: Response) {
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, req.user!.id));
  res.status(204).send();
}
