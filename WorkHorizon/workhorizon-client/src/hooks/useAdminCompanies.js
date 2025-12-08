import { useState, useEffect, useCallback } from "react";
import { adminApi } from "../api/adminApi.js"; // (ไฟล์ที่เราเพิ่งสร้าง)
import { toast } from "react-toastify";

/**
 * Controller สำหรับหน้า Admin (จัดการบริษัท)
 */
export const useAdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // (ฟังก์ชันสำหรับดึงข้อมูล)
  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getAdminCompanies(); // (ดึงบริษัททั้งหมด)
      setCompanies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // (ดึงครั้งแรก)
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // (ฟังก์ชันสำหรับอัปเดตสถานะ)
  const toggleVerification = async (companyId, isVerified) => {
    try {
      await adminApi.verifyCompany(companyId, isVerified);
      // (อัปเดต State ทันที)
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, isVerified } : c))
      );
      toast.success("อัปเดตสถานะบริษัทเรียบร้อยแล้ว");
    } catch (err) {
      toast.error("อัปเดตสถานะไม่สำเร็จ: " + err.message);
    }
  };

  return {
    companies,
    isLoading,
    error,
    refreshCompanies: fetchCompanies,
    toggleVerification,
  };
};
