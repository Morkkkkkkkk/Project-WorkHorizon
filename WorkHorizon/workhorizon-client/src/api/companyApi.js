import apiClient from './apiClient';


// [NEW] Helper function เพื่อคืนค่า data โดยตรง
const handleResponse = (res) => res.data;
// === Public ===

/**
 * ดึงข้อมูลบริษัท (Public)
 * @param {string} companyId
 */
const getCompanyDetail = (companyId) => {
  return apiClient.get(`/companies/${companyId}`).then(handleResponse);
};

// === Employer ===

/**
 * (Employer) ดึงข้อมูลบริษัท "ของฉัน"
 */
const getMyCompany = () => {
  return apiClient.get('/companies/me');
};

/**
 * (Employer) สร้างโปรไฟล์บริษัท (ถ้ายังไม่มี)
 * @param {object} data ({ companyName, description, website, ... })
 */
const createCompany = (data) => {
  return apiClient.post('/companies', data);
};

/**
 * (Employer) อัปเดตโปรไฟล์บริษัท
 * @param {object} data ({ companyName, description, website, ... })
 */
const updateMyCompany = (data) => {
  return apiClient.put('/companies/me', data);
};

// (เพิ่ม) อัปเดต Logo (ใช้ FormData)
const uploadLogo = (formData) => {
  return apiClient.put('/companies/me/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


export const companyApi = {
  getCompanyDetail,
  getMyCompany,
  createCompany,
  updateMyCompany,
  uploadLogo, // (เราอาจจะต้องเพิ่ม Endpoint นี้ใน Backend)
};
