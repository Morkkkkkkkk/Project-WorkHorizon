import { Router } from "express";
import {
  getMessages,
  sendMessage,
  getAllConversations, // ✅ NEW
  deleteConversation, // ✅ NEW
} from "../controllers/conversation.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authenticateToken);

// ✅ NEW: GET /api/conversations - Get all user conversations
router.get("/", getAllConversations);

// ✅ NEW: DELETE /api/conversations/:convoId - Delete conversation
router.delete("/:convoId", deleteConversation);

// GET /api/conversations/:convoId/messages (ดึงข้อความ)
router.get("/:convoId/messages", getMessages);

// POST /api/conversations/:convoId/messages (ส่งข้อความ)
router.post("/:convoId/messages", sendMessage);

export default router;
