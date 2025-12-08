// src/hooks/useMainCategories.js (ไฟล์ใหม่)

import { useState, useEffect, useCallback } from 'react';
import { masterDataApi } from '../api/masterDataApi.js'; // (API ที่เราอัปเดตแล้ว)

/**
 * Controller สำหรับดึง "หมวดหมู่หลัก (Public)"
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