import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import {
  handlePaymentSuccess,
  handlePaymentFail,
  handlePaymentCancel,
  handlePaymentIpn,
} from "@/controllers/agencyVerificationController";

const router = Router();

// SSLCommerz callbacks can be POST (standard gateway return) or GET
router.all("/sslcommerz/success", asyncHandler(handlePaymentSuccess));
router.all("/sslcommerz/fail", asyncHandler(handlePaymentFail));
router.all("/sslcommerz/cancel", asyncHandler(handlePaymentCancel));
router.post("/sslcommerz/ipn", asyncHandler(handlePaymentIpn));

export default router;
