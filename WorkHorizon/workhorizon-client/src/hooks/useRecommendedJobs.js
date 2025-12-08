import { useState, useEffect, useCallback } from 'react';
import { userApi } from '../api/userApi';

/**
 * Controller สำหรับดึง "งานที่แนะนำ"
 * @param {boolean} enabled - (จะทำงานก็ต่อเมื่อเป็น Job Seeker)
 */
export const useRecommendedJobs = (enabled = false) => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);

  const fetchJobs = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await userApi.getRecommendedJobs();
      setJobs(data);
    } catch (err) {
      console.error("โหลดงานแนะนำไม่สำเร็จ:", err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { recommendedJobs: jobs, isLoadingRecs: isLoading, refreshRecommended: fetchJobs };
};