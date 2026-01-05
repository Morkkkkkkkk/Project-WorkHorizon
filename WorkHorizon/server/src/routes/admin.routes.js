import { Router } from "express";
import {
  verifyCompany,
  getAllUsers,
  deleteUser,
  getAllJobs,
  getAdminCompanies,
  adminDeleteJob,
  adminCreateUser,
  adminUpdateUser,
  adminUpdateJob,

  adminCreateSubCategory,
  adminUpdateSubCategory,
  adminDeleteSubCategory,

  adminCreateJobType,
  adminUpdateJobType,
  adminDeleteJobType,
  adminCreateIndustry,
  adminUpdateIndustry,
  adminDeleteIndustry,
  adminCreateSkill,
  adminUpdateSkill,
  adminDeleteSkill,

  adminCreateProvince,
  adminUpdateProvince,
  adminDeleteProvince,
  adminCreateDistrict,
  adminUpdateDistrict,
  adminDeleteDistrict,

  adminGetSubCategories,
  adminGetSkills,
  adminGetJobTypes,
  adminGetIndustries,
  adminGetProvinces,
  adminGetDistricts,

  getAdminStats,
  updateUserStatus,

  getWithdrawalRequests, 
  approveWithdrawal

} from "../controllers/admin.controller.js";
import { authenticateToken, isAdmin } from "../middlewares/auth.middleware.js";
import { getAdminSections,createSection,updateSection,deleteSection,} from "../controllers/featuredSection.controller.js";

const router = Router();

// --- ทุก Route ต้องเป็น Admin เท่านั้น ---
router.use(authenticateToken);
router.use(isAdmin);

router.patch('/users/:userId/status', updateUserStatus);

// --- Company Routes ---
router.get("/companies", getAdminCompanies);
router.patch("/companies/:companyId/verify", verifyCompany);

// --- User Routes ---
router.get("/users", getAllUsers);
router.post("/users", adminCreateUser);
router.put("/users/:userId", adminUpdateUser);
router.delete("/users/:userId", deleteUser);

// Job
router.get("/jobs", getAllJobs);
router.put("/jobs/:jobId", adminUpdateJob);
router.delete("/jobs/:jobId", adminDeleteJob);

// --- Master Data Routes  ---
// (Category)
router.post("/sub-categories", adminCreateSubCategory);
router.put("/sub-categories/:id", adminUpdateSubCategory);
router.delete("/sub-categories/:id", adminDeleteSubCategory);
router.get("/sub-categories", adminGetSubCategories);
// (JobType)
router.post("/job-types", adminCreateJobType);
router.put("/job-types/:id", adminUpdateJobType);
router.delete("/job-types/:id", adminDeleteJobType);
// (Industry)
router.post("/industries", adminCreateIndustry);
router.put("/industries/:id", adminUpdateIndustry);
router.delete("/industries/:id", adminDeleteIndustry);
// (Skill)
router.post("/skills", adminCreateSkill);
router.put("/skills/:id", adminUpdateSkill);
router.delete("/skills/:id", adminDeleteSkill);
// (Province)
router.post("/provinces", adminCreateProvince);
router.put("/provinces/:id", adminUpdateProvince);
router.delete("/provinces/:id", adminDeleteProvince);
// (District)
router.post("/districts", adminCreateDistrict);
router.put("/districts/:id", adminUpdateDistrict);
router.delete("/districts/:id", adminDeleteDistrict);
// --- Get Master Data Lists ---

router.get("/skills", adminGetSkills);
router.get("/job-types", adminGetJobTypes);
router.get("/industries", adminGetIndustries);
router.get("/provinces", adminGetProvinces);
router.get("/districts", adminGetDistricts);


// --- Stats Route ---
router.get("/stats", getAdminStats); 

// --- จัดการสถานะ User ---
router.patch("/users/:userId/status", updateUserStatus);


router.get("/featured-sections", getAdminSections);
router.post("/featured-sections", createSection);
router.put("/featured-sections/:id", updateSection);
router.delete("/featured-sections/:id", deleteSection);

// --- Withdrawal Routes ---
router.get('/withdrawals', getWithdrawalRequests);
router.patch('/transactions/:transactionId/withdraw', approveWithdrawal);




export default router;
