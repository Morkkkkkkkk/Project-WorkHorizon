import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, Clock, Building2, User } from 'lucide-react';
import { BACKEND_URL } from '../api/apiClient';

const AdminWithdrawalsPage = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getWithdrawalRequests();
      setRequests(data);
    } catch (error) {
      console.error(error);
      toast.error("ไม่สามารถดึงข้อมูลรายการถอนเงินได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (txnId, action) => {
    if (!window.confirm(`ยืนยันการ ${action === 'APPROVE' ? 'อนุมัติ' : 'ปฏิเสธ'} รายการนี้?`)) return;

    try {
      await adminApi.approveWithdrawal(txnId, action);
      toast.success(action === 'APPROVE' ? "อนุมัติเรียบร้อย" : "ปฏิเสธรายการแล้ว");
      fetchRequests(); // รีโหลดข้อมูล
    } catch (error) {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="text-blue-600" /> รายการแจ้งถอนเงิน
        </h1>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
          รอตรวจสอบ {requests.length} รายการ
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4">ผู้ขอถอน</th>
              <th className="p-4">จำนวนเงิน</th>
              <th className="p-4">วันที่แจ้ง</th>
              <th className="p-4">บัญชีธนาคาร (Ref)</th>
              <th className="p-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-400">
                  ไม่มีรายการรอตรวจสอบ
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                           <User size={20} className="text-slate-400"/>
                        </div>
                        <div>
                            <p className="font-bold text-slate-700">{req.payer?.firstName} {req.payer?.lastName}</p>
                            <p className="text-xs text-slate-400">{req.payer?.email}</p>
                        </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-red-600 text-lg">
                    ฿{parseFloat(req.amount).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(req.createdAt).toLocaleString('th-TH')}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-mono text-slate-600">
                     {/* ตรงนี้ถ้า Backend ส่งเลขบัญชีมาเพิ่ม ให้เอามาใส่ */}
                     KBANK-MOCK-ACC
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                        onClick={() => handleAction(req.id, 'REJECT')}
                        className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-bold transition-all"
                    >
                        ปฏิเสธ
                    </button>
                    <button 
                        onClick={() => handleAction(req.id, 'APPROVE')}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold shadow-md shadow-green-200 transition-all"
                    >
                        อนุมัติโอน
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminWithdrawalsPage;