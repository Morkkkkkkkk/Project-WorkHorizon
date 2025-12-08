import { useState, useEffect, useCallback } from "react";
import { userApi } from "../api/userApi.js";
import { useAuth } from "../contexts/AuthContext";

/**
 * Controller สำหรับดึง "งานที่บันทึกไว้"
 */
export const useMySavedJobs = () => {
  const { isAuth, isJobSeeker, isFreelancer } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // (ฟังก์ชันสำหรับดึงข้อมูล)
  const fetchSavedJobs = useCallback(async () => {
    // ✅ Check authentication and role before fetching
    if (!isAuth || (!isJobSeeker && !isFreelancer)) {
      setSavedJobs([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await userApi.getMySavedJobs();
      // Handle both array and object response formats
      // If response.data is array -> use it
      // If response.data.savedJobs is array -> use it
      // Else empty array
      const jobs = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.savedJobs)
        ? response.data.savedJobs
        : [];

      setSavedJobs(jobs);
    } catch (err) {
      console.error("โหลดงานที่บันทึกไว้ไม่สำเร็จ:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuth, isJobSeeker, isFreelancer]);

  // (เรียกใช้ตอนเปิดหน้าครั้งแรก)
  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  return { savedJobs, isLoading, error, refreshSavedJobs: fetchSavedJobs };
};
