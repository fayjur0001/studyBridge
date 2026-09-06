import { Request, Response } from "express";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { refreshTokens, userSettings, users } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { hashToken } from "@/utils/jwt";

const defaults = { language: "en-GB", timezone: "Etc/GMT", currency: "GBP", displayMode: "light" } as const;
const updateSettingsSchema = z.object({
  language: z.enum(["en-GB", "en-US", "fr-FR", "es-ES", "de-DE"]).optional(),
  timezone: z.enum(["Etc/GMT", "Europe/Paris", "America/New_York"]).optional(),
  currency: z.enum(["GBP", "USD", "EUR"]).optional(),
  displayMode: z.enum(["light", "dark"]).optional(),
});

export async function getMySettings(req: Request, res: Response) {
  const settings = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, req.user!.id) });
  res.json(settings ?? { userId: req.user!.id, ...defaults });
}

export async function updateMySettings(req: Request, res: Response) {
  const data = updateSettingsSchema.parse(req.body);
  const [settings] = await db.insert(userSettings).values({ userId: req.user!.id, ...data })
    .onConflictDoUpdate({ target: userSettings.userId, set: { ...data, updatedAt: new Date() } }).returning();
  res.json(settings);
}

export async function getMySessions(req: Request, res: Response) {
  const currentToken = req.cookies?.refresh_token as string | undefined;
  const currentHash = currentToken ? hashToken(currentToken) : null;
  const sessions = await db.select({ id: refreshTokens.id, tokenHash: refreshTokens.tokenHash, deviceName: refreshTokens.deviceName, ipAddress: refreshTokens.ipAddress, createdAt: refreshTokens.createdAt })
    .from(refreshTokens)
    .where(and(eq(refreshTokens.userId, req.user!.id), isNull(refreshTokens.revokedAt), gt(refreshTokens.expiresAt, new Date())))
    .orderBy(desc(refreshTokens.createdAt));
  res.json(sessions.map(({ tokenHash, ...session }) => ({ ...session, isCurrent: tokenHash === currentHash })));
}

export async function revokeMySession(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const [session] = await db.update(refreshTokens).set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.id, id), eq(refreshTokens.userId, req.user!.id), isNull(refreshTokens.revokedAt)))
    .returning({ id: refreshTokens.id });
  if (!session) throw new AppError("Session not found or already ended.", 404);
  res.status(204).send();
}

export async function deactivateMyAccount(req: Request, res: Response) {
  await db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, req.user!.id));
  await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.userId, req.user!.id));
  res.clearCookie("refresh_token", { path: "/api/auth" });
  res.json({ message: "Your account has been deactivated." });
}
