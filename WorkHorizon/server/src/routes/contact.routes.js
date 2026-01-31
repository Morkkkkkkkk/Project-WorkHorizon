import { Router } from "express";
import {
  createContactRequest,
  getAllContactRequests,
  updateContactRequestStatus,
} from "../controllers/contact.controller.js";
import { authenticateToken, isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Public Route (No auth required)
router.post("/", createContactRequest);

// Admin Routes (Protected)
router.get("/", authenticateToken, isAdmin, getAllContactRequests);
router.patch(
  "/:id/status",
  authenticateToken,
  isAdmin,
  updateContactRequestStatus,
);

export default router;
