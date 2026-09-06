import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import {
  listUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from "@/controllers/universityController";
import { uploadUniversityImages, viewUniversityImage } from "@/controllers/universityController";
import { uploadDocument } from "@/middleware/upload";

const router = Router();

router.get("/", asyncHandler(listUniversities));
router.get("/images/*", asyncHandler(viewUniversityImage));
router.get("/:id", asyncHandler(getUniversity));
router.post("/", requireAuth, requireRole("admin"), asyncHandler(createUniversity));
router.patch("/:id", requireAuth, requireRole("admin"), asyncHandler(updateUniversity));
router.post("/:id/images", requireAuth, requireRole("admin"), uploadDocument.array("images", 8), asyncHandler(uploadUniversityImages));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(deleteUniversity));

export default router;
