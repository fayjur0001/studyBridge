import { Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "@/db";
import { users, studentProfiles, agencyProfiles, refreshTokens, passwordResetTokens } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "@/utils/jwt";
import { AppError } from "@/utils/AppError";
import { env } from "@/config/env";
import { parseDurationMs } from "@/utils/duration";

const REFRESH_COOKIE = "refresh_token";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const REFRESH_TTL_MS = parseDurationMs(env.jwtRefreshExpiresIn, THIRTY_DAYS_MS);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  fullName: z.string().min(2),
  role: z.enum(["student", "agency", "admin"]).default("student"),
  companyName: z.string().min(2).optional(), // required if role === agency
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["student", "agency", "admin"]),
});

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax" as const,
    path: "/api/auth",
    maxAge: REFRESH_TTL_MS,
  };
}

async function issueTokens(res: Response, user: { id: string; role: "student" | "agency" | "admin" }) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
  return accessToken;
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);

  if (data.role === "agency" && !data.companyName) {
    throw new AppError("Company name is required for agency accounts.", 422);
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.email, data.email.toLowerCase()),
  });
  if (existing) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const passwordHash = await hashPassword(data.password);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.fullName,
      role: data.role,
    })
    .returning();

  if (data.role === "student") {
    await db.insert(studentProfiles).values({ userId: user.id });
  } else if (data.role === "agency") {
    await db.insert(agencyProfiles).values({
      userId: user.id,
      companyName: data.companyName!,
    });
  }

  const accessToken = await issueTokens(res, user);

  res.status(201).json({
    accessToken,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
  });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);

  const user = await db.query.users.findFirst({
    where: eq(users.email, data.email.toLowerCase()),
  });

  if (!user || !user.isActive) {
    throw new AppError("Invalid email or password.", 401);
  }
  if (user.role !== data.role) {
    throw new AppError(`No ${data.role} account found with this email.`, 401);
  }

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password.", 401);
  }

  const accessToken = await issueTokens(res, user);

  res.json({
    accessToken,
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
  });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    throw new AppError("No refresh token provided.", 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  const tokenHash = hashToken(token);
  const stored = await db.query.refreshTokens.findFirst({
    where: and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)),
  });

  if (!stored) {
    throw new AppError("Refresh token not recognized. Please log in again.", 401);
  }

  const user = await db.query.users.findFirst({ where: eq(users.id, payload.sub) });
  if (!user || !user.isActive) {
    await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, stored.id));
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    throw new AppError("This account is no longer active.", 401);
  }

  // Rotate: revoke the used token, issue a new pair.
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, stored.id));

  const accessToken = await issueTokens(res, user);

  res.json({ accessToken });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, hashToken(token)));
  }
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.user!.id),
  });
  if (!user) {
    throw new AppError("User not found.", 404);
  }
  res.json({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
  });
}

const forgotPasswordSchema = z.object({ email: z.string().email() });
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function forgotPassword(req: Request, res: Response) {
  const data = forgotPasswordSchema.parse(req.body);

  const user = await db.query.users.findFirst({ where: eq(users.email, data.email.toLowerCase()) });

  // Always respond the same way whether or not the account exists —
  // otherwise this endpoint would let anyone probe which emails are registered.
  if (user && user.isActive) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetLink = `${env.clientUrl}/reset-password?token=${rawToken}`;
    // No email provider is configured yet — log the link so it can be used
    // for local testing. Wire this to a real email service before going live.
    console.log(`[password reset] ${user.email}: ${resetLink}`);
  }

  res.json({ message: "If an account exists for that email, a reset link has been sent." });
}

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

export async function resetPassword(req: Request, res: Response) {
  const data = resetPasswordSchema.parse(req.body);
  const tokenHash = hashToken(data.token);

  const stored = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.tokenHash, tokenHash),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, new Date())
    ),
  });
  if (!stored) {
    throw new AppError("This reset link is invalid or has expired.", 401);
  }

  const passwordHash = await hashPassword(data.newPassword);

  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, stored.userId));
  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, stored.id));
  // Log out of every existing session — a leaked/old refresh token shouldn't
  // survive a password reset.
  await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.userId, stored.userId));

  res.json({ message: "Password reset successfully. Please log in with your new password." });
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

export async function changePassword(req: Request, res: Response) {
  const data = changePasswordSchema.parse(req.body);

  const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.id) });
  if (!user) throw new AppError("User not found.", 404);

  const valid = await verifyPassword(data.currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError("Your current password is incorrect.", 401);
  }

  const passwordHash = await hashPassword(data.newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));

  res.json({ message: "Password updated successfully." });
}
