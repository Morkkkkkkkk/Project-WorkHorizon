import { Router } from 'express';
import {
  createCompany,
  getMyCompany,
  updateMyCompany,
  getPublicCompany,
  uploadLogo,
} from '../controllers/company.controller.js';
import {
  authenticateToken,
  isEmployer,
} from '../middlewares/auth.middleware.js';
import { getMyCompanyJobs } from '../controllers/job.controller.js'; // (Logic อยู่ที่ job.controller)
import { diskUpload } from '../services/diskStorage.service.js';

const router = Router();

// --- Routes ที่ต้องยืนยันตัวตน ---
router.use(authenticateToken);

// GET /api/companies/me (Employer เท่านั้น)
router.get('/me', isEmployer, getMyCompany);

// PUT /api/companies/me (Employer เท่านั้น)
router.put('/me', isEmployer, updateMyCompany);

// GET /api/companies/me/jobs (Employer เท่านั้น - ดึงงานของบริษัทตัวเอง)
router.get('/me/jobs', isEmployer, getMyCompanyJobs);

//  Route สำหรับอัปโหลด Logo
// PUT /api/companies/me/logo (Employer เท่านั้น)
router.put(
  '/me/logo', 
  isEmployer, 
  diskUpload.single('logoFile'),
  uploadLogo
)

// POST /api/companies (Employer เท่านั้น)
router.post('/', isEmployer, createCompany);

// GET /api/companies/:companyId (Public)
router.get('/:companyId', getPublicCompany);

export default router;
