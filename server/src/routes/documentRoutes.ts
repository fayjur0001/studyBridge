import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth, requireRole } from "@/middleware/auth";
import { uploadDocument } from "@/middleware/upload";
import {
  listMyDocuments,
  uploadMyDocument,
  deleteMyDocument,
  reviewDocument,
} from "@/controllers/documentController";

const router = Router();

router.get("/", requireAuth, requireRole("student"), asyncHandler(listMyDocuments));
router.post(
  "/",
  requireAuth,
  requireRole("student"),
  uploadDocument.single("file"),
  asyncHandler(uploadMyDocument)
);
router.delete("/:id", requireAuth, requireRole("student"), asyncHandler(deleteMyDocument));

router.patch(
  "/:id/review",
  requireAuth,
  requireRole("agency", "admin"),
  asyncHandler(reviewDocument)
);

export default router;
