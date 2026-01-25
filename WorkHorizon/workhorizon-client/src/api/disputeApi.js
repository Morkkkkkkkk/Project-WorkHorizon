import apiClient from "./apiClient";

// 1. สร้างเคสข้อพิพาท (Create Ticket)
const create = (data) => {
  // data = { workId, reason, description }
  return apiClient.post("/disputes/create", data);
};

// 2. ดูรายละเอียด Ticket และประวัติแชท
const getDetail = (ticketId) => {
  return apiClient.get(`/disputes/${ticketId}`);
};

// 3. ส่งข้อความตอบกลับ (Reply)
const reply = (data) => {
  // data = { ticketId, content, fileUrl }
  return apiClient.post("/disputes/reply", data);
};

// 4. (Admin Only) ตัดสินข้อพิพาท
const resolve = (data) => {
  // data = { ticketId, resolution } -> resolution: 'REFUND' | 'COMPLETE'
  return apiClient.post("/disputes/resolve", data);
};

// 5. (Admin Only) ดูรายการข้อพิพาททั้งหมด
const getAll = () => {
  return apiClient.get("/disputes/admin/all");
};

const deleteTicket = (ticketId) => {
  return apiClient.delete(`/disputes/${ticketId}`);
};

// ส่งออกเป็น Object
export const disputeApi = {
  create,
  getDetail,
  reply,
  resolve,
  getAll,
  deleteTicket
};