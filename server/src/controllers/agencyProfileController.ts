import { Request, Response } from "express";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, agencyFiles, agencyProfiles } from "@/db/schema";
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

// The directory deliberately returns only public agency information and
// certificates, never business-registration files or account details.
export async function listAgencies(req: Request, res: Response) {
  const rows = await db.select({
    userId: agencyProfiles.userId, companyName: agencyProfiles.companyName,
    website: agencyProfiles.website, address: agencyProfiles.address,
    description: agencyProfiles.description, isVerified: agencyProfiles.isVerified,
  }).from(agencyProfiles).orderBy(agencyProfiles.companyName);
  res.json({ data: rows });
}

export async function getAgencyPublicProfile(req: Request, res: Response) {
  const profile = await db.query.agencyProfiles.findFirst({ where: eq(agencyProfiles.userId, req.params.id) });
  if (!profile) throw new AppError("Agency not found.", 404);
  const certificates = await db.select({ id: agencyFiles.id, title: agencyFiles.title, fileName: agencyFiles.fileName, expiresAt: agencyFiles.expiresAt, createdAt: agencyFiles.createdAt })
    .from(agencyFiles).where(and(eq(agencyFiles.agencyId, profile.userId), eq(agencyFiles.category, "certification"))).orderBy(desc(agencyFiles.createdAt));
  res.json({ ...profile, certificates });
}
