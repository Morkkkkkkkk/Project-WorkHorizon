import { Router } from 'express';
import { authenticateToken, isAdmin } from '../middlewares/auth.middleware.js';
import { diskUpload } from '../services/diskStorage.service.js';
import {
  createMainCategory,
  updateMainCategory,
  updateMainCategoryImage,
  deleteMainCategory,
  getMainCategories,
} from '../controllers/mainCategory.controller.js';

const router = Router();

// --- Public ---
router.get('/', getMainCategories);

// --- Admin Only ---
router.use(authenticateToken);
router.use(isAdmin);

router.post(
  '/', 
  diskUpload.single('image'), // (ใช้ชื่อ field ว่า 'image')
  createMainCategory
);

router.put('/:id', updateMainCategory); // อัปเดตชื่อ

router.post(
  '/:id/image',
  diskUpload.single('image'), // (ใช้ชื่อ field ว่า 'image')
  updateMainCategoryImage // อัปเดตรูป
);

router.delete('/:id', deleteMainCategory); // ลบ

export default router;