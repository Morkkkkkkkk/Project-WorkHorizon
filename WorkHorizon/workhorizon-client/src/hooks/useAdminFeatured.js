import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi.js'; 
import { masterDataApi } from '../api/masterDataApi.js'; // (เพิ่ม)

export const useAdminFeatured = () => {
  const [sections, setSections] = useState([]);
  const [mainCategories, setMainCategories] = useState([]); // (เพิ่ม)
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // (ดึง 2 อย่างพร้อมกัน)
      const [sectionsData, categoriesData] = await Promise.all([
         adminApi.featuredSection.getAll(),
         masterDataApi.getMainCategories()
      ]);

      setSections(sectionsData);
      setMainCategories(categoriesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createSection = async (payload) => {
    await adminApi.featuredSection.create(payload);
    await fetchData(); 
  };

  const updateSection = async (id, payload) => {
    await adminApi.featuredSection.update(id, payload);
    await fetchData();
  };

  const deleteSection = async (id) => {
    await adminApi.featuredSection.delete(id);
    await fetchData(); 
  };
  
  return { 
    sections, 
    mainCategories, // (ส่งหมวดหมู่ไปด้วย)
    isLoading, 
    error, 
    refreshSections: fetchData, 
    createSection, 
    updateSection, 
    deleteSection 
  };
};