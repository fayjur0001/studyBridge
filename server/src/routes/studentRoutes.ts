import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import { getMyProfile, updateMyProfile } from "@/controllers/studentProfileController";
import { getMyRecommendations } from "@/controllers/recommendationController";
import {
  getMyNotificationPreferences,
  updateMyNotificationPreferences,
} from "@/controllers/notificationPreferencesController";
import { deactivateMyAccount, getMySessions, getMySettings, revokeMySession, updateMySettings } from "@/controllers/studentSettingsController";
import { requestAgencyService } from "@/controllers/agencyServiceInterestController";

const router = Router();

router.use(requireAuth, requireRole("student"));

router.get("/me", asyncHandler(getMyProfile));
router.patch("/me", asyncHandler(updateMyProfile));

router.get("/recommendations", asyncHandler(getMyRecommendations));

router.get("/notification-preferences", asyncHandler(getMyNotificationPreferences));
router.patch("/notification-preferences", asyncHandler(updateMyNotificationPreferences));

router.get("/settings", asyncHandler(getMySettings));
router.patch("/settings", asyncHandler(updateMySettings));
router.get("/sessions", asyncHandler(getMySessions));
router.delete("/sessions/:id", asyncHandler(revokeMySession));
router.post("/deactivate", asyncHandler(deactivateMyAccount));
router.post("/agency-services/:serviceId/join", asyncHandler(requestAgencyService));

export default router;
