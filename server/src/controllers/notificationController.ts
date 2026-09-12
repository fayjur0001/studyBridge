import { Request, Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";

export async function listMyNotifications(req: Request, res: Response) {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, req.user!.id))
    .orderBy(desc(notifications.createdAt))
    .limit(30);

  const unreadCount = rows.filter((r) => !r.isRead).length;

  res.json({ data: rows, unreadCount });
}

export async function markMyNotificationsRead(req: Request, res: Response) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, req.user!.id));

  res.json({ success: true });
}

export async function markSingleNotificationRead(req: Request, res: Response) {
  const { id } = req.params;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, req.user!.id)));

  res.json({ success: true });
}
