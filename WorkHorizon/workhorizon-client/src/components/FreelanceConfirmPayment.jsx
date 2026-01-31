// workhorizon-client/src/components/FreelanceConfirmPayment.jsx
import React from 'react';
import { confirmStartWork } from '../api/freelancerApi'; //

const FreelanceConfirmPayment = ({ work, onFetchData }) => {
  
  const handleConfirm = async () => {
    if (!window.confirm("คุณตรวจสอบยอดเงินในบัญชีกลาง (Admin) เรียบร้อยแล้วใช่หรือไม่?")) return;

    try {
      await confirmStartWork(work.id); //
      alert("เริ่มงานเรียบร้อย! สถานะงานเปลี่ยนเป็น 'กำลังดำเนินการ'");
      onFetchData();
    } catch (error) {
      alert("ไม่สามารถยืนยันได้: " + error.message);
    }
  };

  return (
    <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 my-4 rounded shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-bold text-yellow-800">รอคุณยืนยันการชำระเงิน</h4>
          <p className="text-sm text-yellow-700">ผู้จ้างแจ้งโอนเงินเข้าบัญชีกลางแล้ว กรุณาตรวจสอบความถูกต้อง</p>
          {work.slipUrl && (
            <a 
              href={work.slipUrl} 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-600 font-semibold underline mt-2 block"
            >
              คลิกเพื่อดูรูปสลิปหลักฐาน
            </a>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
          >
            เงินเข้าแล้ว เริ่มงานเลย
          </button>
          
          {/* ปุ่มนี้จะเชื่อมกับ Dispute สำหรับ Freelance กรณีสลิปปลอม */}
          <button className="text-red-600 text-xs hover:underline">
            แจ้งปัญหาเรื่องสลิป
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreelanceConfirmPayment;