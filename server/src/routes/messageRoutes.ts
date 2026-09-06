import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import {
  listMyConversations,
  startConversation,
  listMessages,
  sendMessage,
} from "@/controllers/messagingController";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listMyConversations));
router.post("/", asyncHandler(startConversation));
router.get("/:id/messages", asyncHandler(listMessages));
router.post("/:id/messages", asyncHandler(sendMessage));

export default router;
