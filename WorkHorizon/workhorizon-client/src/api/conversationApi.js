import apiClient from "./apiClient";

/**
 * (Employer or Job Seeker)
 * Get or Create a conversation for a specific application.
 * @param {string} applicationId
 */
const getConversationByApp = (applicationId) => {
  return apiClient.get(`/applications/${applicationId}/conversation`);
};

/**
 * (Employer or Job Seeker)
 * Get all messages for a specific conversation.
 * @param {string} conversationId
 */
const getMessages = (conversationId) => {
  return apiClient.get(`/conversations/${conversationId}/messages`);
};

/**
 * (Employer or Job Seeker)
 * Send a new message.
 * @param {string} conversationId
 * @param {object} data ({ content })
 */
const sendMessage = (conversationId, data) => {
  return apiClient.post(`/conversations/${conversationId}/messages`, data);
};

/**
 * (User - All Roles)
 * Get all conversations for the authenticated user.
 * This endpoint returns all conversations the user is part of,
 * including job application chats and service-related chats.
 * @returns {Promise} Array of conversations with last message preview
 */
const getAllUserConversations = () => {
  return apiClient.get("/conversations");
};

/**
 * (User - All Roles)
 * Delete a conversation by ID.
 * Note: This may soft-delete on backend (archive) rather than permanent deletion.
 * @param {string} conversationId - The conversation ID to delete
 * @returns {Promise} Success response
 */
const deleteConversation = (conversationId) => {
  return apiClient.delete(`/conversations/${conversationId}`);
};

export const conversationApi = {
  getConversationByApp,
  getMessages,
  sendMessage,
  getAllUserConversations, // ✅ New: Get all user conversations
  deleteConversation, // ✅ New: Delete conversation
};
