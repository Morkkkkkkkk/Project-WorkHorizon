import { Router } from 'express';
import { createService, getMyServices, updateService, deleteService, searchServices, getServiceById, getOrCreateServiceConversation } from '../controllers/service.controller.js';
import { authenticateToken, isFreelancer } from '../middlewares/auth.middleware.js';
import { diskUpload } from '../services/diskStorage.service.js';

const router = Router();
// เนื่องจาก /me เป็น Private Route (ต้องล็อกอิน) แต่ /:id เป็น Public 
router.get('/me',authenticateToken, isFreelancer, getMyServices);
//  Route นี้ (ต้องมี authenticateToken เพราะไม่ใช่ public)
router.get('/:serviceId/conversation', authenticateToken, getOrCreateServiceConversation);
// Public Search
router.get('/', searchServices);
router.get('/:id', getServiceById);

// Freelancer Only
router.use(authenticateToken); // ต้องล็อกอิน
router.post('/', isFreelancer, diskUpload.single('coverImage'), createService);
router.put('/:id', isFreelancer, diskUpload.single('coverImage'), updateService);
router.delete('/:id', isFreelancer, deleteService);

export default router;