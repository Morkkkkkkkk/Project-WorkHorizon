import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import companyRoutes from "./company.routes.js";
import jobRoutes from "./job.routes.js";
import applicationRoutes from "./application.routes.js";
import conversationRoutes from "./conversation.routes.js";
import notificationRoutes from "./notification.routes.js";
import masterDataRoutes from "./masterData.routes.js";
import adminRoutes from "./admin.routes.js";
import adRoutes from "./ad.routes.js";
import mainCategoryRoutes from "./mainCategory.routes.js";
import featuredSectionRoutes from "./featuredSection.routes.js";
import freelancerRoutes from "./freelancer.routes.js";
import serviceRoutes from "./service.routes.js";
import reviewRoutes from "./review.routes.js"; 
import paymentRoutes from "./payment.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes); // (จัดการ /api/users/me/*)
router.use("/companies", companyRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
// (SavedJobs อยู่ใน user.routes)
router.use("/conversations", conversationRoutes);
router.use("/notifications", notificationRoutes);
router.use("/data", masterDataRoutes);
router.use("/admin", adminRoutes);
router.use("/advertisements", adRoutes);

router.use("/main-categories", mainCategoryRoutes);
router.use("/featured-sections", featuredSectionRoutes);

router.use("/freelancers", freelancerRoutes);
router.use("/services", serviceRoutes);
router.use("/reviews", reviewRoutes); 

router.use("/payment", paymentRoutes);

// Health check
router.get("/health", (req, res) => {
  res.send("OK - API is running");
});

export default router;
