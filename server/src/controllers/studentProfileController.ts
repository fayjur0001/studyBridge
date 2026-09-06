import { Request, Response } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, studentProfiles, agencyProfiles, agencyStudents } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { optionalUrl } from "@/utils/zodHelpers";

// A student can be linked to more than one agency at once, so this returns
// the full list. `agency` (singular, first item or null) is kept alongside
// `agencies` for compatibility with older clients that only show one.
// Only agencies whose account is still active are surfaced here — if an
// admin suspends an agency, it should stop appearing as the student's
// active agency even though the underlying link row still exists.
async function withAgency<T extends { id: string }>(user: T) {
  const links = await db
    .select({
      userId: users.id,
      companyName: agencyProfiles.companyName,
      fullName: users.fullName,
      isActive: users.isActive,
    })
    .from(agencyStudents)
    .innerJoin(users, eq(agencyStudents.agencyId, users.id))
    .leftJoin(agencyProfiles, eq(agencyProfiles.userId, agencyStudents.agencyId))
    .where(eq(agencyStudents.studentId, user.id));

  const agencies = links
    .filter((row) => row.isActive)
    .map((row) => ({
      userId: row.userId,
      companyName: row.companyName ?? row.fullName,
    }));

  return {
    ...user,
    agencies,
    agency: agencies[0] ?? null,
  };
}

export async function getMyProfile(req: Request, res: Response) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, req.user!.id),
    with: { studentProfile: true },
  });
  if (!user) throw new AppError("User not found.", 404);

  const { passwordHash, ...safeUser } = user;
  void passwordHash;
  res.json(await withAgency(safeUser));
}

const userUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: optionalUrl(),
});

const profileUpdateSchema = z.object({
  dateOfBirth: z.coerce.date().optional(),
  nationality: z.string().optional(),
  currentEducationLevel: z.string().optional(),
  gpa: z.coerce.number().min(0).max(5).optional(),
  preferredCountries: z.array(z.string()).optional(),
  preferredFields: z.array(z.string()).optional(),
  bio: z.string().optional(),
});

export async function updateMyProfile(req: Request, res: Response) {
  const userData = userUpdateSchema.parse(req.body.user ?? {});
  const profileData = profileUpdateSchema.parse(req.body.profile ?? {});

  if (Object.keys(userData).length) {
    await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, req.user!.id));
  }

  if (Object.keys(profileData).length) {
    await db
      .update(studentProfiles)
      .set({ ...profileData, gpa: profileData.gpa?.toString(), updatedAt: new Date() })
      .where(eq(studentProfiles.userId, req.user!.id));
  }

  const updated = await db.query.users.findFirst({
    where: eq(users.id, req.user!.id),
    with: { studentProfile: true },
  });
  const { passwordHash, ...safeUser } = updated!;
  void passwordHash;
  res.json(await withAgency(safeUser));
}