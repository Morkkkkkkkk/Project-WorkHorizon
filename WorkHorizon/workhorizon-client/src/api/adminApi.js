import apiClient from "./apiClient";

// (Helper function เพื่อคืนค่า data โดยตรง)
const handleResponse = (res) => res.data;

// --- Advertisements (โฆษณา) ---

/**
 * (Admin) ดึงโฆษณาทั้งหมด (รวมที่ Draft)
 */
const getAdminAds = () => {
  return apiClient.get("/advertisements/admin").then(handleResponse);
};

/**
 * (Admin) สร้างโฆษณาใหม่ (ส่งเป็น FormData)
 * @param {FormData} formData (มี title, linkUrl, adImage)
 */
const createAd = (formData) => {
  return apiClient
    .post("/advertisements", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // (สำคัญ)
      },
    })
    .then(handleResponse);
};

/**
 * (Admin) อัปเดตข้อมูลโฆษณา (Text)
 * @param {string} adId
 * @param {object} data ({ title, linkUrl, isActive })
 */
const updateAd = (adId, data) => {
  return apiClient
    .put(`/advertisements/${adId}`, data)
    .then(handleResponse);
};

/**
 * (Admin) ลบโฆษณา
 * @param {string} adId
 */
const deleteAd = (adId) => {
  return apiClient.delete(`/admin/advertisements/${adId}`).then(handleResponse);
};

const updateAdImage = (adId, formData) => {
  return apiClient
    .post(`/advertisements/${adId}/image`, formData, {
      // headers content-type auto-detected
    })
    .then(handleResponse);
};

// --- Main Categories (หมวดหมู่หลัก) ---
/**
 * (Admin/Public) ดึงหมวดหมู่หลักทั้งหมด
 */
const getAdminMainCategories = () => {
  return apiClient.get("/main-categories").then(handleResponse);
};

/**
 * (Admin) สร้างหมวดหมู่หลัก (ส่งเป็น FormData)
 * @param {FormData} formData (มี name, image)
 */
