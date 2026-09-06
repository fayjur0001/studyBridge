import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import { listUsers, getUser, setUserActive } from "@/controllers/adminUserController";
import { listAgencies, setAgencyVerified } from "@/controllers/adminAgencyController";
import {
  getAdminOverviewStats,
  getAdminReportStats,
} from "@/controllers/adminOverviewController";
import { getAdminAnalytics } from "@/controllers/adminAnalyticsController";
import { listSiteContent, upsertSiteContent } from "@/controllers/siteContentController";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/overview", asyncHandler(getAdminOverviewStats));
router.get("/reports", asyncHandler(getAdminReportStats));
router.get("/analytics", asyncHandler(getAdminAnalytics));

router.get("/content", asyncHandler(listSiteContent));
router.put("/content", asyncHandler(upsertSiteContent));

router.get("/users", asyncHandler(listUsers));
router.get("/users/:id", asyncHandler(getUser));
router.patch("/users/:id/active", asyncHandler(setUserActive));

router.get("/agencies", asyncHandler(listAgencies));
router.patch("/agencies/:id/verify", asyncHandler(setAgencyVerified));

export default router;
