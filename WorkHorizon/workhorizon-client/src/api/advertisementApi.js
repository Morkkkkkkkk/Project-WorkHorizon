import apiClient from './apiClient';

// (Helper function เพื่อคืนค่า data โดยตรง)
const handleResponse = (res) => res.data;

/**
 * (Public) ดึงโฆษณาทั้งหมดที่ Active (กรองตามขนาดได้)
 * @param {string} size ('LARGE_SLIDE' หรือ 'SMALL_BANNER')
 */
const getPublicAds = (size) => {
  const query = size ? `?size=${size}` : '';
  return apiClient.get(`/advertisements${query}`).then(handleResponse);
};

export const advertisementApi = {
  getPublicAds,
};