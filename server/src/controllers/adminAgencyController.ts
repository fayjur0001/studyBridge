import { Request, Response } from "express";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { agencyProfiles, users } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { notifyUser } from "@/services/notificationService";

export async function listAgencies(req: Request, res: Response) {
  const rows = await db
    .select({
      userId: agencyProfiles.userId,
      companyName: agencyProfiles.companyName,
      licenseNumber: agencyProfiles.licenseNumber,
      website: agencyProfiles.website,
      address: agencyProfiles.address,
      description: agencyProfiles.description,
      isVerified: agencyProfiles.isVerified,
      email: users.email,
      fullName: users.fullName,
      createdAt: users.createdAt,
      updatedAt: agencyProfiles.updatedAt,
    })
    .from(agencyProfiles)
    .innerJoin(users, eq(agencyProfiles.userId, users.id))
    .orderBy(desc(agencyProfiles.updatedAt));

  res.json({ data: rows });
}

const verifySchema = z.object({ isVerified: z.boolean() });

export async function setAgencyVerified(req: Request, res: Response) {
  const data = verifySchema.parse(req.body);

  const [row] = await db
    .update(agencyProfiles)
    .set({ isVerified: data.isVerified, updatedAt: new Date() })
    .where(eq(agencyProfiles.userId, req.params.id))
    .returning();

  if (!row) throw new AppError("Agency not found.", 404);

  await notifyUser(req.params.id, {
    type: "agency_verification",
    title: data.isVerified ? "Agency Verified" : "Verification Status Updated",
    body: data.isVerified
      ? "Congratulations! Your agency has been officially verified by platform administrators."
      : "Your agency verification status has been updated.",
  });

  res.json(row);
}
