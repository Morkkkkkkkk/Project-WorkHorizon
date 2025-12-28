import apiClient from './apiClient';

// (Helper function เพื่อคืนค่า data โดยตรง)
const handleResponse = (res) => res.data;

// === Public (สำหรับผู้หางาน) ===

/**
 * ค้นหางาน (Public)
 * (อัปเดต) เพิ่ม page และ limit
 * @param {object} filters - (เช่น { q: 'dev', categoryId: '...', page: 1 })
 */
const searchJobs = (filters) => {
  // 1. กรองค่าว่างออกจาก filters ก่อนส่ง
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v != null && v !== '')
  );
  // 2. สร้าง Query String
  const queryParams = new URLSearchParams(cleanFilters).toString();
  
  // 3. ยิง API
  // (Backend คาดหวัง data: { jobs: [], totalPages: 1, currentPage: 1 })
  return apiClient.get(`/jobs?${queryParams}`).then(handleResponse);
};

/**
 * ดึงข้อมูลงาน 1 ชิ้น (Public)
 * @param {string} jobId
 */
const getJobDetail = (jobId) => {
  return apiClient.get(`/jobs/${jobId}`).then(handleResponse);
};


// === Employer (สำหรับผู้ประกอบการ) ===

/**
 * (Employer) ดึงรายการงานทั้งหมดของบริษัทตัวเอง
 */
const getMyJobs = () => {
  return apiClient.get('/companies/me/jobs').then(handleResponse);
};


/**
 * (Employer) สร้างงานใหม่
 * @param {object} jobData - (ข้อมูลจาก Form)
 */
const createJob = (jobData) => {
  return apiClient.post('/jobs', jobData).then(handleResponse);
};

/**
 * (Employer) อัปเดตงาน
 * @param {string} jobId
 * @param {object} jobData - (ข้อมูลจาก Form)
 */
const updateJob = (jobId, jobData) => {
  return apiClient.put(`/jobs/${jobId}`, jobData).then(handleResponse);
};

/**
 * (Employer) ลบงาน
 * @param {string} jobId
 */
const deleteJob = (jobId) => {
  return apiClient.delete(`/jobs/${jobId}`).then(handleResponse);
};

/**
 * (Employer) เปลี่ยนสถานะงาน (เช่น PUBLISHED, ARCHIVED)
 * @param {string} jobId
 * @param {string} status
 */
const updateJobStatus = (jobId, status) => {
  return apiClient.patch(`/jobs/${jobId}/status`, { status }).then(handleResponse);
};

/**
 * (Employer) อัปโหลดรูปภาพสำหรับงาน
 * @param {string} jobId
 * @param {FormData} formData (มี field 'jobImages')
 */
const uploadJobImages = (jobId, formData) => {
  return apiClient.post(`/jobs/${jobId}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * (Employer) ลบรูปภาพของงาน
 * @param {string} imageId
 */
const deleteJobImage = (imageId) => {
  return apiClient.delete(`/jobs/images/${imageId}`);
};

// ✅ (เพิ่มใหม่) อัปโหลดเอกสารแนบ (PDF)
/**
 * (Employer) อัปโหลดเอกสารสำหรับงาน
 * @param {string} jobId
 * @param {FormData} formData (มี field 'jobDocuments')
 */
const uploadJobDocuments = (jobId, formData) => {
  return apiClient.post(`/jobs/${jobId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ✅ (เพิ่มใหม่) ลบเอกสารแนบ
/**
 * (Employer) ลบเอกสารแนบของงาน
 * @param {string} docId
 */
const deleteJobDocument = (docId) => {
  return apiClient.delete(`/jobs/documents/${docId}`);
};

// ส่งออกเป็น Object
export const jobApi = {
  searchJobs,
  getJobDetail,
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  uploadJobImages, 
  deleteJobImage,
  // ✅ อย่าลืมส่งออก 2 ฟังก์ชันใหม่นี้
  uploadJobDocuments,
  deleteJobDocument
};