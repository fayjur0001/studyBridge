import { Request, Response } from "express";
import { z } from "zod";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  agencyFiles,
  agencyProfiles,
  agencyVerificationRequests,
  users,
  applications,
  programs,
  universities,
} from "@/db/schema";
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

  const agencyUserIds = rows.map((r) => r.userId);

  let verificationRequestsMap: Record<string, any> = {};
  let filesMap: Record<string, any[]> = {};

  if (agencyUserIds.length > 0) {
    const allRequests = await db
      .select()
      .from(agencyVerificationRequests)
      .where(inArray(agencyVerificationRequests.agencyId, agencyUserIds))
      .orderBy(desc(agencyVerificationRequests.createdAt));

    for (const reqItem of allRequests) {
      if (!verificationRequestsMap[reqItem.agencyId]) {
        verificationRequestsMap[reqItem.agencyId] = reqItem;
      }
    }

    const allFiles = await db
      .select()
      .from(agencyFiles)
      .where(inArray(agencyFiles.agencyId, agencyUserIds))
      .orderBy(desc(agencyFiles.createdAt));

    for (const file of allFiles) {
      if (!filesMap[file.agencyId]) {
        filesMap[file.agencyId] = [];
      }
      filesMap[file.agencyId].push(file);
    }
  }

  const enriched = rows.map((agency) => ({
    ...agency,
    latestVerification: verificationRequestsMap[agency.userId] || null,
    files: filesMap[agency.userId] || [],
  }));

  res.json({ data: enriched });
}

const verifySchema = z.object({ isVerified: z.boolean() });

