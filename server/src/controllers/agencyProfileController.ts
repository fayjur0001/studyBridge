import { Request, Response } from "express";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users, agencyFiles, agencyProfiles, agencyServices } from "@/db/schema";
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
  studentStories: z.string().max(10000).optional(),
  supportedCountries: z.array(z.string()).optional(),
  partnerUniversityIds: z.array(z.string()).optional(),
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
    supportedCountries: agencyProfiles.supportedCountries,
    partnerUniversityIds: agencyProfiles.partnerUniversityIds,
  }).from(agencyProfiles).orderBy(agencyProfiles.companyName);
  res.json({ data: rows });
}

export async function getSuggestedAgencies(req: Request, res: Response) {
  const targetCountry = typeof req.query.country === "string" ? req.query.country.trim().toLowerCase() : "";
  const targetUniversityId = typeof req.query.universityId === "string" ? req.query.universityId.trim() : "";

  const agencies = await db
    .select({
      userId: agencyProfiles.userId,
      companyName: agencyProfiles.companyName,
      website: agencyProfiles.website,
      address: agencyProfiles.address,
      description: agencyProfiles.description,
      isVerified: agencyProfiles.isVerified,
      supportedCountries: agencyProfiles.supportedCountries,
      partnerUniversityIds: agencyProfiles.partnerUniversityIds,
      contactName: users.fullName,
      email: users.email,
      avatarUrl: users.avatarUrl,
    })
    .from(agencyProfiles)
    .innerJoin(users, eq(agencyProfiles.userId, users.id))
    .where(eq(users.isActive, true));

  const scored = agencies.map((agency) => {
    const supportedCountries = agency.supportedCountries || [];
    const partnerUniversityIds = agency.partnerUniversityIds || [];

    const isDirectPartner = Boolean(targetUniversityId && partnerUniversityIds.includes(targetUniversityId));
    const isCountrySpecialist = Boolean(
      targetCountry &&
      supportedCountries.some((c) => {
        const cLower = c.toLowerCase();
        return cLower === targetCountry || targetCountry.includes(cLower) || cLower.includes(targetCountry);
      })
    );

    let matchScore = 0;
    if (isDirectPartner) matchScore += 10;
    if (isCountrySpecialist) matchScore += 5;
    if (agency.isVerified) matchScore += 1;

    return {
      ...agency,
      isDirectPartner,
      isCountrySpecialist,
      matchScore,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore || a.companyName.localeCompare(b.companyName));

  res.json({ data: scored });
}

export async function getAgencyPublicProfile(req: Request, res: Response) {
  const profile = await db.query.agencyProfiles.findFirst({ where: eq(agencyProfiles.userId, req.params.id) });
  if (!profile) throw new AppError("Agency not found.", 404);
  const certificates = await db.select({ id: agencyFiles.id, title: agencyFiles.title, fileName: agencyFiles.fileName, expiresAt: agencyFiles.expiresAt, createdAt: agencyFiles.createdAt })
    .from(agencyFiles).where(and(eq(agencyFiles.agencyId, profile.userId), eq(agencyFiles.category, "certification"))).orderBy(desc(agencyFiles.createdAt));
  const services = await db.select({ id: agencyServices.id, name: agencyServices.name, description: agencyServices.description, priceUsd: agencyServices.priceUsd, features: agencyServices.features })
    .from(agencyServices).where(and(eq(agencyServices.agencyId, profile.userId), eq(agencyServices.isActive, true)));
  res.json({ ...profile, certificates, services });
}
