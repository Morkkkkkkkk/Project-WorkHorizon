import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi.js';

/**
 * Controller สำหรับหน้า Admin (จัดการงาน)
 */
export const useAdminJobs = () => {
  const [data, setData] = useState({ jobs: [], totalPages: 1, currentPage: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // (ฟังก์ชันสำหรับดึงข้อมูล)
  const fetchJobs = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await adminApi.getAdminAllJobs(page);
      setData(result); // (result = { jobs, totalPages, currentPage })
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // (ดึงครั้งแรก)
  useEffect(() => {
    fetchJobs(1);
  }, [fetchJobs]);
  
  // (ฟังก์ชันสำหรับเปลี่ยนหน้า)
  const handlePageChange = (newPage) => {
    fetchJobs(newPage);
  };

  // (ฟังก์ชันสำหรับลบ)
  const deleteJob = async (jobId) => {
    await adminApi.adminDeleteJob(jobId);
    await fetchJobs(data.currentPage); // (Refresh)
  };
  
  // (ฟังก์ชันสำหรับอัปเดต - (ใช้ใน JobForm))
  const updateJob = async (jobId, jobData) => {
     await adminApi.adminUpdateJob(jobId, jobData);
     await fetchJobs(data.currentPage); // (Refresh)
  };
  
  return { 
    data, 
    isLoading, 
    error, 
    refreshJobs: fetchJobs, 
    deleteJob, 
    updateJob,
    handlePageChange,
  };
};