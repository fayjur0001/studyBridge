import { Router } from "express";
import authRoutes from "./authRoutes";
import universityRoutes from "./universityRoutes";
import programRoutes from "./programRoutes";
import scholarshipRoutes from "./scholarshipRoutes";
import studentRoutes from "./studentRoutes";
import applicationRoutes from "./applicationRoutes";
import documentRoutes from "./documentRoutes";
import savedItemRoutes from "./savedItemRoutes";
import agencyRoutes from "./agencyRoutes";
import adminRoutes from "./adminRoutes";
import messageRoutes from "./messageRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/universities", universityRoutes);
router.use("/programs", programRoutes);
router.use("/scholarships", scholarshipRoutes);
router.use("/student", studentRoutes);
router.use("/applications", applicationRoutes);
router.use("/documents", documentRoutes);
router.use("/saved-items", savedItemRoutes);
router.use("/agency", agencyRoutes);
router.use("/admin", adminRoutes);
router.use("/conversations", messageRoutes);

// Phase 7: wire the frontend to this API.

export default router;
