import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole, optionalAuth } from "@/middleware/auth";
import {
  listUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  reviewUniversity,
  uploadUniversityImages,
  viewUniversityImage,
} from "@/controllers/universityController";
import { uploadDocument } from "@/middleware/upload";

const router = Router();

router.get("/", optionalAuth, asyncHandler(listUniversities));
router.get("/images/*", asyncHandler(viewUniversityImage));
router.get("/:id", optionalAuth, asyncHandler(getUniversity));
router.post("/", requireAuth, requireRole("admin", "agency"), asyncHandler(createUniversity));
router.patch("/:id/review", requireAuth, requireRole("admin"), asyncHandler(reviewUniversity));
router.patch("/:id", requireAuth, requireRole("admin", "agency"), asyncHandler(updateUniversity));
router.post("/:id/images", requireAuth, requireRole("admin", "agency"), uploadDocument.array("images", 8), asyncHandler(uploadUniversityImages));
router.delete("/:id", requireAuth, requireRole("admin", "agency"), asyncHandler(deleteUniversity));

export default router;
