import apiClient from './apiClient';

// (Helper function เพื่อคืนค่า data โดยตรง)
const handleResponse = (res) => res.data;

/**
 * (User) ดึงการแจ้งเตือนทั้งหมดของฉัน
 */
const getMyNotifications = () => {
  return apiClient.get('/notifications').then(handleResponse);
};

/**
 * (User) ทำเครื่องหมายว่าอ่านแล้ว 1 รายการ
 * @param {string} notificationId
 */
const markAsRead = (notificationId) => {
  return apiClient.patch(`/notifications/${notificationId}/read`).then(handleResponse);
};

/**
 * (User) ทำเครื่องหมายว่าอ่านทั้งหมดแล้ว
 */
const markAllAsRead = () => {
  return apiClient.post('/notifications/read-all').then(handleResponse);
};

/**
 * (User) ลบการแจ้งเตือน 1 รายการ
 * @param {string} notificationId
 */
const deleteNotification = (notificationId) => {
  return apiClient.delete(`/notifications/${notificationId}`).then(handleResponse);
};

export const notificationApi = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
