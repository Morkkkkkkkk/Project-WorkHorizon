// src/api/freelancerApi.js
import apiClient from "./apiClient";

const handleResponse = (res) => res.data;

// ดึงข้อมูลส่วนตัว (Private)
const getMyProfile = () => {
  return apiClient.get("/freelancers/me").then(handleResponse);
};

// อัปเดตข้อมูลส่วนตัว (Private)
const updateMyProfile = (data) => {
  // data = { professionalTitle, bio, hourlyRate, portfolioUrl, yearsOfExperience }
  return apiClient.put("/freelancers/me", data).then(handleResponse);
};

// อัปโหลดรูปโปรไฟล์ (Private)
const uploadProfilePicture = (formData) => {
  return apiClient
    .put("/freelancers/me/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then(handleResponse);
};

// ดึงข้อมูลสาธารณะ (Public)
const getPublicProfile = (freelancerId) => {
  return apiClient.get(`/freelancers/${freelancerId}`).then(handleResponse);
};

// ✅ เพิ่ม: Freelancer สร้างใบเสนอราคา (Offer)
const createOffer = (data) => {
  // data = { jobSeekerId, jobTitle, description, price, duration }
  return apiClient.post("/freelancers/work", data).then(handleResponse);
};

// ✅ เพิ่ม: อัปเดตสถานะงาน
const updateWorkStatus = (workId, status) => {
  return apiClient
    .put(`/freelancers/work/${workId}/status`, { status })
    .then(handleResponse);
};

// ✅ เพิ่ม: ลบงาน
const deleteWork = (workId) => {
  return apiClient.delete(`/freelancers/work/${workId}`).then(handleResponse);
};

// ✅ เพิ่ม: Job Seeker ส่งรีวิว
const submitReview = (freelancerId, data) => {
  // data = { workId, rating, comment }
  return apiClient
    .post(`/freelancers/${freelancerId}/reviews`, data)
    .then(handleResponse);
};

// ✅ เพิ่ม: ดึงงานที่ Job Seeker จ้าง (My Hires)
const getMyHires = () => {
  return apiClient.get("/freelancers/hires").then(handleResponse);
};

export const freelancerApi = {
  getMyProfile,
  updateMyProfile,
  uploadProfilePicture,
  getPublicProfile,
  createOffer,
  updateWorkStatus,
  deleteWork,
  submitReview,
  getMyHires,
};
