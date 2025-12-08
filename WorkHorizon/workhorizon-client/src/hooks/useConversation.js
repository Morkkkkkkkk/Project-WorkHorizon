import { useState, useEffect, useCallback } from 'react';
import { conversationApi } from '../api/conversationApi';

// Controller สำหรับห้องแชท
export const useConversation = (conversationId) => {
  // data = { conversation: {...}, messages: [...] }
  const [data, setData] = useState({ conversation: null, messages: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setIsLoading(false);
      return;
    }
    try {
      // (ไม่ตั้งค่า loading เมื่อ refresh)
      setError(null);
      
      const { data } = await conversationApi.getMessages(conversationId);
      // (Backend ควรส่ง { conversation, messages })
      setData(data); 

    } catch (err) {
      console.error("โหลดข้อความไม่สำเร็จ:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // (โหลดครั้งแรก)
  useEffect(() => {
    setIsLoading(true);
    fetchMessages();
  }, [fetchMessages]);
  
  // (ฟังก์ชันสำหรับส่งข้อความ)
  const sendMessage = async (content) => {
    if (!content.trim()) return;
    
    try {
      // (ยิง API)
      const { data: newMessage } = await conversationApi.sendMessage(conversationId, { content });
      
      // (เพิ่มข้อความใหม่ vào state ทันที)
      setData(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));
      
    } catch (err) {
      console.error("ส่งข้อความไม่สำเร็จ:", err);
      // (ควรแสดง error ให้ผู้ใช้เห็น)
    }
  };

  return { 
    conversation: data.conversation, 
    messages: data.messages, 
    isLoading, 
    error, 
    sendMessage, // (ฟังก์ชันสำหรับส่ง)
    refreshMessages: fetchMessages // (ฟังก์ชันสำหรับ refresh)
  };
};
