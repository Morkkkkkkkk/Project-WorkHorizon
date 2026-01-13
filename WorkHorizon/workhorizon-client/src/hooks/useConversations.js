import { useState, useEffect, useCallback } from "react";
import { conversationApi } from "../api/conversationApi";
import { useAuth } from "../contexts/AuthContext";

export const useConversations = () => {
  const { isAuth } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async () => {
    if (!isAuth) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // ✅ แก้ไข: เรียกใช้ getMyConversations และรับค่า data ตรงๆ
      const data = await conversationApi.getMyConversations();
      
      setConversations(data || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError(err);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuth]);

  const handleDeleteConversation = async (conversationId) => {
    try {
      await conversationApi.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      throw err;
    }
  };

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