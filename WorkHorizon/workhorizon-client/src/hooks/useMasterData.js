import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

// นี่คือ "Controller" สำหรับดึงข้อมูล Master Data
export const useMasterData = () => {
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ใช้ IIFE (Immediately Invoked Function Expression)
    (async () => {
      try {
        setIsLoading(true);
        
        // 1. ยิง API พร้อมกัน 3 เส้นทาง
        const [catRes, provRes, jobTypeRes] = await Promise.all([
          apiClient.get('/data/categories'),
          apiClient.get('/data/provinces'),
          apiClient.get('/data/job-types'),
        ]);

        // 2. เก็บข้อมูลลง State
        setCategories(catRes.data);
        setProvinces(provRes.data);
        setJobTypes(jobTypeRes.data);

      } catch (err) {
        console.error("โหลด Master Data ไม่สำเร็จ:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    })(); // <--- เรียกใช้ฟังก์ชันทันที
  }, []); // <--- ทำงานแค่ครั้งเดียวตอนเปิดหน้า

  // 3. ส่งข้อมูลและสถานะกลับไปให้ Page
  return { categories, provinces, jobTypes, isLoading, error };
};
