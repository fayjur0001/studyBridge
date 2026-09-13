import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole, optionalAuth } from "@/middleware/auth";
import {
  listScholarships,
  getScholarship,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  reviewScholarship,
} from "@/controllers/scholarshipController";

const router = Router();

router.get("/", optionalAuth, asyncHandler(listScholarships));
router.get("/:id", optionalAuth, asyncHandler(getScholarship));
router.post("/", requireAuth, requireRole("admin", "agency"), asyncHandler(createScholarship));
router.patch("/:id/review", requireAuth, requireRole("admin"), asyncHandler(reviewScholarship));
router.patch("/:id", requireAuth, requireRole("admin", "agency"), asyncHandler(updateScholarship));
router.delete("/:id", requireAuth, requireRole("admin", "agency"), asyncHandler(deleteScholarship));

export default router;
