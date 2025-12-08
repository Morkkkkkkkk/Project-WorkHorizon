import { Router } from "express";
import {
  processPayment,
  getMyTransactions,
  withdraw,
} from "../controllers/payment.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js"; // สมมติว่ามี middleware นี้

const router = Router();

router.use(authenticateToken);
// POST /api/payment/charge - ตัดบัตร
router.post("/charge", processPayment);

// POST /api/payment/withdraw - ถอนเงิน
router.post("/withdraw", withdraw); // ✅ เพิ่ม Route ถอนเงิน

// GET /api/payment/history/:userId - ดูประวัติ
router.get("/history/:userId", getMyTransactions);

export default router;
