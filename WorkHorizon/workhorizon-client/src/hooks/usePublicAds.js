import { useState, useEffect, useCallback } from 'react';
import { advertisementApi } from '../api/advertisementApi.js';

/**
 * Controller สำหรับดึง "โฆษณา (Public)"
 */
export const usePublicAds = (size) => {
  const [ads, setAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAds = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await advertisementApi.getPublicAds(size);
      setAds(data || []);
    } catch (err) {
      console.error("โหลดโฆษณาไม่สำเร็จ:", err);
      setAds([]);
    } finally {
      setIsLoading(false);
    }
  }, [size]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return { ads, isLoadingAds: isLoading };
};