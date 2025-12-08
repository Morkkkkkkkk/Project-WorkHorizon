import { useState, useEffect, useCallback } from 'react';
import { applicationApi } from '../api/applicationApi';

// นี่คือ "Controller" สำหรับดึงใบสมัคร "ของฉัน"
export const useMyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. สร้างฟังก์ชันสำหรับดึงข้อมูล
  const fetchMyApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data } = await applicationApi.getMyApplications();
      setApplications(data);

    } catch (err) {
      console.error("โหลดใบสมัครของฉันไม่สำเร็จ:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. เรียกใช้ตอนเปิดหน้าครั้งแรก
  useEffect(() => {
    fetchMyApplications();
  }, [fetchMyApplications]);

  // 3. ส่งข้อมูลและฟังก์ชัน (สำหรับ Refresh) กลับไป
  return { applications, isLoading, error, refreshApplications: fetchMyApplications };
};
