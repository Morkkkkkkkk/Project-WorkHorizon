import { Router } from "express";
import { processPayment, getMyTransactions } from "../controllers/payment.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js"; // สมมติว่ามี middleware นี้

const router = Router();

// POST /api/payment/charge - ตัดบัตร
router.post("/charge", authenticateToken, processPayment);

// GET /api/payment/history/:userId - ดูประวัติ
router.get("/history/:userId", authenticateToken, getMyTransactions);

export default router;