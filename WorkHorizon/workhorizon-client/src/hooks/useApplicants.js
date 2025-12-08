import { useState, useEffect, useCallback } from "react";
import { applicationApi } from "../api/applicationApi"; // 1. Import API

/**
 * Controller สำหรับดึง "ใบสมัคร" ของงาน 1 ชิ้น
 * @param {string} jobId
 */
export const useApplicants = (jobId) => {
  const [data, setData] = useState({ job: null, applications: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. สร้างฟังก์ชันสำหรับดึงข้อมูล
  const fetchApplicants = useCallback(async () => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    try {
      // setIsLoading(true);
      setError(null);

      // 3. (Backend Endpoint นี้จะ trả về ข้อมูล Job และ Applications)
      const { data } = await applicationApi.getApplicantsForJob(jobId);
      setData(data); // data = { job: {...}, applications: [...] }

    } catch (err) {
      console.error("โหลดใบสมัครไม่สำเร็จ:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]); // <--- ทำงานใหม่เมื่อ jobId เปลี่ยน

  // 3.  แยก useEffect สำหรับโหลดครั้งแรก
  useEffect(() => {
    setIsLoading(true); 
    fetchApplicants();
  }, [fetchApplicants]);

  // 4. เรียกใช้ตอนเปิดหน้าครั้งแรก
  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  //  ฟังก์ชันสำหรับอัปเดตข้อมูลใน State ทันที
  // (เพื่อให้ UI ตอบสนองเร็ว)
  const updateApplicantData = (appId, field, newData) => {
    setData(prev => ({
      ...prev,
      applications: prev.applications.map(app => {
        if (app.id === appId) {
          if (field === 'rating') {
            return { ...app, ratings: [newData] }; // (สมมติว่ามีเรตติ้งเดียว)
          }
          if (field === 'note') {
            return { ...app, internalNotes: [newData, ...app.internalNotes] };
          }
        }
        return app;
      })
    }));
  };

  // 5. ส่งข้อมูลและฟังก์ชัน (สำหรับ Refresh) กลับไป
  return {
    job: data.job,
    applications: data.applications,
    isLoading,
    error,
    refreshApplicants: fetchApplicants,
    updateApplicantData, 
  };
};
