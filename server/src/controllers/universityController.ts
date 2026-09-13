import { Request, Response } from "express";
import { z } from "zod";
import { and, asc, desc, eq, ilike, lte, or, SQL } from "drizzle-orm";
import { db } from "@/db";
import { universities, programs, users, agencyProfiles } from "@/db/schema";
import path from "path";
import fs from "fs/promises";
import { env } from "@/config/env";
import { AppError } from "@/utils/AppError";
import { paginationSchema, paginationMeta } from "@/utils/pagination";
import { optionalUrl, optionalDate, optionalInt } from "@/utils/zodHelpers";
import { notifyAdmins, notifyUser, getUserFullName } from "@/services/notificationService";

const listQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).optional(),
  country: z.string().trim().min(1).optional(),
  region: z.string().trim().min(1).optional(),
  maxRanking: z.coerce.number().int().positive().optional(),
  sort: z.enum(["ranking", "name", "newest"]).default("ranking"),
  status: z.enum(["all", "approved", "pending", "rejected"]).optional(),
  mySubmissions: z.coerce.boolean().optional(),
});

export async function listUniversities(req: Request, res: Response) {
  const q = listQuerySchema.parse(req.query);

  const conditions: SQL[] = [];
  if (q.search) {
    conditions.push(
      or(
        ilike(universities.name, `%${q.search}%`),
        ilike(universities.country, `%${q.search}%`),
        ilike(universities.city, `%${q.search}%`),
        ilike(universities.region, `%${q.search}%`)
      )!
    );
  }
  if (q.country) conditions.push(eq(universities.country, q.country));
  if (q.region) conditions.push(eq(universities.region, q.region));
  if (q.maxRanking) conditions.push(lte(universities.ranking, q.maxRanking));

  // Visibility logic:
  if (req.user?.role === "admin") {
    if (q.status && q.status !== "all") {
      conditions.push(eq(universities.status, q.status));
    }
  } else if (req.user?.role === "agency" && q.mySubmissions) {
    conditions.push(eq(universities.submittedByAgencyId, req.user.id));
    if (q.status && q.status !== "all") {
      conditions.push(eq(universities.status, q.status));
    }
  } else {
    // Default public and student visibility: ONLY approved items
    conditions.push(eq(universities.status, "approved"));
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const orderBy =
    q.sort === "name"
      ? asc(universities.name)
      : q.sort === "newest"
        ? desc(universities.createdAt)
        : asc(universities.ranking);

  const offset = (q.page - 1) * q.limit;

  const [rows, total] = await Promise.all([
    db.query.universities.findMany({
      where,
      orderBy,
      limit: q.limit,
      offset,
      with: {
        submittedByAgency: {
          columns: { id: true, fullName: true, email: true },
          with: {
            agencyProfile: {
              columns: { companyName: true },
            },
          },
        },
      },
    }),
    db.$count(universities, where),
  ]);

  res.json({ data: rows, meta: paginationMeta(q.page, q.limit, total) });
}

export async function getUniversity(req: Request, res: Response) {
  const university = await db.query.universities.findFirst({
    where: eq(universities.id, req.params.id),
    with: {
      submittedByAgency: {
        columns: { id: true, fullName: true, email: true },
        with: {
          agencyProfile: {
            columns: { companyName: true },
          },
        },
      },
    },
  });
  if (!university) throw new AppError("University not found.", 404);

  // Hidden unless approved or requester is admin / submitting agency
  if (university.status !== "approved") {
    const isAllowed =
      req.user?.role === "admin" ||
      (req.user?.id && university.submittedByAgencyId === req.user.id);
    if (!isAllowed) {
      throw new AppError("University not found.", 404);
    }
  }

  const universityPrograms = await db
    .select()
    .from(programs)
    .where(eq(programs.universityId, university.id))
    .orderBy(desc(programs.createdAt));

  res.json({ ...university, programs: universityPrograms });
}

const universityInputSchema = z.object({
  name: z.string().trim().min(2, "University name must be at least 2 characters"),
  country: z.string().trim().min(2, "Country name is required"),
  region: z.string().trim().optional(),
  city: z.string().trim().optional(),
  logoUrl: optionalUrl(),
  coverImageUrl: optionalUrl(),
  description: z.string().trim().optional(),
  admissionRequirements: z.string().trim().optional(),
  applicationStartDate: optionalDate(),
  applicationDeadline: optionalDate(),
  galleryImageUrls: z.array(z.string()).optional(),
  ranking: optionalInt({ positive: true }),
  websiteUrl: optionalUrl(),
  isFeatured: z.boolean().optional(),
});

export async function createUniversity(req: Request, res: Response) {
  const data = universityInputSchema.parse(req.body);
  const isAgency = req.user?.role === "agency";
  const status = isAgency ? "pending" : "approved";
  const submittedByAgencyId = isAgency ? req.user!.id : null;

  const [row] = await db
    .insert(universities)
    .values({
      ...data,
      status,
      submittedByAgencyId,
    })
    .returning();

  if (isAgency) {
    const agencyName = await getUserFullName(req.user!.id);
    await notifyAdmins({
      type: "university_submission",
      title: "New University Submitted for Review",
      body: `Agency "${agencyName}" submitted "${row.name}" (${row.country}) for review.`,
    });
  }

  res.status(201).json(row);
}

const reviewInputSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().trim().optional(),
});

