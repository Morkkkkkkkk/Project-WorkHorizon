import apiClient from './apiClient';

const handleResponse = (res) => res.data;

// ───────────────────────────────
// ฟังก์ชันสำหรับ Services API
// ───────────────────────────────

const create = (formData) =>
  apiClient.post('/services', formData, {headers: { 'Content-Type': 'multipart/form-data' },}).then(handleResponse);

const getMyServices = () => 
  apiClient.get('/services/me').then(handleResponse);

const getById = (id) => 
  apiClient.get(`/services/${id}`).then(handleResponse);

const update = (id, formData) =>
  apiClient.put(`/services/${id}`, formData, {headers: { 'Content-Type': 'multipart/form-data' },}).then(handleResponse);

const remove = (id) => 
  apiClient.delete(`/services/${id}`).then(handleResponse);

const search = (query, mainCategoryId) =>{
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (mainCategoryId) params.append('mainCategoryId', mainCategoryId);

  return apiClient.get(`/services?${params.toString()}`).then(handleResponse);
};

const getConversationByService = (serviceId) => {
    return apiClient.get(`/services/${serviceId}/conversation`).then(handleResponse);
};


// ───────────────────────────────
// Export แบบ Object 
// ───────────────────────────────
export const serviceApi = {
  create,
  getMyServices,
  update,
  delete: remove,
  search,
  getById,
  getConversationByService,
};
