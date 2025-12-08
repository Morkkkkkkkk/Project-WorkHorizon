// src/components/PaymentModal.jsx
import React, { useState } from 'react';
import { CreditCard, Wallet, Landmark, CheckCircle, AlertCircle, X } from 'lucide-react';
import { paymentApi } from '../api/paymentApi';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentModal({ isOpen, onClose, paymentData, onSuccess }) {
  const { user, refreshAuthUser } = useAuth();
  const [method, setMethod] = useState('WALLET'); // WALLET, CREDIT_CARD, BANK_TRANSFER
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const { amount, receiverId, workId, title } = paymentData;
  const isWalletEnough = parseFloat(user?.walletBalance || 0) >= parseFloat(amount);

  const handleConfirm = async () => {

    // 🔴 [เพิ่ม Log] เช็คดูหน่อยว่า user คืออะไร
    console.log("DEBUG User Info:", user);

    if (!user || !user.id) {
        alert("ไม่พบข้อมูลผู้ใช้ กรุณาลอง Refresh หน้าเว็บ หรือ Login ใหม่");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        payerId: user.id,
        receiverId,
        amount,
        method,
        workId,
        cardNumber: method === 'CREDIT_CARD' ? '4242424242424242' : undefined, // Demo Card
        bankName: method === 'BANK_TRANSFER' ? 'KBANK' : undefined
      };

      console.log("Sending Payload:", payload); // 👈 ดูว่าส่งอะไรไป
      
      const res = await paymentApi.charge(payload);
      
      if (res.data.success) {
        // อัปเดตเงินในหน้าเว็บทันทีถ้าจ่ายด้วย Wallet
        if (method === 'WALLET') {
             refreshAuthUser({ walletBalance: parseFloat(user.walletBalance) - parseFloat(amount) });
        }
        onSuccess(); // แจ้ง Parent Component ว่าสำเร็จแล้ว
        onClose();
      } else {
        setError(res.data.message || 'การชำระเงินล้มเหลว');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">ยืนยันการชำระเงิน</h2>
            <p className="text-slate-400 text-sm mt-1">{title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
           <div className="text-center mb-8">
             <p className="text-slate-500 mb-1">ยอดชำระทั้งหมด</p>
             <h3 className="text-4xl font-extrabold text-slate-800">฿{parseFloat(amount).toLocaleString()}</h3>
           </div>

           {/* Payment Methods Tabs */}
           <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
              {[{id:'WALLET', icon:Wallet, label:'Wallet'}, {id:'CREDIT_CARD', icon:CreditCard, label:'บัตรเครดิต'}, {id:'BANK_TRANSFER', icon:Landmark, label:'โอนเงิน'}].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex flex-col items-center justify-center py-3 rounded-lg text-xs font-bold transition-all ${method === m.id ? 'bg-white shadow-sm text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <m.icon size={20} className="mb-1" />
                    {m.label}
                  </button>
              ))}
           </div>

           {/* Method Details */}
           <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
              {method === 'WALLET' && (
                  <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">ยอดเงินของคุณ:</span>
                      <span className={`font-bold ${isWalletEnough ? 'text-green-600' : 'text-red-600'}`}>
                          ฿{parseFloat(user?.walletBalance || 0).toLocaleString()}
                      </span>
                  </div>
              )}
              {method === 'CREDIT_CARD' && (
                  <div className="text-center text-sm text-slate-500">
                      ใช้บัตรจำลอง: <span className="font-mono bg-slate-200 px-2 py-0.5 rounded">4242...</span> เพื่อทดสอบ
                  </div>
              )}
              {method === 'BANK_TRANSFER' && (
                  <div className="text-center text-sm text-slate-500">
                      ระบบจะจำลองการเชื่อมต่อแอปธนาคาร (3 วินาที)
                  </div>
              )}
           </div>

           {error && (
             <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
               <AlertCircle size={16} /> {error}
             </div>
           )}

           <button
             onClick={handleConfirm}
             disabled={loading || (method === 'WALLET' && !isWalletEnough)}
             className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all ${loading || (method === 'WALLET' && !isWalletEnough) ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-purple-600 hover:bg-purple-700 active:scale-95'}`}
           >
             {loading ? <LoadingSpinner size={20} color="white" /> : (
                <>
                  <CheckCircle size={20} /> ชำระเงิน
                </>
             )}
           </button>
           
           {method === 'WALLET' && !isWalletEnough && (
               <p className="text-center text-xs text-red-500 mt-3">ยอดเงินไม่พอ กรุณาเติมเงินที่หน้า Wallet</p>
           )}
        </div>
      </div>
    </div>
  );
}