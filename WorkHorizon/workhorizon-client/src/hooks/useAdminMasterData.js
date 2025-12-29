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

      // ✅ เพิ่ม Helper function นี้เพื่อดึง Array ออกมาจาก Response ไม่ว่าจะมาท่าไหน
      const getArray = (res) => {
        // กรณี 1: Backend ส่ง Array มาตรงๆ [..., ...]
        if (Array.isArray(res.data)) return res.data;
        
        // กรณี 2: Backend ห่อด้วย data { data: [...] }
        if (res.data && Array.isArray(res.data.data)) return res.data.data;
        
        // กรณี 3: Backend ห่อด้วย items { items: [...] }
        if (res.data && Array.isArray(res.data.items)) return res.data.items;
        
        // กรณี 4: ห่อด้วย result { result: [...] }
        if (res.data && Array.isArray(res.data.result)) return res.data.result;

        // กันเหนียว: ถ้าหาไม่เจอให้คืน Array ว่าง
        return []; 
      };

      // ใช้ .then(getArray) แทน .then(res => res.data)
      const [mainCategories, subCategories, skills, jobTypes, industries, provinces, districts] = await Promise.all([
        apiClient.get('/main-categories').then(getArray),
        apiClient.get('/admin/sub-categories').then(getArray),
        apiClient.get('/admin/skills').then(getArray),
        apiClient.get('/admin/job-types').then(getArray),
        apiClient.get('/admin/industries').then(getArray),
        apiClient.get('/admin/provinces').then(getArray),
        apiClient.get('/admin/districts').then(getArray),
      ]);

      setData({ mainCategories, subCategories, skills, jobTypes, industries, provinces, districts });
    } catch (err) {
      console.error("Fetch Master Data Error:", err);
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
