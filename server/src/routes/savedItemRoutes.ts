import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import { listMySavedItems, saveItem, unsaveItem } from "@/controllers/savedItemController";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listMySavedItems));
router.post("/", asyncHandler(saveItem));
router.delete("/:itemType/:itemId", asyncHandler(unsaveItem));

export default router;
