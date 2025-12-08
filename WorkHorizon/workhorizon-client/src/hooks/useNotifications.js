import { useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from '../contexts/AuthContext';

// (Hook นี้จะทำงานเมื่อ User ล็อกอิน)
export const useNotifications = () => {
  const { isAuth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 1. ฟังก์ชันสำหรับดึงข้อมูล (ใช้ useCallback)
  const fetchNotifications = useCallback(async () => {
    if (!isAuth) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }
    
    try {
      const data = await notificationApi.getMyNotifications();
      setNotifications(data);
      // (นับจำนวนที่ยังไม่อ่าน)
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("โหลดการแจ้งเตือนไม่สำเร็จ:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuth]); // (ทำงานใหม่เมื่อสถานะ Auth เปลี่ยน)

  // 2. (Effect 1) ดึงข้อมูลครั้งแรก
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // 3. (Effect 2) Polling - ดึงข้อมูลใหม่ทุก 30 วินาที
  useEffect(() => {
    if (!isAuth) return; // (ถ้าไม่ล็อกอิน ไม่ต้องทำ)

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 วินาที

    // (Cleanup)
    return () => clearInterval(interval);
  }, [isAuth, fetchNotifications]);

  // 4. ฟังก์ชันสำหรับ "อ่าน 1 รายการ" (Optimistic Update)
  const markOneAsRead = async (notificationId) => {
    // (อัปเดต UI ทันที)
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    
    // (ยิง API เบื้องหลัง)
    try {
      await notificationApi.markAsRead(notificationId);
    } catch (err) {
      console.error("Mark as read (single) failed:", err);
      // (ถ้าล้มเหลว, ดึงข้อมูลใหม่เพื่อ Rollback)
      fetchNotifications();
    }
  };

  // 5. ฟังก์ชันสำหรับ "อ่านทั้งหมด"
  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    
    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      console.error("Mark all as read failed:", err);
      fetchNotifications();
    }
  };

  // 6. ฟังก์ชันสำหรับ "ลบ 1 รายการ" (Optimistic Update)
  const deleteNotification = async (notificationId) => {
    // (หาข้อมูลก่อนลบ เพื่อใช้ Rollback และอัปเดต unreadCount)
    const notificationToRemove = notifications.find(n => n.id === notificationId);
    
    // (อัปเดต UI ทันที)
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notificationToRemove && !notificationToRemove.isRead) {
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
    }

    // (ยิง API เบื้องหลัง)
    try {
      await notificationApi.deleteNotification(notificationId);
    } catch (err) {
      console.error("Delete notification failed:", err);
      // (ถ้าล้มเหลว, ดึงข้อมูลใหม่เพื่อ Rollback)
      fetchNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markOneAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
