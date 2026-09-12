import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import {
  listMyNotifications,
  markMyNotificationsRead,
  markSingleNotificationRead,
} from "@/controllers/notificationController";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listMyNotifications));
router.patch("/read", asyncHandler(markMyNotificationsRead));
router.patch("/:id/read", asyncHandler(markSingleNotificationRead));

export default router;
