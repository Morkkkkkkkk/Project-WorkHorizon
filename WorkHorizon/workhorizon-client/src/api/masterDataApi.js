import apiClient from './apiClient';

// (Helper function เพื่อคืนค่า data โดยตรง)
const handleResponse = (res) => res.data;

/**
 * (เพิ่ม) ดึง "หมวดหมู่หลัก"
 */
const getMainCategories = (query = '') => {
  return apiClient.get(`/main-categories?q=${query}`).then(handleResponse);
};

/**
 * (เพิ่ม) ดึง "หมวดหมู่ย่อย" (ต้องมี mainCategoryId)
 */
const getSubCategories = (mainCategoryId, query = '') => {
  if (!mainCategoryId) return Promise.resolve([]); // ถ้าไม่มีแม่, ไม่ต้องค้นหา
  return apiClient.get(`/data/main-categories/${mainCategoryId}/sub-categories?q=${query}`).then(handleResponse);
};

/**
 * ดึง "ประเภทงาน" ทั้งหมด
 */
const getJobTypes = (query = '') => {
  return apiClient.get(`/data/job-types?q=${query}`).then(handleResponse);
};

/**
 * ดึง "อุตสาหกรรม" ทั้งหมด
 */
const getIndustries = (query = '') => {
  return apiClient.get(`/data/industries?q=${query}`).then(handleResponse);
};

/**
 * ดึง "ทักษะ" ทั้งหมด (รองรับการค้นหา)
 */
const getSkills = (query = '') => {
  return apiClient.get(`/data/skills?q=${query}`).then(handleResponse);
};

/**
 * ดึง "จังหวัด" ทั้งหมด
 */
const getProvinces = (query = '') => {
  return apiClient.get(`/data/provinces?q=${query}`).then(handleResponse);
};

/**
 * ดึง "อำเภอ" จาก "จังหวัด"
 */
const getDistricts = (provinceId, query = '') => {
  return apiClient.get(`/data/provinces/${provinceId}/districts?q=${query}`).then(handleResponse);
};

// ส่งออกเป็น Object
export const masterDataApi = {
  getMainCategories,
  getSubCategories,
  getJobTypes,
  getIndustries,
  getSkills,
  getProvinces,
  getDistricts,
};
