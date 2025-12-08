import apiClient from './apiClient';

// (Helper function เพื่อคืนค่า data โดยตรง)
const handleResponse = (res) => res.data;

/**
 * (Public) ส่งคำขอลืมรหัสผ่าน
 * @param {string} email
 */
const forgotPassword = (email) => {
  return apiClient.post('/auth/forgot-password', { email }).then(handleResponse);
};

/**
 * (Public) ตั้งรหัสผ่านใหม่
 * @param {string} token - (Token ที่ได้จาก URL)
 * @param {string} password - รหัสผ่านใหม่
 */
const resetPassword = (token, password) => {
  return apiClient.post('/auth/reset-password', { token, password }).then(handleResponse);
};

export const authApi = {
  forgotPassword,
  resetPassword,
};
