import { Router } from "express";
import {
  processPayment,
  getMyTransactions,
  withdraw,
  notifyPaymentToFreelancer
} from "../controllers/payment.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js"; // สมมติว่ามี middleware นี้
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.use(authenticateToken);

// POST /api/payment/notify-slip - User ส่งสลิปแจ้งโอนเงินเข้าบัญชีกลาง
router.post("/notify-slip", upload.single('paymentSlip'), notifyPaymentToFreelancer);

// POST /api/payment/charge - ตัดบัตร
router.post("/charge", processPayment);

// POST /api/payment/withdraw - ถอนเงิน
router.post("/withdraw", withdraw); // ✅ เพิ่ม Route ถอนเงิน

// GET /api/payment/history/:userId - ดูประวัติ
router.get("/history/:userId", getMyTransactions);

export default router;
