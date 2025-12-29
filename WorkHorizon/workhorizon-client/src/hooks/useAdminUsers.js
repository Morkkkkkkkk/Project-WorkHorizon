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
    try {
      await adminApi.deleteUser(userId);
      await fetchUsers(); 
      return true; // ส่งค่ากลับว่าทำสำเร็จ
    } catch (err) {
      setError(err.message);
      return false;
    }
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
  
  const updateUserStatus = async (userId, status) => {
    try {
      await adminApi.updateUserStatus(userId, status);
      await fetchUsers(); // โหลดข้อมูลใหม่เพื่อให้หน้าเว็บอัปเดตทันที
      return true;
    } catch (err) {
      console.error(err);
      setError(err.message); // แสดง Error ถ้ามีปัญหา
      return false;
    }
  };

  return { users, isLoading, error, refreshUsers: fetchUsers, deleteUser, createUser, updateUser, updateUserStatus };
};