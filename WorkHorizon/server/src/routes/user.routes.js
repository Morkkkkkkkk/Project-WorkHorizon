import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  uploadProfilePicture,

  getMyEducations,
  addMyEducation,
  updateMyEducation,
  deleteMyEducation,

  getMyExperiences,
  addMyExperience,
  updateMyExperience,
  deleteMyExperience,

  getMySkills,
  updateMySkills,

  getMyResumes,
  uploadResume,
  deleteResume,

  getSavedJobs,
  saveJob,
  unsaveJob,

  getRecommendedJobs,
  changePassword,
} from '../controllers/user.controller.js';
import {
  authenticateToken,
  isJobSeeker,
  isCandidate,
} from '../middlewares/auth.middleware.js';
import { diskUpload } from '../services/diskStorage.service.js';


const router = Router();

// --- ทุก Route ในไฟล์นี้ต้องยืนยันตัวตนก่อน ---
router.use(authenticateToken);

// 2. Profile
router.get('/me', getMyProfile);
router.put('/me', updateMyProfile);

// 3. (เพิ่ม) Route สำหรับอัปโหลดรูปโปรไฟล์
router.put(
  '/me/profile-picture', 
  diskUpload.single('profileImage'),
  uploadProfilePicture
);

// 2.1 Education (Job Seeker เท่านั้น)
router.get('/me/educations', isJobSeeker, getMyEducations);
router.post('/me/educations', isJobSeeker, addMyEducation);
router.put('/me/educations/:eduId', isJobSeeker, updateMyEducation);
router.delete('/me/educations/:eduId', isJobSeeker, deleteMyEducation);

// 2.2 Experience (Job Seeker เท่านั้น)
router.get('/me/experiences', isJobSeeker, getMyExperiences);
router.post('/me/experiences', isJobSeeker, addMyExperience);
router.put('/me/experiences/:expId', isJobSeeker, updateMyExperience);
router.delete('/me/experiences/:expId', isJobSeeker, deleteMyExperience);

// 2.3 Skills (Job Seeker เท่านั้น)
router.get('/me/skills', isCandidate, getMySkills);
router.put('/me/skills', isCandidate, updateMySkills);

// 2.4 Resumes (Job Seeker เท่านั้น)
router.get('/me/resumes', isJobSeeker, getMyResumes);
router.post(
  '/me/resumes/upload',
  isJobSeeker,
  diskUpload.single('resumeFile'), // 'resumeFile' คือชื่อ field จาก FormData
  uploadResume
);
router.delete('/me/resumes/:resumeId', isJobSeeker, deleteResume);

// 6. Saved Jobs (Job Seeker เท่านั้น)
router.get('/me/saved-jobs', isCandidate, getSavedJobs);
router.post('/me/saved-jobs', isCandidate, saveJob);
router.delete('/me/saved-jobs/:jobId', isCandidate, unsaveJob);

// 7. Recommended Jobs (Job Seeker เท่านั้น)
router.get('/me/recommendations', isCandidate, getRecommendedJobs);

// POST /api/users/me/change-password (สำหรับทุกคนที่ล็อกอิน)
router.post('/me/change-password', changePassword);

export default router;
