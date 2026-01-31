import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, FileText, Search, CreditCard } from 'lucide-react';
import { BACKEND_URL } from '../api/apiClient';

const AdminPaymentCheckPage = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // สำหรับดูรูปสลิปขยายใหญ่

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getPendingPayments();
      setPayments(data);
    } catch (error) {
      toast.error("ดึงข้อมูลไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (txnId, action) => {
    if (!window.confirm(action === 'APPROVE' ? "ยืนยันยอดเงินถูกต้อง?" : "ต้องการปฏิเสธสลิปนี้?")) return;
    try {
      await adminApi.verifyPayment(txnId, action);
      toast.success(action === 'APPROVE' ? "ยืนยันยอดเงินแล้ว" : "ปฏิเสธสลิปแล้ว");
      fetchPayments();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CreditCard className="text-blue-600" /> ตรวจสอบสลิปโอนเงิน
        </h1>
        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
          รอตรวจสอบ {payments.length} รายการ
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {payments.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            ไม่มีรายการโอนเงินใหม่
          </div>
        ) : (
          payments.map((pay) => (
            <div key={pay.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-start md:items-center">
              
              {/* ส่วนรูปสลิป */}
              <div 
                className="w-full md:w-32 h-32 bg-slate-100 rounded-lg overflow-hidden cursor-pointer border hover:border-blue-400 transition-all shrink-0"
                onClick={() => setSelectedImage(pay.slipUrl ? `${BACKEND_URL}${pay.slipUrl}` : null)}
              >
                {pay.slipUrl ? (
                  <img src={`${BACKEND_URL}${pay.slipUrl}`} alt="Slip" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">No Image</div>
                )}
              </div>

              {/* ข้อมูล */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">PAYMENT</span>
                  <span className="text-xs text-slate-400">{new Date(pay.createdAt).toLocaleString('th-TH')}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-800">฿{parseFloat(pay.amount).toLocaleString()}</h3>
                <p className="text-sm text-slate-600">
                  จาก: <span className="font-semibold">{pay.payer?.firstName} {pay.payer?.lastName}</span>
                </p>
                <p className="text-xs text-slate-400">งาน: {pay.work?.jobTitle || "ไม่ระบุ"}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">Ref: {pay.gatewayRef}</p>
              </div>

              {/* ปุ่มจัดการ */}
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => handleVerify(pay.id, 'REJECT')}
                  className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-bold text-sm"
                >
                  ปฏิเสธ
                </button>
                <button 
                  onClick={() => handleVerify(pay.id, 'APPROVE')}
                  className="flex-1 md:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm shadow-sm"
                >
                  ยืนยันถูกต้อง
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal ดูรูปใหญ่ */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Full Slip" className="max-w-full max-h-[90vh] rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default AdminPaymentCheckPage;