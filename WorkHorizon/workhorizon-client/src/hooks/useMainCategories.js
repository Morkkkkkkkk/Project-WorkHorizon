// workhorizon-client/src/hooks/useMainCategories.js

import { useState, useEffect, useCallback } from 'react';
import { masterDataApi } from '../api/masterDataApi.js';

/**
 * Hook สำหรับดึงข้อมูล "หมวดหมู่หลัก" สำหรับหน้าบ้าน (Public)
 */
export const useMainCategories = () => {
  const [mainCategories, setMainCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMainCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await masterDataApi.getMainCategories();
      setMainCategories(data || []);
    } catch (err) {
      console.error("โหลดหมวดหมู่หลักไม่สำเร็จ:", err);
      setMainCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMainCategories();
  }, [fetchMainCategories]);

  return { mainCategories, isLoadingMainCats: isLoading };
};