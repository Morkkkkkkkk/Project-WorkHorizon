import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

// นี่คือ "Controller" สำหรับดึงข้อมูล Job 1 ชิ้น
export const useJobDetail = (jobId) => {
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. ตรวจสอบว่ามี jobId ไหม
    if (!jobId) {
      setIsLoading(false);
      setError(new Error("No Job ID provided"));
      return;
    }

    const fetchJob = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 2. ยิง API ไปที่ /api/jobs/:jobId
        const { data } = await apiClient.get(`/jobs/${jobId}`);
        setJob(data);

      } catch (err) {
        console.error(`โหลด Job (ID: ${jobId}) ไม่สำเร็จ:`, err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]); // <--- ทำงานใหม่ทุกครั้งที่ `jobId` เปลี่ยน

  // 3. ส่งข้อมูลกลับไปให้ Page
  return { job, isLoading, error };
};
