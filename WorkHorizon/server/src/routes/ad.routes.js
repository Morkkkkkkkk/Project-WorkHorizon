import { Router } from 'express';
import {
  authenticateToken,
  isAdmin,
} from '../middlewares/auth.middleware.js';
import { diskUpload } from '../services/diskStorage.service.js';
import {
  createAd,
  getAds,
  updateAd,
  deleteAd,
  updateAdImage,
  getAdminAds, // <--- 1. (เพิ่ม) Import getAdminAds
} from '../controllers/ad.controller.js';

const router = Router();

// (Public)
router.get('/', getAds); 

// --- Admin Only ---
router.use(authenticateToken);
router.use(isAdmin);

// --- 2. (เพิ่มใหม่) ---
// GET /api/advertisements/admin
router.get('/admin', getAdminAds);
// --- (จบส่วนเพิ่มใหม่) ---

// POST /api/advertisements (สร้าง)
router.post(
  '/', 
  diskUpload.single('adImage'),
  createAd
);

// PUT /api/advertisements/:adId (อัปเดต Text)
router.put('/:adId', updateAd);

// (เพิ่ม) POST /api/advertisements/:adId/image (อัปเดตรูปภาพ)
router.post(
  '/:adId/image',
  diskUpload.single('adImage'),
  updateAdImage
);

// DELETE /api/advertisements/:adId (ลบ)
router.delete('/:adId', deleteAd);

export default router;