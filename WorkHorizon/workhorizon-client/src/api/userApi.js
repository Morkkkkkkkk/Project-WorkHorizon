import apiClient from "./apiClient";

// 1. ดึงโปรไฟล์เชิงลึก (รวม educations, experiences, skills, resumes)
const getProfile = () => {
  return apiClient.get("/users/me");
};

// 2. อัปเดตข้อมูลพื้นฐาน (bio, name, phone)
const updateProfile = (data) => {
  // data = { firstName, lastName, phone, bio, profileImageUrl }
  return apiClient.put("/users/me", data);
};

// --- Education ---
// 3. (เพิ่ม) อัปโหลดรูปโปรไฟล์
const uploadProfileImage = (formData) => {
  return apiClient.put("/users/me/profile-picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const addEducation = (data) => {
  // data = { institute, degree, fieldOfStudy, startDate, endDate }
  return apiClient.post("/users/me/educations", data);
};

const updateEducation = (eduId, data) => {
  return apiClient.put(`/users/me/educations/${eduId}`, data);
};

const deleteEducation = (eduId) => {
  return apiClient.delete(`/users/me/educations/${eduId}`);
};

// --- Experience ---
const addExperience = (data) => {
  // data = { title, company, description, startDate, endDate }
  return apiClient.post("/users/me/experiences", data);
};

const updateExperience = (expId, data) => {
  return apiClient.put(`/users/me/experiences/${expId}`, data);
};

const deleteExperience = (expId) => {
  return apiClient.delete(`/users/me/experiences/${expId}`);
};

// --- Skills ---
const updateSkills = (skillsData) => {
  // skillsData คือ array ของ object [{name: '...'}, {name: '...'}]
  return apiClient.put("/users/me/skills", { skills: skillsData });
};

// --- Resumes ---
const uploadResume = (formData) => {
  // (นี่คือ FormData ไม่ใช่ JSON)
  // ต้องตั้งค่า Header ใน apiClient ให้รองรับ multipart/form-data
  return apiClient.post("/users/me/resumes/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const deleteResume = (resumeId) => {
  return apiClient.delete(`/users/me/resumes/${resumeId}`);
};

// --- Saved Jobs ---
const getMySavedJobs = () => {
  return apiClient.get("/users/me/saved-jobs");
};

const addSavedJob = (jobId) => {
  return apiClient.post("/users/me/saved-jobs", { jobId });
};

const deleteSavedJob = (jobId) => {
  return apiClient.delete(`/users/me/saved-jobs/${jobId}`);
};

const getRecommendedJobs = () => {
  return apiClient.get("/users/me/recommendations");
};

/**
 * (User) เปลี่ยนรหัสผ่านของตัวเอง
 * @param {string} oldPassword
 * @param {string} newPassword
 */
const changePassword = (oldPassword, newPassword) => {
  return apiClient.post("/users/me/change-password", {
    oldPassword,
    newPassword,
  });
};

// ส่งออกเป็น Object
export const userApi = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  updateSkills,
  uploadResume,
  deleteResume,
  getMySavedJobs,
  addSavedJob,
  deleteSavedJob,
  getRecommendedJobs,
  changePassword,
};
