import { Request, Response } from "express";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { agencyProfiles, agencyVerificationRequests, users } from "@/db/schema";
import { AppError } from "@/utils/AppError";
import { notifyAdmins, notifyUser } from "@/services/notificationService";
import {
  initiatePaymentSession,
  validatePayment,
} from "@/services/sslcommerzService";

const VERIFICATION_FEE_BDT = 5000.0;

export async function getMyVerificationStatus(req: Request, res: Response) {
  const userId = req.user!.id;

  const [agencyProfile] = await db
    .select()
    .from(agencyProfiles)
    .where(eq(agencyProfiles.userId, userId))
    .limit(1);

  if (!agencyProfile) {
    throw new AppError("Agency profile not found.", 404);
  }

  const [latestRequest] = await db
    .select()
    .from(agencyVerificationRequests)
    .where(eq(agencyVerificationRequests.agencyId, userId))
    .orderBy(desc(agencyVerificationRequests.createdAt))
    .limit(1);

  res.json({
    isVerified: agencyProfile.isVerified,
    companyName: agencyProfile.companyName,
    latestRequest: latestRequest || null,
    feeAmount: VERIFICATION_FEE_BDT,
    currency: "BDT",
  });
}

export async function initiateVerificationPayment(req: Request, res: Response) {
  const userId = req.user!.id;

  const [agencyProfile] = await db
    .select()
    .from(agencyProfiles)
    .where(eq(agencyProfiles.userId, userId))
    .limit(1);

  if (!agencyProfile) {
    throw new AppError("Agency profile not found.", 404);
  }

  if (agencyProfile.isVerified) {
    throw new AppError("Your agency is already officially verified.", 400);
  }

  // Check if there is already an active request under review
  const [existingRequest] = await db
    .select()
    .from(agencyVerificationRequests)
    .where(eq(agencyVerificationRequests.agencyId, userId))
    .orderBy(desc(agencyVerificationRequests.createdAt))
    .limit(1);

  if (existingRequest && existingRequest.status === "under_review") {
    throw new AppError(
      "You already have a pending verification request under review.",
      400
    );
  }

  const [userData] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const tran_id = `SB_VERIFY_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  const [newRequest] = await db
    .insert(agencyVerificationRequests)
    .values({
      agencyId: userId,
      status: "pending_payment",
      feeAmount: VERIFICATION_FEE_BDT.toFixed(2),
      currency: "BDT",
      transactionId: tran_id,
      paymentStatus: "unpaid",
    })
    .returning();

  const session = await initiatePaymentSession({
    tran_id,
    total_amount: VERIFICATION_FEE_BDT,
    currency: "BDT",
    cus_name: agencyProfile.companyName || userData.fullName,
    cus_email: userData.email,
    cus_phone: userData.phone,
    cus_add1: agencyProfile.address,
    product_name: "StudyBridge Agency Verification Badge",
  });

  if (session.sessionkey) {
    await db
      .update(agencyVerificationRequests)
      .set({ sslSessionKey: session.sessionkey, updatedAt: new Date() })
      .where(eq(agencyVerificationRequests.id, newRequest.id));
  }

  res.json({
    status: session.status,
    url: session.GatewayPageURL,
    tran_id,
    amount: VERIFICATION_FEE_BDT,
    isSimulated: session.isSimulated || false,
    sessionkey: session.sessionkey,
  });
}

export async function handlePaymentSuccess(req: Request, res: Response) {
  const clientBase = process.env.CLIENT_URL || "http://localhost:3000";
  const body = req.body || {};
  const tran_id = (body.tran_id || req.query.tran_id) as string;
  const val_id = (body.val_id || req.query.val_id) as string;

  if (!tran_id) {
    return res.redirect(`${clientBase}/agency/profile?payment=invalid`);
  }

  const [record] = await db
    .select()
    .from(agencyVerificationRequests)
    .where(eq(agencyVerificationRequests.transactionId, tran_id))
    .limit(1);

  if (!record) {
    return res.redirect(`${clientBase}/agency/profile?payment=not_found`);
  }

  let validationData: any = {};
  if (val_id) {
    validationData = await validatePayment(val_id, tran_id);
  }

  const [updated] = await db
    .update(agencyVerificationRequests)
    .set({
      status: "under_review",
      paymentStatus: "paid",
      paymentDetails: {
        ...body,
        validation: validationData,
        paidAt: new Date().toISOString(),
      },
      updatedAt: new Date(),
    })
    .where(eq(agencyVerificationRequests.id, record.id))
    .returning();

  const [agency] = await db
    .select({ companyName: agencyProfiles.companyName })
    .from(agencyProfiles)
    .where(eq(agencyProfiles.userId, record.agencyId))
    .limit(1);

  const agencyName = agency?.companyName || "An agency";

  // Notify Admins
  await notifyAdmins({
    type: "agency_verification_submitted",
    title: "New Agency Verification Payment",
    body: `${agencyName} has paid ৳${VERIFICATION_FEE_BDT} via SSLCommerz (TrxID: ${tran_id}) and submitted documents for badge approval.`,
  });

  // Notify Agency
  await notifyUser(record.agencyId, {
    type: "agency_verification_payment_received",
    title: "Verification Payment Successful",
    body: `Your payment of ৳${VERIFICATION_FEE_BDT} (TrxID: ${tran_id}) has been confirmed. Platform administrators are reviewing your documents.`,
  });

  res.redirect(`${clientBase}/agency/profile?payment=success&tran_id=${encodeURIComponent(tran_id)}`);
}

export async function handlePaymentFail(req: Request, res: Response) {
  const clientBase = process.env.CLIENT_URL || "http://localhost:3000";
  const tran_id = (req.body?.tran_id || req.query.tran_id) as string;

  if (tran_id) {
    await db
      .update(agencyVerificationRequests)
      .set({
        paymentStatus: "failed",
        paymentDetails: req.body,
        updatedAt: new Date(),
      })
      .where(eq(agencyVerificationRequests.transactionId, tran_id));
  }

  res.redirect(`${clientBase}/agency/profile?payment=failed&tran_id=${encodeURIComponent(tran_id || "")}`);
}

export async function handlePaymentCancel(req: Request, res: Response) {
  const clientBase = process.env.CLIENT_URL || "http://localhost:3000";
  const tran_id = (req.body?.tran_id || req.query.tran_id) as string;

  res.redirect(`${clientBase}/agency/profile?payment=cancelled&tran_id=${encodeURIComponent(tran_id || "")}`);
}

export async function handlePaymentIpn(req: Request, res: Response) {
  const tran_id = req.body?.tran_id;
  const val_id = req.body?.val_id;

  if (tran_id && val_id) {
    const [record] = await db
      .select()
      .from(agencyVerificationRequests)
      .where(eq(agencyVerificationRequests.transactionId, tran_id))
      .limit(1);

    if (record && record.paymentStatus !== "paid") {
      await db
        .update(agencyVerificationRequests)
        .set({
          status: "under_review",
          paymentStatus: "paid",
          paymentDetails: req.body,
          updatedAt: new Date(),
        })
        .where(eq(agencyVerificationRequests.id, record.id));
    }
  }

  res.status(200).send("IPN_PROCESSED");
}

const demoPaymentSchema = z.object({
  tran_id: z.string().min(1),
  method: z.string().optional().default("bKash"),
  accountNumber: z.string().optional(),
  cardHolderName: z.string().optional(),
  bankName: z.string().optional(),
});

export async function completeDemoPayment(req: Request, res: Response) {
  const userId = req.user!.id;
  const { tran_id, method, accountNumber, cardHolderName, bankName } =
    demoPaymentSchema.parse(req.body);

  const [record] = await db
    .select()
    .from(agencyVerificationRequests)
    .where(eq(agencyVerificationRequests.transactionId, tran_id))
    .limit(1);

  if (!record) {
    throw new AppError("Verification request not found.", 404);
  }

  if (record.agencyId !== userId && req.user!.role !== "admin") {
    throw new AppError("Unauthorized.", 403);
  }

  const prefix = (method || "SSL").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4);
  const bankTranId = `SSL_${prefix}_${Date.now().toString().slice(-6)}`;

  const [updated] = await db
    .update(agencyVerificationRequests)
    .set({
      status: "under_review",
      paymentStatus: "paid",
      paymentDetails: {
        gateway: "SSLCommerz Sandbox",
        paymentMethod: method,
        accountNumber: accountNumber || "01700000000",
        cardHolderName: cardHolderName || null,
        bankName: bankName || null,
        amount: record.feeAmount,
        currency: record.currency,
        bankTranId,
        paidAt: new Date().toISOString(),
      },
      updatedAt: new Date(),
    })
    .where(eq(agencyVerificationRequests.id, record.id))
    .returning();

  const [agency] = await db
    .select({ companyName: agencyProfiles.companyName })
    .from(agencyProfiles)
    .where(eq(agencyProfiles.userId, record.agencyId))
    .limit(1);

  const agencyName = agency?.companyName || "An agency";
  const acctDisplay = accountNumber ? ` [Acc: ${accountNumber}]` : "";

  // Notify Admins
  await notifyAdmins({
    type: "agency_verification_submitted",
    title: "Agency Verification Paid & Submitted",
    body: `${agencyName} has paid ৳${record.feeAmount} via ${method}${acctDisplay} (TrxID: ${tran_id}) and requested badge verification.`,
  });

  // Notify Agency
  await notifyUser(record.agencyId, {
    type: "agency_verification_payment_received",
    title: "Verification Payment Confirmed",
    body: `Your payment of ৳${record.feeAmount} (TrxID: ${tran_id}) via ${method}${acctDisplay} is confirmed. Platform admins are reviewing your documents.`,
  });

  res.json({
    success: true,
    message: "Payment processed successfully.",
    request: updated,
  });
}
