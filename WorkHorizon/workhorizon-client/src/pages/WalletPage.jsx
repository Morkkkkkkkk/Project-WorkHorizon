// src/pages/WalletPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentApi } from '../api/paymentApi';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Clock, Plus, Building2, User, Briefcase, Ban } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const WalletPage = () => {
  const { user, refreshAuthUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State สำหรับการทำงาน
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK_TRANSFER'); 
  const [cardNumber, setCardNumber] = useState('');

  // ✅ ปรับ Logic ใหม่: ตัด Employer ออก
  
  // 1. กลุ่มคนจ่ายเงิน (Payer) = Seeker (คนหางาน) เท่านั้น -> เห็นเมนู "เติมเงิน"
  const isPayer = user?.role === 'JOB_SEEKER';

  // 2. กลุ่มคนรับเงิน (Earner) = Freelancer (คนรับจ้าง) เท่านั้น -> เห็นเมนู "ถอนเงิน"
  const isEarner = user?.role === 'FREELANCER';

  // (Employer จะเป็น false ทั้งคู่ และจะไม่เห็นกล่องจัดการเงิน)

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          const res = await paymentApi.getMyTransactions(user.id);
          setTransactions(res.data);
        } catch (error) {
          console.error("Failed to load transactions", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  // 🟢 ฟังก์ชันเติมเงิน (สำหรับ Seeker)
  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error("กรุณาระบุจำนวนเงินที่ถูกต้อง");
    
    setIsProcessing(true);
    try {
      const payload = {
        payerId: user.id,
        receiverId: user.id,
        amount: parseFloat(amount),
        method: method,
        cardNumber: method === 'CREDIT_CARD' ? cardNumber : undefined
      };

      const res = await paymentApi.charge(payload);

      if (res.data.success) {
        toast.success(`เติมเงิน ${parseFloat(amount).toLocaleString()} บาท เรียบร้อย!`);
        refreshPageData(parseFloat(amount), 'ADD');
      } else {
        toast.error(res.data.message || "เติมเงินไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsProcessing(false);
    }
  };

  // 🔴 ฟังก์ชันถอนเงิน (สำหรับ Freelancer)
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) return toast.warning("กรุณาระบุจำนวนเงิน");
    if (withdrawAmount > parseFloat(user.walletBalance)) return toast.error("ยอดเงินไม่พอให้ถอน");

    setIsProcessing(true);
    try {
      await paymentApi.withdraw({
          userId: user.id,
          amount: withdrawAmount,
          bankAccount: "KBANK 123-4-56789-0" 
      });
      
      toast.success(`แจ้งถอนเงิน ${withdrawAmount.toLocaleString()} บาท สำเร็จ!`);
      refreshPageData(withdrawAmount, 'SUBTRACT');

    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการถอนเงิน");
    } finally {
      setIsProcessing(false);
    }
  };

  const refreshPageData = async (amountVal, type) => {
    const currentBalance = parseFloat(user.walletBalance || 0);
    const newBalance = type === 'ADD' ? currentBalance + amountVal : currentBalance - amountVal;
    refreshAuthUser({ walletBalance: newBalance });

    const txnRes = await paymentApi.getMyTransactions(user.id);
    setTransactions(txnRes.data);

    setAmount('');
    setCardNumber('');
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:py-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Wallet className="w-8 h-8 text-purple-600" />
              My Wallet
            </h1>
            <p className="text-slate-500 mt-1">
              {isPayer ? "จัดการงบประมาณสำหรับการจ้างงาน" : 
               isEarner ? "จัดการรายได้จากการรับงาน" : "ประวัติธุรกรรม"}
            </p>
          </div>
          
          {/* Badge บอกสถานะ */}
          {(isPayer || isEarner) && (
            <div className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 ${isPayer ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
               {isPayer ? <User size={16}/> : <Briefcase size={16}/>}
               {isPayer ? "บัญชีผู้จ่าย (Payer)" : "บัญชีผู้รับรายได้ (Earner)"}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ========================================================= */}
          {/* Left Column: Action Form (เฉพาะ Seeker และ Freelancer) */}
          {/* ========================================================= */}
          {(isPayer || isEarner) ? (
            <div className="md:col-span-1 space-y-6">

              {/* Balance Card */}
              <div className={`rounded-3xl p-6 text-white shadow-xl relative overflow-hidden ${isPayer ? 'bg-gradient-to-br from-blue-600 to-indigo-700' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                <div className="relative z-10">
                  <p className="text-white/80 font-medium mb-1 text-sm">ยอดเงินคงเหลือ</p>
                  <h2 className="text-4xl font-bold mb-4">฿ {parseFloat(user?.walletBalance || 0).toLocaleString()}</h2>
                  <div className="h-1 w-full bg-white/20 rounded-full mb-2" />
                  <p className="text-xs text-white/80">
                    {isPayer ? "พร้อมชำระค่าบริการ" : "พร้อมถอนเข้าบัญชี"}
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Wallet size={120} />
                </div>
              </div>

              {/* 🟦 Action Box: เติมเงิน (สำหรับ Seeker เท่านั้น) */}
              {isPayer && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Plus size={18} className="text-blue-600" /> เติมเงินเข้าระบบ
                  </h3>

                  <form onSubmit={handleTopUp} className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[100, 500, 1000].map(val => (
                        <button
                          type="button"
                          key={val}
                          onClick={() => setAmount(val)}
                          className={`py-2 rounded-lg text-xs font-bold border transition-all ${parseFloat(amount) === val ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none font-bold text-slate-800"
                      placeholder="ระบุจำนวนเงิน"
                      min="1"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMethod('BANK_TRANSFER')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'BANK_TRANSFER' ? 'border-purple-600 bg-purple-50 text-purple-600 ring-1 ring-purple-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >
                        <Building2 size={20} />
                        <span className="text-[10px] font-bold">โอนเงิน</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMethod('CREDIT_CARD')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'CREDIT_CARD' ? 'border-purple-600 bg-purple-50 text-purple-600 ring-1 ring-purple-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >
                        <CreditCard size={20} />
                        <span className="text-[10px] font-bold">บัตรเครดิต</span>
                      </button>
                    </div>

                    {method === 'CREDIT_CARD' && (
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm"
                        placeholder="เลขบัตร (Test: 4242...)"
                      />
                    )}

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg"
                    >
                      {isProcessing ? 'กำลังทำรายการ...' : 'ยืนยันการเติมเงิน'}
                    </button>
                  </form>
                </div>
              )}

              {/* 🟩 Action Box: ถอนเงิน (สำหรับ Freelancer เท่านั้น) */}
              {isEarner && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ArrowUpRight size={18} className="text-emerald-600" /> ถอนเงินเข้าบัญชี
                  </h3>

                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 mb-4">
                      <p className="text-xs text-emerald-700 font-bold mb-1">บัญชีรับเงิน (Default)</p>
                      <div className="flex items-center gap-2 text-emerald-900 font-mono text-sm">
                        <Building2 size={16}/> KBANK •••• 8888
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-2 block">จำนวนเงินที่ต้องการถอน</label>
                      <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-lg outline-none text-slate-800"
                            placeholder="0.00"
                          />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 text-right">ถอนได้สูงสุด: {parseFloat(user.walletBalance).toLocaleString()}</p>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200"
                    >
                      {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันการถอนเงิน'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          ) : (
            // 🚫 กรณีเป็น Employer หรือ Role อื่นๆ (ไม่แสดงกล่องจัดการเงิน)
            <div className="md:col-span-1">
               <div className="bg-slate-100 rounded-3xl p-8 text-center border border-slate-200 h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Ban size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-600 mb-2">ไม่มีกระเป๋าเงิน</h3>
                  <p className="text-sm text-slate-500">
                    บัญชีประเภทนี้ไม่ต้องใช้ระบบ Wallet
                  </p>
               </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* Right Column: Transaction History */}
          {/* ========================================================= */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={20} className="text-slate-400" /> ประวัติธุรกรรมล่าสุด
                </h3>
              </div>

              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px] custom-scroll">
                {transactions.length > 0 ? transactions.map((txn) => (
                  <div key={txn.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          txn.receiverId === user.id ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {txn.receiverId === user.id ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      
                      <div>
                        <p className="font-bold text-slate-700 text-sm">
                          {txn.workId ? "ชำระค่าจ้าง/รับค่าจ้าง" : 
                           !txn.receiverId ? "ถอนเงินออกจากระบบ" :
                           txn.receiverId === user.id ? (txn.payerId === user.id ? "เติมเงินเข้า Wallet" : "ได้รับเงินโอน") : 
                           "โอนเงินออก"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{new Date(txn.createdAt).toLocaleString('th-TH')}</span>
                          <span>•</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">{txn.method}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`block font-bold ${txn.receiverId === user.id ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.receiverId === user.id ? '+' : '-'} {parseFloat(txn.amount).toLocaleString()}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${txn.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400">ยังไม่มีรายการธุรกรรม</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;