import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi.js';

/**
 * Controller สำหรับหน้า Admin Dashboard
 */
export const useAdminStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // (ฟังก์ชันสำหรับดึงข้อมูล)
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // (ดึงครั้งแรก)
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refreshStats: fetchStats };
};