export async function setAgencyVerified(req: Request, res: Response) {
  const data = verifySchema.parse(req.body);
  const agencyId = req.params.id;

  const [row] = await db
    .update(agencyProfiles)
    .set({ isVerified: data.isVerified, updatedAt: new Date() })
    .where(eq(agencyProfiles.userId, agencyId))
    .returning();

  if (!row) throw new AppError("Agency not found.", 404);

  // If approving, update latest verification request to approved
  if (data.isVerified) {
    const [latestReq] = await db
      .select()
      .from(agencyVerificationRequests)
      .where(eq(agencyVerificationRequests.agencyId, agencyId))
      .orderBy(desc(agencyVerificationRequests.createdAt))
      .limit(1);

    if (latestReq) {
      await db
        .update(agencyVerificationRequests)
        .set({
          status: "approved",
          reviewedBy: req.user?.id,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(agencyVerificationRequests.id, latestReq.id));
    }
  }

  await notifyUser(agencyId, {
    type: "agency_verification",
    title: data.isVerified ? "🎉 Agency Verified & Badge Awarded" : "Verification Status Updated",
    body: data.isVerified
      ? "Congratulations! Your agency has been officially verified by platform administrators. Your Verified Partner badge is now active on StudyBridge."
      : "Your agency verification status has been updated.",
  });

  res.json(row);
}

const requestDocsSchema = z.object({
  notes: z.string().min(5, "Please specify the required documents or feedback."),
});

export async function requestAgencyDocuments(req: Request, res: Response) {
  const { notes } = requestDocsSchema.parse(req.body);
  const agencyId = req.params.id;

  const [agency] = await db
    .select()
    .from(agencyProfiles)
    .where(eq(agencyProfiles.userId, agencyId))
    .limit(1);

  if (!agency) throw new AppError("Agency not found.", 404);

  const [latestReq] = await db
    .select()
    .from(agencyVerificationRequests)
    .where(eq(agencyVerificationRequests.agencyId, agencyId))
    .orderBy(desc(agencyVerificationRequests.createdAt))
    .limit(1);

  let updatedRequest;
  if (latestReq) {
    [updatedRequest] = await db
      .update(agencyVerificationRequests)
      .set({
        status: "documents_requested",
        adminNotes: notes,
        reviewedBy: req.user?.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agencyVerificationRequests.id, latestReq.id))
      .returning();
  }

  await notifyUser(agencyId, {
    type: "verification_documents_requested",
    title: "Action Required: Additional Verification Documents Needed",
    body: `Admin reviewed your verification application and requested additional documentation: "${notes}". Please upload the documents in your Profile > Business Documents tab.`,
  });

  res.json({
    success: true,
    message: "Document request sent to agency.",
    request: updatedRequest || null,
  });
}

const rejectRefundSchema = z.object({
  reason: z.string().min(5, "Please provide a reason for declining verification."),
});

export async function rejectAgencyVerification(req: Request, res: Response) {
  const { reason } = rejectRefundSchema.parse(req.body);
  const agencyId = req.params.id;

  const [agency] = await db
    .select()
    .from(agencyProfiles)
    .where(eq(agencyProfiles.userId, agencyId))
    .limit(1);

  if (!agency) throw new AppError("Agency not found.", 404);

  // Set isVerified = false
  await db
    .update(agencyProfiles)
    .set({ isVerified: false, updatedAt: new Date() })
    .where(eq(agencyProfiles.userId, agencyId));

  const [latestReq] = await db
    .select()
    .from(agencyVerificationRequests)
    .where(eq(agencyVerificationRequests.agencyId, agencyId))
    .orderBy(desc(agencyVerificationRequests.createdAt))
    .limit(1);

  const fee = latestReq ? Number(latestReq.feeAmount) || 5000 : 5000;
  const serviceFee = Number((fee * 0.05).toFixed(2)); // 5% = 250
  const refundAmount = Number((fee * 0.95).toFixed(2)); // 95% = 4750

  const paymentDetails = (latestReq?.paymentDetails as any) || {};
  const refundDest = paymentDetails?.accountNumber
    ? `${paymentDetails.paymentMethod || "Mobile Banking"} (${paymentDetails.accountNumber})`
    : "Originating SSLCommerz Payment Account";

  let updatedRequest;
  if (latestReq) {
    [updatedRequest] = await db
      .update(agencyVerificationRequests)
      .set({
        status: "rejected",
        paymentStatus: "refunded_partial",
        refundStatus: "processed",
        serviceFeeDeducted: serviceFee.toFixed(2),
        refundAmount: refundAmount.toFixed(2),
        adminNotes: reason,
        refundDetails: {
          processedAt: new Date().toISOString(),
          deductionRate: "5%",
          serviceFeeDeducted: serviceFee,
          refundRate: "95%",
          refundAmount,
          currency: latestReq.currency || "BDT",
          originalTranId: latestReq.transactionId,
          refundDestination: refundDest,
        },
        reviewedBy: req.user?.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agencyVerificationRequests.id, latestReq.id))
      .returning();
  }

  await notifyUser(agencyId, {
    type: "verification_rejected_refund",
    title: "Verification Declined & 95% Refund Processed",
    body: `Your verification request was declined. Reason: "${reason}". In accordance with our terms, 95% of your fee (৳${refundAmount.toLocaleString()}) has been refunded to your ${refundDest} after deducting a 5% service charge (৳${serviceFee.toLocaleString()}).`,
  });

  res.json({
    success: true,
    message: `Verification rejected. 5% service fee (৳${serviceFee}) deducted and 95% (৳${refundAmount}) refunded.`,
    request: updatedRequest || null,
  });
}

export async function getAdminFinancialStats(_req: Request, res: Response) {
  const [allRequests, paidAppRows] = await Promise.all([
    db
      .select({
        id: agencyVerificationRequests.id,
        agencyId: agencyVerificationRequests.agencyId,
        status: agencyVerificationRequests.status,
        feeAmount: agencyVerificationRequests.feeAmount,
        currency: agencyVerificationRequests.currency,
        transactionId: agencyVerificationRequests.transactionId,
        sslSessionKey: agencyVerificationRequests.sslSessionKey,
        paymentStatus: agencyVerificationRequests.paymentStatus,
        paymentDetails: agencyVerificationRequests.paymentDetails,
        adminNotes: agencyVerificationRequests.adminNotes,
        serviceFeeDeducted: agencyVerificationRequests.serviceFeeDeducted,
        refundAmount: agencyVerificationRequests.refundAmount,
        refundStatus: agencyVerificationRequests.refundStatus,
        refundDetails: agencyVerificationRequests.refundDetails,
        reviewedBy: agencyVerificationRequests.reviewedBy,
        reviewedAt: agencyVerificationRequests.reviewedAt,
        createdAt: agencyVerificationRequests.createdAt,
        updatedAt: agencyVerificationRequests.updatedAt,
        companyName: agencyProfiles.companyName,
        email: users.email,
        fullName: users.fullName,
      })
      .from(agencyVerificationRequests)
      .innerJoin(users, eq(agencyVerificationRequests.agencyId, users.id))
      .leftJoin(agencyProfiles, eq(agencyVerificationRequests.agencyId, agencyProfiles.userId))
      .orderBy(desc(agencyVerificationRequests.createdAt)),
    db
      .select({
        id: applications.id,
        studentId: applications.studentId,
        agencyId: applications.agencyId,
        programId: applications.programId,
        applicationFee: applications.applicationFee,
        platformCommission: applications.platformCommission,
        agencyShare: applications.agencyShare,
        paymentStatus: applications.paymentStatus,
        transactionId: applications.transactionId,
        paymentDetails: applications.paymentDetails,
        paidAt: applications.paidAt,
        status: applications.status,
        createdAt: applications.createdAt,
        studentName: users.fullName,
        studentEmail: users.email,
        agencyCompanyName: agencyProfiles.companyName,
        programName: programs.name,
        universityName: universities.name,
      })
      .from(applications)
      .innerJoin(users, eq(applications.studentId, users.id))
      .innerJoin(programs, eq(applications.programId, programs.id))
      .innerJoin(universities, eq(programs.universityId, universities.id))
      .leftJoin(agencyProfiles, eq(applications.agencyId, agencyProfiles.userId))
      .where(eq(applications.paymentStatus, "paid"))
      .orderBy(desc(applications.paidAt)),
  ]);

  let verificationTurnover = 0;
  let verificationNetIncome = 0;
  let rejectionServiceFees = 0;
  let approvedRevenue = 0;
  let totalRefunded = 0;
  let inReviewEscrow = 0;

  let totalVerificationPaidCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;
  let underReviewCount = 0;

  const formattedTransactions = allRequests.map((req) => {
    const fee = Number(req.feeAmount) || 0;
    const isPaid = req.paymentStatus === "paid" || req.paymentStatus === "refunded_partial";
    const serviceFee = Number(req.serviceFeeDeducted) || 0;
    const refund = Number(req.refundAmount) || 0;
    const pDetails = (req.paymentDetails as any) || {};
    const rDetails = (req.refundDetails as any) || {};

    if (isPaid) {
      verificationTurnover += fee;
      totalVerificationPaidCount++;

      if (req.status === "approved") {
        approvedCount++;
        approvedRevenue += fee;
        verificationNetIncome += fee;
      } else if (req.status === "rejected") {
        rejectedCount++;
        rejectionServiceFees += serviceFee;
        totalRefunded += refund;
        verificationNetIncome += serviceFee;
      } else {
        underReviewCount++;
        inReviewEscrow += fee;
      }
    }

    return {
      id: req.id,
      agencyId: req.agencyId,
      companyName: req.companyName || req.fullName,
      email: req.email,
      transactionId: req.transactionId,
      feeAmount: fee,
      currency: req.currency || "BDT",
      status: req.status,
      paymentStatus: req.paymentStatus,
      paymentMethod: pDetails.paymentMethod || "SSLCommerz",
      accountNumber: pDetails.accountNumber || null,
      bankTranId: pDetails.bankTranId || null,
      serviceFeeDeducted: serviceFee,
      refundAmount: refund,
      refundStatus: req.refundStatus || "none",
      refundDestination: rDetails.refundDestination || null,
      adminNotes: req.adminNotes || null,
      paidAt: pDetails.paidAt || req.createdAt,
      reviewedAt: req.reviewedAt,
      createdAt: req.createdAt,
    };
  });

  let studentApplicationTurnover = 0;
  let platformCommission = 0;
  let agencyEarnings = 0;

  const formattedAppTransactions = paidAppRows.map((app) => {
    const fee = Number(app.applicationFee) || 0;
    const comm = Number(app.platformCommission) || 0;
    const share = Number(app.agencyShare) || 0;
    const pDetails = (app.paymentDetails as any) || {};

    studentApplicationTurnover += fee;
    platformCommission += comm;
    agencyEarnings += share;

    return {
      id: app.id,
      studentId: app.studentId,
      studentName: app.studentName,
      studentEmail: app.studentEmail,
      agencyId: app.agencyId,
      agencyName: app.agencyCompanyName || "Assigned Agency",
      programName: app.programName,
      universityName: app.universityName,
      applicationFee: fee,
      platformCommission: comm,
      agencyShare: share,
      transactionId: app.transactionId,
      paymentMethod: pDetails.paymentMethod || "bKash",
      accountNumber: pDetails.accountNumber || null,
      bankName: pDetails.bankName || null,
      paidAt: app.paidAt || app.createdAt,
      status: app.status,
    };
  });

  const totalTurnover = verificationTurnover + studentApplicationTurnover;
  const netPlatformIncome = verificationNetIncome + platformCommission;

  res.json({
    summary: {
      totalTurnover,
      netPlatformIncome,
      rejectionServiceFees,
      approvedRevenue,
      totalRefunded,
      inReviewEscrow,
      totalPaidCount: totalVerificationPaidCount + paidAppRows.length,
      approvedCount,
      rejectedCount,
      underReviewCount,
      verificationTurnover,
      studentApplicationTurnover,
      platformCommission,
      agencyEarnings,
      paidApplicationsCount: paidAppRows.length,
      currency: "BDT",
    },
    transactions: formattedTransactions,
    applicationTransactions: formattedAppTransactions,
  });
}
