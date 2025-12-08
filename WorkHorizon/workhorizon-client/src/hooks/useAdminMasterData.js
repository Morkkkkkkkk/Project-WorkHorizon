import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

// Mapping endpoints
const endpoints = {
  subCategory: 'sub-categories',
  skill: 'skills',
  jobType: 'job-types',
  industry: 'industries',
  province: 'provinces',
  district: 'districts',
};

export const useAdminMasterData = () => {
  const [data, setData] = useState({
    mainCategories: [],
    subCategories: [],
    skills: [],
    jobTypes: [],
    industries: [],
    provinces: [],
    districts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [mainCategories, subCategories, skills, jobTypes, industries, provinces, districts] = await Promise.all([
        apiClient.get('/main-categories').then(res => res.data),
        apiClient.get('/admin/sub-categories').then(res => res.data),
        apiClient.get('/admin/skills').then(res => res.data),
        apiClient.get('/admin/job-types').then(res => res.data),
        apiClient.get('/admin/industries').then(res => res.data),
        apiClient.get('/admin/provinces').then(res => res.data),
        apiClient.get('/admin/districts').then(res => res.data),
      ]);

      setData({ mainCategories, subCategories, skills, jobTypes, industries, provinces, districts });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createItem = async (modelName, payload) => {
    const res = await apiClient.post(`/admin/${endpoints[modelName]}`, payload);
    await fetchData();
    return res.data;
  };

  const updateItem = async (modelName, id, payload) => {
    const res = await apiClient.put(`/admin/${endpoints[modelName]}/${id}`, payload);
    await fetchData();
    return res.data;
  };

  const deleteItem = async (modelName, id) => {
    const res = await apiClient.delete(`/admin/${endpoints[modelName]}/${id}`);
    await fetchData();
    return res.data;
  };

  return { data, isLoading, error, createItem, updateItem, deleteItem };
};
