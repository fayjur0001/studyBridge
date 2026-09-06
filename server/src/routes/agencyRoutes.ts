import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import { getMyAgencyProfile, updateMyAgencyProfile } from "@/controllers/agencyProfileController";
import {
  listMyStudents,
  getMyStudent,
  linkStudent,
  unlinkStudent,
} from "@/controllers/agencyStudentController";
import {
  listAgencyApplications,
  updateAgencyApplicationStatus,
} from "@/controllers/agencyApplicationController";
import { getAgencyDashboardStats } from "@/controllers/agencyDashboardController";
import { getAgencyAnalytics } from "@/controllers/agencyAnalyticsController";
import {
  listMyServices,
  createMyService,
  updateMyService,
  deleteMyService,
} from "@/controllers/agencyServiceController";
import {
  getMyNotificationPreferences,
  updateMyNotificationPreferences,
} from "@/controllers/notificationPreferencesController";

const router = Router();

router.use(requireAuth, requireRole("agency"));

router.get("/me", asyncHandler(getMyAgencyProfile));
router.patch("/me", asyncHandler(updateMyAgencyProfile));

router.get("/dashboard/stats", asyncHandler(getAgencyDashboardStats));
router.get("/analytics", asyncHandler(getAgencyAnalytics));

router.get("/notification-preferences", asyncHandler(getMyNotificationPreferences));
router.patch("/notification-preferences", asyncHandler(updateMyNotificationPreferences));

router.get("/services", asyncHandler(listMyServices));
router.post("/services", asyncHandler(createMyService));
router.patch("/services/:id", asyncHandler(updateMyService));
router.delete("/services/:id", asyncHandler(deleteMyService));

router.get("/students", asyncHandler(listMyStudents));
router.post("/students/link", asyncHandler(linkStudent));
router.get("/students/:id", asyncHandler(getMyStudent));
router.delete("/students/:id", asyncHandler(unlinkStudent));

router.get("/applications", asyncHandler(listAgencyApplications));
router.patch("/applications/:id/status", asyncHandler(updateAgencyApplicationStatus));

export default router;
