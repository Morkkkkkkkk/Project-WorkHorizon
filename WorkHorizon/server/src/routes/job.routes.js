import { Router } from 'express';
import {
  searchJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  uploadJobImages,  
  deleteJobImage,
  uploadJobDocuments, 
  deleteJobDocument
} from '../controllers/job.controller.js';
import { getApplicationsForJob } from '../controllers/application.controller.js'; // (Logic อยู่ที่ app.controller)
import {
  authenticateToken,
  isEmployer,
} from '../middlewares/auth.middleware.js';
import { diskUpload,documentUpload } from '../services/diskStorage.service.js';

const router = Router();

// --- Public Routes ---
// GET /api/jobs (ค้นหางาน)
router.get('/', searchJobs);

// GET /api/jobs/:jobId (ดูรายละเอียดงาน)
router.get('/:jobId', getJobById);

// --- Protected Routes (Employer) ---
router.use(authenticateToken);
router.use(isEmployer);

// POST /api/jobs (สร้างงาน)
router.post('/', createJob);

// PUT /api/jobs/:jobId (แก้ไขงาน)
router.put('/:jobId', updateJob);

// DELETE /api/jobs/:jobId (ลบงาน)
router.delete('/:jobId', deleteJob);

// PATCH /api/jobs/:jobId/status (เปลี่ยนสถานะงาน)
router.patch('/:jobId/status', updateJobStatus);

// GET /api/jobs/:jobId/applications (ดึงใบสมัครของงานนี้)
router.get('/:jobId/applications', getApplicationsForJob);

// POST /api/jobs/:jobId/images (อัปโหลดรูปสำหรับงาน)
router.post(
  '/:jobId/images',
  isEmployer,
  diskUpload.array('jobImages', 10), // (ใช้ .array() เพื่อรับหลายรูป, สูงสุด 10 รูป)
  uploadJobImages
);

// DELETE /api/jobs/images/:imageId (ลบรูป 1 ใบ)
router.delete(
  '/images/:imageId',
  isEmployer,
  deleteJobImage
);

// POST อัปโหลดเอกสาร PDF (เฉพาะ Employer)
router.post(
  '/:jobId/documents',
  isEmployer,        // ต้องเป็นบริษัท
  documentUpload.array('jobDocuments', 5), // รับได้สูงสุด 5 ไฟล์, key ชื่อ 'jobDocuments'
  uploadJobDocuments
);

// DELETE ลบเอกสาร
router.delete(
  '/documents/:docId',
  isEmployer,
  deleteJobDocument
);

export default router;
