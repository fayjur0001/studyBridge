import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import {
  listPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@/controllers/programController";

const router = Router();

router.get("/", asyncHandler(listPrograms));
router.get("/:id", asyncHandler(getProgram));
router.post("/", requireAuth, requireRole("admin"), asyncHandler(createProgram));
router.patch("/:id", requireAuth, requireRole("admin"), asyncHandler(updateProgram));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(deleteProgram));

export default router;
