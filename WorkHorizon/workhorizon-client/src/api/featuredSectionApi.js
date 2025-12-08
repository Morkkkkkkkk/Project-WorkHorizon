import apiClient from './apiClient';
const handleResponse = (res) => res.data;

export const featuredSectionApi = {
  getFeaturedSections: () => {
    return apiClient.get('/featured-sections').then(handleResponse);
  },
};