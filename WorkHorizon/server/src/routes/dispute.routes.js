import { Router } from "express";
import { 
  createDispute, 
  getDisputeDetail, 
  replyDispute, 
  resolveDispute,
  getAllDisputes,
  deleteDispute
} from "../controllers/dispute.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// บังคับล็อกอินทุก Route
router.use(authenticateToken);

// POST /api/disputes/create - แจ้งปัญหา
router.post("/create", createDispute);

// POST /api/disputes/reply - ตอบแชท
router.post("/reply", replyDispute);

// POST /api/disputes/resolve - Admin ตัดสิน (คืนเงิน/จ่ายเงิน)
router.post("/resolve", resolveDispute);

// GET /api/disputes/:ticketId - ดูรายละเอียดและประวัติแชท
router.get("/:ticketId", getDisputeDetail);

// GET /api/disputes/ - (Admin) ดูรายการข้อพิพาททั้งหมด
router.get("/admin/all", getAllDisputes);

// DELETE /api/disputes/:ticketId - (Admin) ลบข้อพิพาท
router.delete("/:ticketId", deleteDispute);

export default router;