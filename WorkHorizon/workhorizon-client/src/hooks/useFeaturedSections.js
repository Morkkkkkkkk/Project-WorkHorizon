import { useState, useEffect, useCallback } from 'react';
import { featuredSectionApi } from '../api/featuredSectionApi.js';

export const useFeaturedSections = () => {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSections = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await featuredSectionApi.getFeaturedSections();
      setSections(data || []);
    } catch (err) {
      console.error("โหลด Featured Sections ไม่สำเร็จ:", err);
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return { sections, isLoadingSections: isLoading };
};