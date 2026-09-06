import { Request, Response } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, agencyProfiles } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { optionalUrl } from "@/utils/zodHelpers";

export async function getMyAgencyProfile(req: Request, res: Response) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.user!.id),
    with: { agencyProfile: true },
  });
  if (!user) throw new AppError("User not found.", 404);

  const { passwordHash, ...safeUser } = user;
  void passwordHash;
  res.json(safeUser);
}

const userUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: optionalUrl(),
});

const agencyUpdateSchema = z.object({
  companyName: z.string().min(2).optional(),
  licenseNumber: z.string().optional(),
  website: optionalUrl(),
  address: z.string().optional(),
  description: z.string().optional(),
});

export async function updateMyAgencyProfile(req: Request, res: Response) {
  const userData = userUpdateSchema.parse(req.body.user ?? {});
  const agencyData = agencyUpdateSchema.parse(req.body.agency ?? {});

  if (Object.keys(userData).length) {
    await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, req.user!.id));
  }

  if (Object.keys(agencyData).length) {
    await db
      .update(agencyProfiles)
      .set({ ...agencyData, updatedAt: new Date() })
      .where(eq(agencyProfiles.userId, req.user!.id));
  }

  const updated = await db.query.users.findFirst({
    where: eq(users.id, req.user!.id),
    with: { agencyProfile: true },
  });
  const { passwordHash, ...safeUser } = updated!;
  void passwordHash;
  res.json(safeUser);
}
