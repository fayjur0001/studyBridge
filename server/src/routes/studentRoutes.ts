import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import { getMyProfile, updateMyProfile } from "@/controllers/studentProfileController";
import { getMyRecommendations } from "@/controllers/recommendationController";
import {
  getMyNotificationPreferences,
  updateMyNotificationPreferences,
} from "@/controllers/notificationPreferencesController";

const router = Router();

router.use(requireAuth, requireRole("student"));

router.get("/me", asyncHandler(getMyProfile));
router.patch("/me", asyncHandler(updateMyProfile));

router.get("/recommendations", asyncHandler(getMyRecommendations));

router.get("/notification-preferences", asyncHandler(getMyNotificationPreferences));
router.patch("/notification-preferences", asyncHandler(updateMyNotificationPreferences));

export default router;
