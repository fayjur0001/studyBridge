import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface NotificationPayload {
  type: string;
  title: string;
  body?: string | null;
}

export async function getUserFullName(userId: string): Promise<string> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { fullName: true },
  });
  return user?.fullName ?? "A user";
}

export async function notifyUser(userId: string, payload: NotificationPayload) {
  try {
    const [row] = await db
      .insert(notifications)
      .values({
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body ?? null,
        isRead: false,
      })
      .returning();
    return row;
  } catch (err) {
    console.error(`Failed to create notification for user ${userId}:`, err);
    return null;
  }
}

export async function notifyUsers(userIds: string[], payload: NotificationPayload) {
  const uniqueIds = Array.from(new Set(userIds)).filter(Boolean);
  if (!uniqueIds.length) return [];

  try {
    const rows = await db
      .insert(notifications)
      .values(
        uniqueIds.map((userId) => ({
          userId,
          type: payload.type,
          title: payload.title,
          body: payload.body ?? null,
          isRead: false,
        }))
      )
      .returning();
    return rows;
  } catch (err) {
    console.error("Failed to create bulk notifications:", err);
    return [];
  }
}

export async function notifyAdmins(payload: NotificationPayload) {
  try {
    const adminUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"));

    if (!adminUsers.length) return [];

    return await notifyUsers(
      adminUsers.map((a) => a.id),
      payload
    );
  } catch (err) {
    console.error("Failed to notify admins:", err);
    return [];
  }
}
