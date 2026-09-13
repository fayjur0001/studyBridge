import { Request, Response } from "express";
import { z } from "zod";
import { and, asc, eq, gte, ilike, or, SQL } from "drizzle-orm";
import { db } from "@/db";
import { scholarships } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { paginationSchema, paginationMeta } from "@/utils/pagination";
import { optionalUrl, optionalDate, optionalUuid, optionalNumber, optionalInt } from "@/utils/zodHelpers";
import { notifyAdmins, notifyUser, getUserFullName } from "@/services/notificationService";

const listQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  universityId: z.string().uuid().optional(),
  upcomingOnly: z.coerce.boolean().default(false),
  status: z.enum(["all", "approved", "pending", "rejected"]).optional(),
  mySubmissions: z.coerce.boolean().optional(),
});

export async function listScholarships(req: Request, res: Response) {
  const q = listQuerySchema.parse(req.query);

  const conditions: SQL[] = [];
  if (q.search) {
    conditions.push(
      or(
        ilike(scholarships.title, `%${q.search}%`),
        ilike(scholarships.provider, `%${q.search}%`),
        ilike(scholarships.description, `%${q.search}%`)
      )!
    );
  }
  if (q.category) conditions.push(eq(scholarships.category, q.category));
  if (q.universityId) conditions.push(eq(scholarships.universityId, q.universityId));
  if (q.upcomingOnly) conditions.push(gte(scholarships.deadline, new Date()));

  // Visibility logic:
  if (req.user?.role === "admin") {
    if (q.status && q.status !== "all") {
      conditions.push(eq(scholarships.status, q.status));
    }
  } else if (req.user?.role === "agency" && q.mySubmissions) {
    conditions.push(eq(scholarships.submittedByAgencyId, req.user.id));
    if (q.status && q.status !== "all") {
      conditions.push(eq(scholarships.status, q.status));
    }
  } else {
    // Default public and student visibility: ONLY approved items
    conditions.push(eq(scholarships.status, "approved"));
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (q.page - 1) * q.limit;

  const [rows, total] = await Promise.all([
    db.query.scholarships.findMany({
      where,
      orderBy: asc(scholarships.deadline),
      limit: q.limit,
      offset,
      with: {
        university: {
          columns: { id: true, name: true, country: true },
        },
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
    db.$count(scholarships, where),
  ]);

  res.json({ data: rows, meta: paginationMeta(q.page, q.limit, total) });
}

export async function getScholarship(req: Request, res: Response) {
  const scholarship = await db.query.scholarships.findFirst({
    where: eq(scholarships.id, req.params.id),
    with: {
      university: {
        columns: { id: true, name: true, country: true },
      },
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
  if (!scholarship) throw new AppError("Scholarship not found.", 404);

  if (scholarship.status !== "approved") {
    const isAllowed =
      req.user?.role === "admin" ||
      (req.user?.id && scholarship.submittedByAgencyId === req.user.id);
    if (!isAllowed) {
      throw new AppError("Scholarship not found.", 404);
    }
  }

  res.json(scholarship);
}

const scholarshipInputSchema = z.object({
  universityId: optionalUuid(),
  title: z.string().trim().min(2, "Scholarship title must be at least 2 characters"),
  provider: z.string().trim().optional(),
  category: z.string().trim().optional(),
  amountUsd: optionalNumber({ nonnegative: true }),
  coveragePercent: optionalInt({ min: 0, max: 100 }),
  deadline: optionalDate(),
  eligibility: z.string().trim().optional(),
  description: z.string().trim().optional(),
  applyUrl: optionalUrl(),
});

export async function createScholarship(req: Request, res: Response) {
  const data = scholarshipInputSchema.parse(req.body);
  const isAgency = req.user?.role === "agency";
  const status = isAgency ? "pending" : "approved";
  const submittedByAgencyId = isAgency ? req.user!.id : null;

  const [row] = await db
    .insert(scholarships)
    .values({
      ...data,
      amountUsd: data.amountUsd?.toString(),
      status,
      submittedByAgencyId,
    })
    .returning();

  if (isAgency) {
    const agencyName = await getUserFullName(req.user!.id);
    await notifyAdmins({
      type: "scholarship_submission",
      title: "New Scholarship Submitted for Review",
      body: `Agency "${agencyName}" submitted scholarship "${row.title}" for review.`,
    });
  }

  res.status(201).json(row);
}

const reviewInputSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().trim().optional(),
});

export async function reviewScholarship(req: Request, res: Response) {
  const { action, rejectionReason } = reviewInputSchema.parse(req.body);
  const scholarship = await db.query.scholarships.findFirst({
    where: eq(scholarships.id, req.params.id),
  });
  if (!scholarship) throw new AppError("Scholarship not found.", 404);

  const newStatus = action === "approve" ? "approved" : "rejected";
  const reason = action === "reject" ? (rejectionReason || "Information incomplete or unverified.") : null;

  const [updated] = await db
    .update(scholarships)
    .set({
      status: newStatus,
      rejectionReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(scholarships.id, scholarship.id))
    .returning();

  if (scholarship.submittedByAgencyId) {
    if (action === "approve") {
      await notifyUser(scholarship.submittedByAgencyId, {
        type: "scholarship_approved",
        title: "Scholarship Approved!",
        body: `Your submitted scholarship "${scholarship.title}" has been approved by admin and is now live on StudyBridge.`,
      });
    } else {
      await notifyUser(scholarship.submittedByAgencyId, {
        type: "scholarship_rejected",
        title: "Scholarship Submission Declined",
        body: `Your submitted scholarship "${scholarship.title}" was declined. Reason: ${reason}`,
      });
    }
  }

  res.json(updated);
}

export async function updateScholarship(req: Request, res: Response) {
  const scholarship = await db.query.scholarships.findFirst({ where: eq(scholarships.id, req.params.id) });
  if (!scholarship) throw new AppError("Scholarship not found.", 404);

  const isAgency = req.user?.role === "agency";
  if (isAgency && scholarship.submittedByAgencyId !== req.user?.id) {
    throw new AppError("You do not have permission to edit this scholarship.", 403);
  }

  const data = scholarshipInputSchema.partial().parse(req.body);

  const updatePayload: Record<string, any> = {
    ...data,
    amountUsd: data.amountUsd !== undefined ? data.amountUsd.toString() : undefined,
    updatedAt: new Date(),
  };

  if (isAgency) {
    updatePayload.status = "pending";
    updatePayload.rejectionReason = null;
  }

  const [row] = await db
    .update(scholarships)
    .set(updatePayload)
    .where(eq(scholarships.id, req.params.id))
    .returning();

  if (isAgency) {
    const agencyName = await getUserFullName(req.user!.id);
    await notifyAdmins({
      type: "scholarship_resubmission",
      title: "Scholarship Submission Updated",
      body: `Agency "${agencyName}" updated and resubmitted "${row.title}" for review.`,
    });
  }

  res.json(row);
}

export async function deleteScholarship(req: Request, res: Response) {
  const scholarship = await db.query.scholarships.findFirst({ where: eq(scholarships.id, req.params.id) });
  if (!scholarship) throw new AppError("Scholarship not found.", 404);

  if (req.user?.role === "agency" && scholarship.submittedByAgencyId !== req.user?.id) {
    throw new AppError("You do not have permission to delete this scholarship.", 403);
  }

  const [row] = await db
    .delete(scholarships)
    .where(eq(scholarships.id, req.params.id))
    .returning({ id: scholarships.id });

  res.status(204).send();
}
