import apiClient from './apiClient';

// === Employer (สำหรับผู้ประกอบการ) ===

/**
 * (Employer) ดึงใบสมัครทั้งหมดของ "งานชิ้นเดียว"
 * @param {string} jobId
 */
const getApplicantsForJob = (jobId) => {
  return apiClient.get(`/jobs/${jobId}/applications`);
};

/**
 * (Employer) ดึงรายละเอียดใบสมัคร 1 ใบ (เผื่ออนาคต)
 * @param {string} appId
 */
const getApplicationDetail = (appId) => {
  return apiClient.get(`/applications/${appId}`);
};

/**
 * (Employer) อัปเดตสถานะใบสมัคร
 * @param {string} appId
 * @param {string} status ('REVIEWED', 'SHORTLISTED', 'REJECTED')
 */
const updateApplicationStatus = (appId, status) => {
  return apiClient.patch(`/applications/${appId}/status`, { status });
};

/**
 * (Employer) เพิ่มโน้ตภายใน
 * @param {string} appId
 * @param {string} content
 */
const addInternalNote = (appId, content) => {
  return apiClient.post(`/applications/${appId}/notes`, { content });
};

/**
 * (Employer) ให้คะแนนผู้สมัคร
 * @param {string} appId
 * @param {number} rating (1-5)
 */
const setApplicantRating = (appId, rating) => {
  return apiClient.post(`/applications/${appId}/rating`, { rating });
};

/**
 * (Employer) ลบใบสมัคร
 * @param {string} appId
 */
const deleteApplication = (appId) => {
  return apiClient.delete(`/applications/${appId}`);
};


// === Job Seeker (สำหรับผู้หางาน) ===

/**
 * (Job Seeker) ส่งใบสมัครใหม่
 * @param {object} data ({ jobId, coverLetter, resumeId })
 */
const submitApplication = (data) => {
  return apiClient.post('/applications', data);
};

/**
 * (Job Seeker) ดึงใบสมัครทั้งหมด "ของฉัน"
 */
const getMyApplications = () => {
  return apiClient.get('/applications/my');
};

// ส่งออกเป็น Object
export const applicationApi = {
  getApplicantsForJob,
  getApplicationDetail,
  updateApplicationStatus,
  submitApplication,
  getMyApplications,
  addInternalNote,
  setApplicantRating,
  deleteApplication,
};
