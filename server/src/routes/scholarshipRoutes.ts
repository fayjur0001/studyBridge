import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import {
  listScholarships,
  getScholarship,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} from "@/controllers/scholarshipController";

const router = Router();

router.get("/", asyncHandler(listScholarships));
router.get("/:id", asyncHandler(getScholarship));
router.post("/", requireAuth, requireRole("admin"), asyncHandler(createScholarship));
router.patch("/:id", requireAuth, requireRole("admin"), asyncHandler(updateScholarship));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(deleteScholarship));

export default router;