export async function reviewUniversity(req: Request, res: Response) {
  const { action, rejectionReason } = reviewInputSchema.parse(req.body);
  const university = await db.query.universities.findFirst({
    where: eq(universities.id, req.params.id),
  });
  if (!university) throw new AppError("University not found.", 404);

  const newStatus = action === "approve" ? "approved" : "rejected";
  const reason = action === "reject" ? (rejectionReason || "Information incomplete or unverified.") : null;

  const [updated] = await db
    .update(universities)
    .set({
      status: newStatus,
      rejectionReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(universities.id, university.id))
    .returning();

  if (university.submittedByAgencyId) {
    if (action === "approve") {
      await notifyUser(university.submittedByAgencyId, {
        type: "university_approved",
        title: "University Approved!",
        body: `Your submitted institution "${university.name}" has been approved by admin and is now live on StudyBridge.`,
      });
    } else {
      await notifyUser(university.submittedByAgencyId, {
        type: "university_rejected",
        title: "University Submission Declined",
        body: `Your submitted institution "${university.name}" was declined. Reason: ${reason}`,
      });
    }
  }

  res.json(updated);
}

export async function uploadUniversityImages(req: Request, res: Response) {
  const university = await db.query.universities.findFirst({ where: eq(universities.id, req.params.id) });
  if (!university) throw new AppError("University not found.", 404);

  if (req.user?.role === "agency" && university.submittedByAgencyId !== req.user.id) {
    throw new AppError("You do not have permission to manage this university.", 403);
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (!files.length) throw new AppError("Please select at least one image.", 422);

  const urls = files.map((file) => `/uploads/${path.relative(path.resolve(env.uploadDir), file.path).replaceAll(path.sep, "/")}`);
  const gallery = [...(university.galleryImageUrls ?? []), ...urls];
  const [updated] = await db
    .update(universities)
    .set({ galleryImageUrls: gallery, coverImageUrl: university.coverImageUrl ?? urls[0], updatedAt: new Date() })
    .where(eq(universities.id, university.id))
    .returning();
  res.json(updated);
}

export async function viewUniversityImage(req: Request, res: Response) {
  const root = path.resolve(env.uploadDir);
  const fullPath = path.resolve(root, req.params[0]);
  if (!fullPath.startsWith(`${root}${path.sep}`)) throw new AppError("Invalid image path.", 400);
  try {
    await fs.access(fullPath);
  } catch {
    throw new AppError("Image not found.", 404);
  }
  if (/\.jpe?g$|\.jfif$/i.test(fullPath)) res.type("image/jpeg");
  else if (/\.png$/i.test(fullPath)) res.type("image/png");
  else if (/\.webp$/i.test(fullPath)) res.type("image/webp");
  res.sendFile(fullPath);
}

export async function updateUniversity(req: Request, res: Response) {
  const university = await db.query.universities.findFirst({ where: eq(universities.id, req.params.id) });
  if (!university) throw new AppError("University not found.", 404);

  const isAgency = req.user?.role === "agency";
  if (isAgency && university.submittedByAgencyId !== req.user?.id) {
    throw new AppError("You do not have permission to edit this university.", 403);
  }

  const data = universityInputSchema.partial().parse(req.body);

  // If agency edits a rejected or pending submission, reset to pending review
  const updatePayload: Record<string, any> = {
    ...data,
    updatedAt: new Date(),
  };

  if (isAgency) {
    updatePayload.status = "pending";
    updatePayload.rejectionReason = null;
  }

  const [row] = await db
    .update(universities)
    .set(updatePayload)
    .where(eq(universities.id, req.params.id))
    .returning();

  if (isAgency) {
    const agencyName = await getUserFullName(req.user!.id);
    await notifyAdmins({
      type: "university_resubmission",
      title: "University Submission Updated",
      body: `Agency "${agencyName}" updated and resubmitted "${row.name}" for review.`,
    });
  }

  res.json(row);
}

export async function deleteUniversity(req: Request, res: Response) {
  const university = await db.query.universities.findFirst({ where: eq(universities.id, req.params.id) });
  if (!university) throw new AppError("University not found.", 404);

  if (req.user?.role === "agency" && university.submittedByAgencyId !== req.user?.id) {
    throw new AppError("You do not have permission to delete this university.", 403);
  }

  const [row] = await db
    .delete(universities)
    .where(eq(universities.id, req.params.id))
    .returning({ id: universities.id });

  res.status(204).send();
}