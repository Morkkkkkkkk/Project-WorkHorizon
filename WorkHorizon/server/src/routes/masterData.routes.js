import { Router } from 'express';
import {
  getJobTypes,
  getIndustries,
  getSkills,
  getProvinces,
  getDistricts,
  getSubCategories,
} from '../controllers/masterData.controller.js';

const router = Router();

// (Public ทั้งหมด ไม่ต้องยืนยันตัวตน)
router.get('/job-types', getJobTypes);
router.get('/industries', getIndustries);
router.get('/skills', getSkills);
router.get('/provinces', getProvinces);
router.get('/provinces/:provinceId/districts', getDistricts);
router.get('/main-categories/:mainCategoryId/sub-categories', getSubCategories);

export default router;