const createMainCategory = (formData) => {
  return apiClient
    .post("/main-categories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then(handleResponse);
};

/**
 * (Admin) อัปเดตข้อมูลหมวดหมู่ (Text)
 * @param {string} catId
 * @param {object} data ({ name })
 */
const updateMainCategory = (catId, data) => {
  return apiClient
    .put(`/main-categories/${catId}`, data)
    .then(handleResponse);
};

/**
 * (Admin) อัปเดตรูปภาพหมวดหมู่
 * @param {string} catId
 * @param {FormData} formData (มี image)
 */
const updateMainCategoryImage = (catId, formData) => {
  return apiClient
    .post(`/main-categories/${catId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then(handleResponse);
};

/**
 * (Admin) ลบหมวดหมู่หลัก
 * @param {string} catId
 */
const deleteMainCategory = (catId) => {
  return apiClient.delete(`/main-categories/${catId}`).then(handleResponse);
};

/**
 * (Admin) ดึงบริษัทที่รออนุมัติ
 */
const getAdminCompanies = () => {
  return apiClient.get("/admin/companies").then(handleResponse);
};

/**
 * (Admin) อนุมัติ/ปฏิเสธ บริษัท
 * @param {string} companyId
 * @param {boolean} isVerified
 */
const verifyCompany = (companyId, isVerified) => {
  return apiClient
    .patch(`/admin/companies/${companyId}/verify`, { isVerified })
    .then(handleResponse);
};

// --- Users (ผู้ใช้งาน) ---

/**
 * (Admin) ดึงผู้ใช้ทั้งหมด
 */
const getAdminUsers = () => {
  return apiClient.get("/admin/users").then(handleResponse);
};

/**
 * (Admin) ลบผู้ใช้
 * @param {string} userId
 */
const deleteUser = (userId) => {
  return apiClient.delete(`/admin/users/${userId}`).then(handleResponse);
};

/**
 * (Admin) สร้างผู้ใช้ใหม่
 * @param {object} userData
 */
const adminCreateUser = (userData) => {
  return apiClient.post('/admin/users', userData).then(handleResponse);
};

/**
 * (Admin) แก้ไขผู้ใช้
 * @param {string} userId
 * @param {object} userData
 */
const adminUpdateUser = (userId, userData) => {
  return apiClient.put(`/admin/users/${userId}`, userData).then(handleResponse);
};

// ✅✅✅ (เพิ่มฟังก์ชันนี้) อัปเดตสถานะผู้ใช้ (Active/Suspend/Ban)
/**
 * (Admin) เปลี่ยนสถานะผู้ใช้
 * @param {string} userId 
 * @param {string} status ('ACTIVE' | 'SUSPENDED' | 'BANNED')
 */
const updateUserStatus = (userId, status) => {
  return apiClient.patch(`/admin/users/${userId}/status`, { status }).then(handleResponse);
};

/**
 * (Admin) ดึงข้อมูลสถิติสำหรับ Dashboard
 */
const getAdminStats = () => {
  return apiClient.get("/admin/stats").then(handleResponse);
};

// --- Jobs (งาน) ---
/**
 * (Admin) ดึงงานทั้งหมด (มี Pagination)
 * @param {number} page
 */
const getAdminAllJobs = (page = 1) => {
  return apiClient.get(`/admin/jobs?page=${page}&limit=10`).then(handleResponse);
};

/**
 * (Admin) แก้ไขงาน
 * @param {string} jobId
 * @param {object} jobData
 */
const adminUpdateJob = (jobId, jobData) => {
  return apiClient.put(`/admin/jobs/${jobId}`, jobData).then(handleResponse);
};

/**
 * (Admin) ลบงาน
 * @param {string} jobId
 */
const adminDeleteJob = (jobId) => {
  return apiClient.delete(`/admin/jobs/${jobId}`).then(handleResponse);
};

// --- Helper CRUD function สำหรับ Master Data ---
const createMasterDataCRUD = (endpoint) => ({
  create: (payload) => { 
    return apiClient
      .post(`/admin/${endpoint}`, payload) 
      .then(handleResponse);
  },
  update: (id, payload) => { 
    return apiClient
      .put(`/admin/${endpoint}/${id}`, payload) 
      .then(handleResponse);
  },
  delete: (id) => apiClient.delete(`/admin/${endpoint}/${id}`).then(handleResponse),
});

// --- สร้าง API สำหรับ Master Data ---
export const subCategoryApi = createMasterDataCRUD('sub-categories');
export const jobTypeApi = createMasterDataCRUD('job-types');
export const industryApi = createMasterDataCRUD('industries');
export const skillApi = createMasterDataCRUD('skills');
export const provinceApi = createMasterDataCRUD('provinces');
export const districtApi = createMasterDataCRUD('districts');

export const featuredSectionApi = {
  getAll: () => apiClient.get('/admin/featured-sections').then(handleResponse),
  create: (payload) => apiClient.post('/admin/featured-sections', payload).then(handleResponse),
  update: (id, payload) => apiClient.put(`/admin/featured-sections/${id}`, payload).then(handleResponse),
  delete: (id) => apiClient.delete(`/admin/featured-sections/${id}`).then(handleResponse),
};

// --- Withdrawals (การถอนเงิน) ---
/**
 * (Admin) ดึงรายการขอถอนเงินที่รอตรวจสอบ (PENDING)
 */
const getWithdrawalRequests = () => {
  return apiClient.get("/admin/withdrawals").then(handleResponse);
};

/**
 * (Admin) อนุมัติหรือปฏิเสธการถอนเงิน
 * @param {string} transactionId 
 * @param {string} action ('APPROVE' | 'REJECT')
 */
const approveWithdrawal = (transactionId, action) => {
  return apiClient.patch(`/admin/transactions/${transactionId}/withdraw`, { action }).then(handleResponse);
};

// ส่งออก
export const adminApi = {

  // Ads
  getAdminAds,
  createAd,
  updateAd,
  deleteAd,
  updateAdImage,

  // MainCategory
  mainCategory: {
    getAll: getAdminMainCategories,
    create: createMainCategory,
    update: updateMainCategory,
    updateImage: updateMainCategoryImage,
    delete: deleteMainCategory,
  },

  // Companies
  getAdminCompanies,
  verifyCompany,

  // Users
  getAdminUsers,
  deleteUser,
  adminCreateUser, 
  adminUpdateUser,
  updateUserStatus, // ✅✅✅ อย่าลืมเพิ่มตรงนี้ด้วย เพื่อส่งออกไปใช้งาน

  // Jobs 
  getAdminAllJobs,
  adminUpdateJob,
  adminDeleteJob,

  // Master Data
  subCategory: subCategoryApi,
  jobType: jobTypeApi,
  industry: industryApi,
  skill: skillApi,
  province: provinceApi,
  district: districtApi,
  
  // Stats
  getAdminStats,

  featuredSection: featuredSectionApi,

  getWithdrawalRequests,
  approveWithdrawal,
};