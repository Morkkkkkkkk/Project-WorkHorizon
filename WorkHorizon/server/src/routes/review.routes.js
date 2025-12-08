import { Router } from "express";
import {
  createReview,
  getFreelancerReviews,
  getServiceReviews,
} from "../controllers/review.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// POST /api/freelancers/:freelancerId/reviews - สร้างรีวิว (ต้อง login)
router.post("/:freelancerId/reviews", authenticateToken, createReview);

// GET /api/freelancers/:freelancerId/reviews - ดึงรีวิวทั้งหมด (ไม่ต้อง login)
router.get("/:freelancerId/reviews", getFreelancerReviews);

// GET /api/services/:serviceId/reviews - ดึงรีวิวของ Service (ไม่ต้อง login)
router.get("/services/:serviceId/reviews", getServiceReviews);

export default router;
