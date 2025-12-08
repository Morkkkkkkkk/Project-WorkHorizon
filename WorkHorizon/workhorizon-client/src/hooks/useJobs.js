import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

// นี่คือ "Controller" สำหรับดึงข้อมูล Jobs
// (มันจะรับ `filters` มาจาก HomePage)
export const useJobs = (filters) => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 1. กรองค่าว่างออกจาก filters ก่อนส่ง
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v != null && v !== '')
        );

        // 2. สร้าง Query String (เช่น ?q=dev&categoryId=123)
        const queryParams = new URLSearchParams(cleanFilters).toString();
      //console.log("Fetching jobs with params:", queryParams);
        
        // 3. ยิง API
        const { data } = await apiClient.get(`/jobs?${queryParams}`);
        // เก็บข้อมูลและ Pagination
        setJobs(data.jobs || []);
        setPagination({
            currentPage: data.currentPage || 1,
            totalPages: data.totalPages || 1,
            totalCount: data.totalJobs || (data.jobs ? data.jobs.length : 0), // อาจต้องปรับ Backend ให้ส่ง totalJobs มาด้วย
        });

      } catch (err) {
         console.error("โหลด Jobs ไม่สำเร็จ:", err);
         setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    //  (Debounce) หน่วงเวลาการค้นหา 500ms
    // เพื่อไม่ให้ยิง API ทุกครั้งที่พิมพ์
    const timer = setTimeout(() => {
      fetchJobs();
    }, 500);

    //  Cleanup: ถ้า user พิมพ์ใหม่ ให้ยกเลิก timer เก่า
    return () => clearTimeout(timer);

  }, [filters]); // <--- ทำงานใหม่ทุกครั้งที่ `filters` เปลี่ยน

  // 6. ส่งข้อมูลกลับไปให้ Page
  return { jobs, isLoading, error, ...pagination };
};
