import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import { getMyAgencyProfile, updateMyAgencyProfile, getAgencyPublicProfile, listAgencies, getSuggestedAgencies } from "@/controllers/agencyProfileController";
import { deleteMyAgencyFile, listMyAgencyFiles, uploadAgencyFile, uploadMyAgencyAvatar, viewAgencyAvatar, viewAgencyFile } from "@/controllers/agencyFileController";
import { uploadDocument } from "@/middleware/upload";
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
import { getMySettings, updateMySettings } from "@/controllers/studentSettingsController";
import { inviteTeamMember, listMyTeam, removeTeamMember, updateTeamMember } from "@/controllers/agencyTeamController";
import { listMyServiceInterests } from "@/controllers/agencyServiceInterestController";
import { listMyNotifications, markMyNotificationsRead } from "@/controllers/notificationController";

const router = Router();

// Students (and prospective students) can browse agency details before the
// agency-only middleware is applied below.
router.get("/directory", asyncHandler(listAgencies));
router.get("/suggested", asyncHandler(getSuggestedAgencies));
router.get("/:id/public", asyncHandler(getAgencyPublicProfile));
router.get("/:id/avatar", asyncHandler(viewAgencyAvatar));
router.get("/files/:id/file", asyncHandler(viewAgencyFile));

router.use(requireAuth, requireRole("agency"));

router.get("/me", asyncHandler(getMyAgencyProfile));
router.patch("/me", asyncHandler(updateMyAgencyProfile));
router.post("/me/avatar", uploadDocument.single("avatar"), asyncHandler(uploadMyAgencyAvatar));
router.get("/files", asyncHandler(listMyAgencyFiles));
router.post("/files", uploadDocument.single("file"), asyncHandler(uploadAgencyFile));
router.delete("/files/:id", asyncHandler(deleteMyAgencyFile));

router.get("/dashboard/stats", asyncHandler(getAgencyDashboardStats));
router.get("/analytics", asyncHandler(getAgencyAnalytics));
router.get("/notifications", asyncHandler(listMyNotifications));
router.patch("/notifications/read", asyncHandler(markMyNotificationsRead));

router.get("/notification-preferences", asyncHandler(getMyNotificationPreferences));
router.patch("/notification-preferences", asyncHandler(updateMyNotificationPreferences));
router.get("/settings", asyncHandler(getMySettings));
router.patch("/settings", asyncHandler(updateMySettings));
router.get("/team", asyncHandler(listMyTeam));
router.post("/team", asyncHandler(inviteTeamMember));
router.patch("/team/:id", asyncHandler(updateTeamMember));
router.delete("/team/:id", asyncHandler(removeTeamMember));

router.get("/services", asyncHandler(listMyServices));
router.post("/services", asyncHandler(createMyService));
router.patch("/services/:id", asyncHandler(updateMyService));
router.delete("/services/:id", asyncHandler(deleteMyService));
router.get("/service-interests", asyncHandler(listMyServiceInterests));

router.get("/students", asyncHandler(listMyStudents));
router.post("/students/link", asyncHandler(linkStudent));
router.get("/students/:id", asyncHandler(getMyStudent));
router.delete("/students/:id", asyncHandler(unlinkStudent));

router.get("/applications", asyncHandler(listAgencyApplications));
router.patch("/applications/:id/status", uploadDocument.single("file"), asyncHandler(updateAgencyApplicationStatus));

export default router;
