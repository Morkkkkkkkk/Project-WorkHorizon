import { Router } from 'express';
import {
  createApplication,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  createInternalNote,
  createOrUpdateRating,
  deleteApplication,
} from '../controllers/application.controller.js';
import {
  authenticateToken,
  isJobSeeker,
  isEmployer,
  isCandidate,
} from '../middlewares/auth.middleware.js';
import { getOrCreateConversation } from '../controllers/conversation.controller.js'; 

const router = Router();

// --- ทุก Route ต้องยืนยันตัวตน ---
router.use(authenticateToken);

// POST /api/applications (Job Seeker สมัครงาน)
router.post('/', isCandidate, createApplication);

// GET /api/applications/my (Job Seeker ดูใบสมัครของตัวเอง)
router.get('/my', isCandidate, getMyApplications);

// GET /api/applications/:appId/conversation (ดึง/สร้าง ห้องแชท)
router.get('/:appId/conversation', getOrCreateConversation);

// GET /api/applications/:appId (ดูใบสมัคร 1 ใบ - ทั้ง 2 ฝ่าย)
router.get('/:appId', getApplicationById);

// PATCH /api/applications/:appId/status (Employer อัปเดตสถานะ)
router.patch('/:appId/status', isEmployer, updateApplicationStatus);

// POST /api/applications/:appId/notes (Employer เพิ่มโน้ต)
router.post('/:appId/notes', isEmployer, createInternalNote);

// POST /api/applications/:appId/rating (Employer ให้คะแนน)
router.post('/:appId/rating', isEmployer, createOrUpdateRating);

// DELETE /api/applications/:appId (Employer ลบใบสมัคร)
router.delete('/:appId', isEmployer, deleteApplication);

export default router;
