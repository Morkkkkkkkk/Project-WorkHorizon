import { useState, useEffect, useCallback } from 'react';
import { jobApi } from '../api/jobApi'; // 1. Import API ใหม่

// นี่คือ "Controller" สำหรับดึงงานของ Employer
export const useEmployerJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. สร้างฟังก์ชันสำหรับดึงข้อมูล
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const  data  = await jobApi.getMyJobs();
      setJobs(data);

    } catch (err) {
      console.error("โหลดงานของ Employer ไม่สำเร็จ:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 3. เรียกใช้ตอนเปิดหน้าครั้งแรก
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // 4. ส่งข้อมูลและฟังก์ชัน (สำหรับ Refresh) กลับไป
  return { jobs, isLoading, error, refreshJobs: fetchJobs };
};
