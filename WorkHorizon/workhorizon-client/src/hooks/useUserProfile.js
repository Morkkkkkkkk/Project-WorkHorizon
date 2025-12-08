import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../api/userApi';


// นี่คือ "Controller" สำหรับดึงข้อมูล Profile
// (อัปเดต: เพิ่ม enabled parameter)
export const useUserProfile = (enabled = true) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled); // (ถ้าไม่ enabled ก็ไม่ต้องเริ่ม loading)
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    // (อัปเดต: เช็ก)
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data } = await userApi.getProfile();
      setProfile(data);

    } catch (err) {
      console.error("โหลดโปรไฟล์ไม่สำเร็จ:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]); // (อัปเดต: เพิ่ม enabled)

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, error, refreshProfile: fetchProfile };
};