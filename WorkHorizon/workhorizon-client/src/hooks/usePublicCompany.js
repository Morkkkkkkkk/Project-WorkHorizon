import { useState, useEffect, useCallback } from 'react';
import { companyApi } from '../api/companyApi.js'; // (API ที่เรามีอยู่แล้ว)

/**
 * Controller สำหรับดึงข้อมูลบริษัท (Public) 1 แห่ง
 * @param {string} companyId
 */
export const usePublicCompany = (companyId) => {
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // (ฟังก์ชันสำหรับดึงข้อมูล)
  const fetchCompany = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await companyApi.getCompanyDetail(companyId);
      setCompany(data);

    } catch (err) {
      console.error("โหลดข้อมูลบริษัท (Public) ไม่สำเร็จ:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  // (ดึงครั้งแรก)
  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  return { company, isLoading, error, refreshCompany: fetchCompany };
};