// src/hooks/useAdminMainCategories.js (ไฟล์ใหม่)

import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi.js'; 

/**
 * Controller สำหรับหน้า Admin (จัดการหมวดหมู่หลัก)
 */
export const useAdminMainCategories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // (ฟังก์ชันสำหรับดึงข้อมูล)
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // (เรียก API ใหม่ที่เราจะสร้างใน adminApi)
      const data = await adminApi.mainCategory.getAll(); 
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // (ดึงครั้งแรก)
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // (ฟังก์ชันสำหรับสร้าง)
  const createCategory = async (formData) => {
    await adminApi.mainCategory.create(formData);
    await fetchCategories(); // (Refresh)
  };

  // (ฟังก์ชันสำหรับอัปเดต Text)
  const updateCategory = async (id, data) => {
    await adminApi.mainCategory.update(id, data);
    // (Refresh ถูกเรียกใน handleSubmit ของ Page แล้ว)
  };

  // (ฟังก์ชันสำหรับลบ)
  const deleteCategory = async (id) => {
    await adminApi.mainCategory.delete(id);
    await fetchCategories(); // (Refresh)
  };
  
  return { 
    categories, 
    isLoading, 
    error, 
    refreshCategories: fetchCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
  };
};