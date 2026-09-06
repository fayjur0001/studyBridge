import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { env } from "@/config/env";

export type UserRole = "student" | "agency" | "admin";

export interface AccessTokenPayload {
  sub: string; // user id
  role: UserRole;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = { expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtAccessSecret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

export function signRefreshToken(payload: AccessTokenPayload): string {
  const options: SignOptions = { expiresIn: env.jwtRefreshExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtRefreshSecret, options);
}

export function verifyRefreshToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as AccessTokenPayload;
}

// Refresh tokens are stored in the DB as a hash, never in plain text,
// so a leaked DB row alone can't be replayed as a valid token.
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
