import { Router } from "express";
import {
  getMyFreelancerProfile,
  updateMyFreelancerProfile,
  getPublicFreelancerProfile,
  uploadFreelancerProfilePicture,
  // ✅ เพิ่ม: API ใหม่สำหรับระบบรีวิว
  createWork,
  getMyHires,
  updateWorkStatus,
  deleteWork,
  submitReview,
} from "../controllers/freelancer.controller.js";
import {
  authenticateToken,
  isFreelancer,
  isJobSeeker,
} from "../middlewares/auth.middleware.js";
import { diskUpload } from "../services/diskStorage.service.js";

const router = Router();

// ==========================================
// 1. Private Routes (Specific Paths)
// ==========================================
// ต้องเอาไว้ก่อน /:freelancerId เพื่อไม่ให้โดนแย่ง (Shadowing)

// ดูข้อมูลตัวเอง
router.get("/me", authenticateToken, isFreelancer, getMyFreelancerProfile);

// แก้ไขข้อมูลตัวเอง
router.put("/me", authenticateToken, isFreelancer, updateMyFreelancerProfile);

// อัปโหลดรูป
router.put(
  "/me/profile-picture",
  authenticateToken,
  isFreelancer,
  diskUpload.single("profileImage"),
  uploadFreelancerProfilePicture
);

// ✅ API ใหม่: ดึงงานที่ Job Seeker จ้าง (My Hires)
router.get("/hires", authenticateToken, getMyHires);

// ✅ API ใหม่: Freelancer สร้างใบเสนอราคา (Offer)
router.post("/work", authenticateToken, isFreelancer, createWork);

// ✅ API ใหม่: อัปเดตสถานะงาน (Accept, Submit, Revision, Complete, Dispute)
// อนุญาตทั้ง Freelancer และ Job Seeker (Controller จะเช็คสิทธิ์เอง)
router.put("/work/:workId/status", authenticateToken, updateWorkStatus);

// ✅ API ใหม่: ลบงาน
router.delete("/work/:workId", authenticateToken, isFreelancer, deleteWork);

// ==========================================
// 2. Public Routes (Generic Paths)
// ==========================================

// ดูโปรไฟล์คนอื่น (Public)
router.get("/:freelancerId", getPublicFreelancerProfile);

// ==========================================
// 3. Other Private Routes (Generic Paths)
// ==========================================

// ✅ API ใหม่: Job Seeker ส่งรีวิว
// (ต้องเอาไว้หลัง /:freelancerId ถ้าเป็น GET แต่เป็น POST เลยไม่ชน แต่จัดกลุ่มไว้ตรงนี้ก็ดี)
router.post(
  "/:freelancerId/reviews",
  authenticateToken,
  isJobSeeker,
  submitReview
);

export default router;
