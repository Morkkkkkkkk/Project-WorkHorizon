// src/components/PaymentTransferForm.jsx
import React, { useState } from 'react';
import { notifyPaymentSlip } from '../api/paymentApi';

// ✅ รับ Props เพิ่มเติม: receiverId, title, serviceId, jobId
const PaymentTransferForm = ({ 
  workId, 
  amount, 
  promptPayId, 
  onFetchData,
  receiverId,
  title,
  serviceId,
  jobId 
}) => {

  // 💡 Debug: เช็คว่า Props ส่งมาถึงไหม
  // console.log("Form Props:", { workId, amount, promptPayId, receiverId, title });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // สร้าง URL QR Code แบบ Dynamic (ใช้เบอร์จริงจาก Freelancer)
  const qrUrl = promptPayId 
    ? `https://promptpay.io/${promptPayId.replace(/\D/g, '')}/${amount}.png`
    : null;

  const handleUploadAndSubmit = async () => {
    if (!file) return alert("กรุณาแนบรูปภาพสลิปเพื่อยืนยัน");
    
    setLoading(true);
    try {
      // ✅ ต้องใช้ FormData สำหรับการส่งไฟล์
      const formData = new FormData();
      formData.append('workId', workId);
      // ⭐ ชื่อฟิลด์ 'paymentSlip' ต้องตรงกับที่ตั้งไว้ใน Upload Middleware ของ Backend
      formData.append('paymentSlip', file); 

      // ✅ เพิ่มข้อมูลจำเป็นสำหรับการ "สร้างงานใหม่" (Auto-Create) ส่งไปให้ Backend
      formData.append('amount', amount);
      if (receiverId) formData.append('receiverId', receiverId);
      if (title) formData.append('title', title);
      if (serviceId) formData.append('serviceId', serviceId);
      if (jobId) formData.append('jobId', jobId);

      // ✅ เรียกใช้ API 
      await notifyPaymentSlip(formData);
      
      alert("ส่งหลักฐานการโอนเรียบร้อย ระบบกำลังรอการตรวจสอบ");
      if (onFetchData) onFetchData(); 
    } catch (error) {
      // แสดงข้อความ error จาก Backend เพื่อให้รู้ว่าติดตรงไหน
      const msg = error.response?.data?.error || error.message;
      alert("เกิดข้อผิดพลาด: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
      <h3 className="text-xl font-bold mb-4 text-slate-800">ชำระเงินผ่านบัญชีกลาง (PromptPay)</h3>
      
      {/* ส่วนแสดง QR Code จริง */}
      <div className="flex flex-col items-center mb-6">
        {qrUrl ? (
          <div className="bg-white p-3 rounded-xl border-2 border-blue-500 shadow-sm mb-3">
            <img src={qrUrl} alt="PromptPay QR" className="w-48 h-48" />
          </div>
        ) : (
          <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center mb-3 text-slate-400 text-xs text-center p-4">
            ไม่พบเบอร์ PromptPay ของฟรีแลนซ์ <br/> กรุณาติดต่อเจ้าหน้าที่
          </div>
        )}
        <div className="text-center">
          <p className="text-sm font-bold text-slate-600">เบอร์ PromptPay: {promptPayId || 'ไม่ระบุ'}</p>
          <p className="text-2xl font-bold text-blue-600">฿{parseFloat(amount).toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-xs text-blue-700 font-bold mb-1 uppercase tracking-wider">โอนเงินเข้าบัญชีกลาง (Admin)</p>
          <p className="text-sm text-blue-900">ธนาคารกสิกรไทย: <span className="font-mono font-bold">000-0-00000-0</span></p>
          <p className="text-sm text-blue-900">ชื่อ: บจก. เวิร์ค ฮอไรซัน (พักเงิน)</p>
        </div>

        <div>
          <label className="block mb-2 text-sm font-bold text-slate-700">แนบหลักฐานการโอน (สลิป):</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        <button
          onClick={handleUploadAndSubmit}
          disabled={loading || !file}
          className={`w-full py-3 rounded-xl text-white font-bold transition-all shadow-md ${
            loading || !file ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
          }`}
        >
          {loading ? "กำลังบันทึก..." : "ยืนยันการแจ้งโอน"}
        </button>
      </div>
    </div>
  );
};

export default PaymentTransferForm;