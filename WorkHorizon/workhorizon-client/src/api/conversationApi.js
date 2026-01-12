import apiClient from './apiClient';

const handleResponse = (res) => res.data;

// ดึงรายการแชททั้งหมด (รวมทั้ง Service และ Job Application)
const getMyConversations = () => 
  apiClient.get('/conversations').then(handleResponse);

// ดึงรายละเอียดแชทและข้อความ
const getById = (id) => 
  apiClient.get(`/conversations/${id}`).then(handleResponse);

// ส่งข้อความ
const sendMessage = (id, content, type = 'SERVICE') => 
  apiClient.post(`/conversations/${id}/messages`, { content, type }).then(handleResponse);

// (Optional) อ่านแล้ว
const markAsRead = (id) => 
  apiClient.put(`/conversations/${id}/read`).then(handleResponse);

export const conversationApi = {
  getMyConversations,
  getById,
  sendMessage,
  markAsRead
};