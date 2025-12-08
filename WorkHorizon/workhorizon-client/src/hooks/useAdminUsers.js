import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../api/adminApi.js';

/**
 * Controller สำหรับหน้า Admin (จัดการผู้ใช้)
 */
export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // (ฟังก์ชันสำหรับดึงข้อมูล)
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminApi.getAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // (ดึงครั้งแรก)
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // (ฟังก์ชันสำหรับลบ)
  const deleteUser = async (userId) => {
    await adminApi.deleteUser(userId);
    await fetchUsers(); // (Refresh)
  };
  
  // --- (เพิ่มฟังก์ชันใหม่สำหรับสร้างและแก้ไขผู้ใช้) ---
  // (ฟังก์ชันสำหรับสร้าง)
  const createUser = async (userData) => {
    await adminApi.adminCreateUser(userData);
    await fetchUsers(); // (Refresh)
  };

  // (ฟังก์ชันสำหรับอัปเดต)
  const updateUser = async (userId, userData) => {
    await adminApi.adminUpdateUser(userId, userData);
    await fetchUsers(); // (Refresh)
  };
  // --- (จบส่วนเพิ่มใหม่) ---

  return { users, isLoading, error, refreshUsers: fetchUsers, deleteUser, createUser, updateUser };
};