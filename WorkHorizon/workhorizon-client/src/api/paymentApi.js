// src/api/paymentApi.js
import apiClient from "./apiClient";

export const paymentApi = {
  // จ่ายเงิน (ตัดบัตร/Wallet)
  charge: async (data) => {
    return await apiClient.post("/payment/charge", data);
  },

  // เติมเงิน (Mock)
  topUp: async (data) => {
    // data = { userId, amount }
    // หมายเหตุ: ในระบบจริง topup อาจจะไปเรียก charge ก่อน
    // แต่ใน Mock นี้เรายิงเข้า Wallet ตรงๆ เลยก็ได้ครับ
    return await apiClient.post("/payment/charge", {
      payerId: data.userId,
      method: "BANK_TRANSFER", // เติมผ่านแบงค์
      receiverId: data.userId, // เติมเข้าตัวเอง
      amount: data.amount,
    });
  },

  // ดึงประวัติธุรกรรม
  getMyTransactions: async (userId) => {
    return await apiClient.get(`/payment/history/${userId}`);
  },

  // ✅ ถอนเงิน
  withdraw: async (data) => {
    // data = { userId, amount, bankAccount }
    return await apiClient.post("/payment/withdraw", data);
  },
};
