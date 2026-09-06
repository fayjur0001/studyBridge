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

const router = Router();

router.get("/", asyncHandler(listUniversities));
router.get("/:id", asyncHandler(getUniversity));
router.post("/", requireAuth, requireRole("admin"), asyncHandler(createUniversity));
router.patch("/:id", requireAuth, requireRole("admin"), asyncHandler(updateUniversity));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(deleteUniversity));

export default router;
