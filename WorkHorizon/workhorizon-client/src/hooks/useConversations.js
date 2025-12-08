import { useState, useEffect, useCallback } from "react";
import { conversationApi } from "../api/conversationApi";
import { useAuth } from "../contexts/AuthContext";

/**
 * Custom Hook สำหรับจัดการรายการ Conversations ทั้งหมดของ User
 * ใช้สำหรับแสดงใน Chat Dropdown ที่ Header
 *
 * @returns {object} { conversations, isLoading, error, refreshConversations, deleteConversation }
 */
export const useConversations = () => {
  const { isAuth } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันสำหรับดึงรายการ Conversations ทั้งหมด
  const fetchConversations = useCallback(async () => {
    // ถ้าไม่ได้ login ให้ล้างข้อมูลและไม่ต้อง fetch
    if (!isAuth) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // เรียก API เพื่อดึงรายการ Conversations
      const { data } = await conversationApi.getAllUserConversations();

      // Backend ควร return array ของ conversations
      // แต่ละ conversation ควรมี: { id, otherUser: {...}, lastMessage: {...}, updatedAt, ... }
      setConversations(data || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError(err);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuth]);

  // ฟังก์ชันสำหรับลบ Conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      await conversationApi.deleteConversation(conversationId);

      // อัปเดต UI ทันทีโดยลบออกจาก state
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      throw err; // ส่งต่อ error เพื่อให้ UI แสดง error message
    }
  };

  // ดึงข้อมูลครั้งแรกเมื่อ component mount หรือ isAuth เปลี่ยน
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    refreshConversations: fetchConversations,
    deleteConversation: handleDeleteConversation,
  };
};
