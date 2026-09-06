import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import {
  listMyApplications,
  getMyApplicationStats,
  getMyApplication,
  createMyApplication,
  updateMyApplication,
  submitMyApplication,
  withdrawMyApplication,
} from "@/controllers/applicationController";

const router = Router();

router.use(requireAuth, requireRole("student"));

router.get("/", asyncHandler(listMyApplications));
router.get("/stats", asyncHandler(getMyApplicationStats));
router.get("/:id", asyncHandler(getMyApplication));
router.post("/", asyncHandler(createMyApplication));
router.patch("/:id", asyncHandler(updateMyApplication));
router.post("/:id/submit", asyncHandler(submitMyApplication));
router.post("/:id/withdraw", asyncHandler(withdrawMyApplication));

export default router;
