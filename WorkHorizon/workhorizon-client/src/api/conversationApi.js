import apiClient from "./apiClient";

const handleResponse = (res) => res.data;

/**
 * (Employer or Job Seeker)
 * Get or Create a conversation for a specific application.
 */
const getConversationByApp = (applicationId) => {
  return apiClient
    .get(`/applications/${applicationId}/conversation`)
    .then(handleResponse);
};

/**
 * (Employer or Job Seeker)
 * Get all messages for a specific conversation.
 * (ฟังก์ชันนี้อาจจะซ้ำกับ getById แต่เก็บไว้เผื่อส่วนอื่นใช้)
 */
const getMessages = (conversationId) => {
  return apiClient
    .get(`/conversations/${conversationId}/messages`)
    .then(handleResponse);
};

/**
 * ✅ เพิ่มฟังก์ชันนี้: สำหรับดึงรายละเอียดแชทโดยใช้ ID
 * (ใช้ Endpoint เดียวกับที่แก้ใน Backend router.get("/:convoId", ...))
 */
const getById = (conversationId) => {
  return apiClient.get(`/conversations/${conversationId}`).then(handleResponse);
};

/**
 * (Employer or Job Seeker)
 * Send a new message.
 */
const sendMessage = (conversationId, data) => {
  // Check if data is FormData (for file uploads)
  if (data instanceof FormData) {
    return apiClient
      .post(`/conversations/${conversationId}/messages`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(handleResponse);
  }

  // Fallback for JSON (Text only)
  const payload = typeof data === "string" ? { content: data } : data;
  return apiClient
    .post(`/conversations/${conversationId}/messages`, payload)
    .then(handleResponse);
};

/**
 * (User - All Roles)
 * Get all conversations for the authenticated user.
 */
const getMyConversations = () => {
  return apiClient.get("/conversations").then(handleResponse);
};

/**
 * (User - All Roles)
 * Delete a conversation by ID.
 */
const deleteConversation = (conversationId) => {
  return apiClient
    .delete(`/conversations/${conversationId}`)
    .then(handleResponse);
};

export const conversationApi = {
  getConversationByApp,
  getMessages,
  getById, // ✅ อย่าลืม export ตัวนี้ออกมา
  sendMessage,
  getMyConversations,
  deleteConversation,
};
