import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi.js'; 

/**
 * Controller สำหรับหน้า Admin (จัดการโฆษณา)
 */
export const useAdminAds = () => {
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // (ฟังก์ชันสำหรับดึงข้อมูล)
  const fetchAds = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getAdminAds(); // (ดึงทั้งหมด)
      setAds(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // (ดึงครั้งแรก)
  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // (ฟังก์ชันสำหรับสร้าง)
  const createAd = async (formData) => {
    await adminApi.createAd(formData);
    await fetchAds(); // (Refresh)
  };

  // (ฟังก์ชันสำหรับอัปเดต Text)
  const updateAd = async (adId, data) => {
    await adminApi.updateAd(adId, data);
    // (Refresh ถูกเรียกใน handleSubmit ของ Page แล้ว)
  };

  // (ฟังก์ชันสำหรับลบ)
  const deleteAd = async (adId) => {
    await adminApi.deleteAd(adId);
    await fetchAds(); // (Refresh)
  };
  
  return { ads, isLoading, error, refreshAds: fetchAds, createAd, updateAd, deleteAd };
};