// src/pages/WalletPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentApi } from '../api/paymentApi';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, Clock, Plus, Building2, Smartphone } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

const WalletPage = () => {
  const { user, refreshAuthUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  // Top Up State
  const [amount, setAmount] = useState(100);
  const [method, setMethod] = useState('BANK_TRANSFER'); // BANK_TRANSFER, CREDIT_CARD
  const [cardNumber, setCardNumber] = useState('');

  // ดึงข้อมูลประวัติการเงิน
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

  // ฟังก์ชันเติมเงิน
  const handleTopUp = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return toast.error("กรุณาระบุจำนวนเงินที่ถูกต้อง");
    if (method === 'CREDIT_CARD' && !cardNumber) return toast.error("กรุณากรอกเลขบัตรเครดิต");

    setIsTopUpLoading(true);
    try {
      // ใช้ charge API แต่ payer/receiver เป็นคนเดียวกัน = เติมเงิน
      const payload = {
        payerId: user.id,
        receiverId: user.id,
        amount: parseFloat(amount),
        method: method,
        // ส่งรายละเอียดเพิ่มเติม
        cardNumber: method === 'CREDIT_CARD' ? cardNumber : undefined
      };

      const res = await paymentApi.charge(payload);

      if (res.data.success) {
        toast.success(`เติมเงิน ${amount.toLocaleString()} บาท เรียบร้อย!`);

        // Update Local State
        const newBalance = parseFloat(user.walletBalance || 0) + parseFloat(amount);
        refreshAuthUser({ walletBalance: newBalance });

        // Refresh Transactions
        const txnRes = await paymentApi.getMyTransactions(user.id);
        setTransactions(txnRes.data);

        // Reset Logic
        setCardNumber('');
      } else {
        toast.error(res.data.message || "เติมเงินไม่สำเร็จ");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      toast.error(msg);
    } finally {
      setIsTopUpLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:py-12">
      <div className="max-w-4xl mx-auto space-y-8">

        <header>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Wallet className="w-8 h-8 text-purple-600" />
            My Wallet
          </h1>
          <p className="text-slate-500 mt-1">จัดการเครดิตและประวัติการชำระเงินของคุณ</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Balance & Top Up Form */}
          <div className="md:col-span-1 space-y-6">

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-purple-100 font-medium mb-1 text-sm">ยอดเงินคงเหลือ</p>
                <h2 className="text-4xl font-bold mb-4">฿ {parseFloat(user?.walletBalance || 0).toLocaleString()}</h2>
                <div className="h-1 w-full bg-white/20 rounded-full mb-2" />
                <p className="text-xs text-purple-200">ใช้จ่ายค่าจ้างงานได้ทันที</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Wallet size={120} />
              </div>
            </div>

            {/* Top Up Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-green-600" /> เติมเงิน
              </h3>

              <form onSubmit={handleTopUp} className="space-y-4">
                {/* Amount Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">จำนวนเงิน (บาท)</label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[100, 500, 1000].map(val => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setAmount(val)}
                        className={`py-2 rounded-lg text-sm font-bold border transition-all ${amount === val ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none font-bold text-slate-800"
                    placeholder="ระบุจำนวนเงิน"
                    min="1"
                  />
                </div>

                {/* Method Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block uppercase">ช่องทางชำระเงิน</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMethod('BANK_TRANSFER')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'BANK_TRANSFER' ? 'border-purple-600 bg-purple-50 text-purple-600 ring-1 ring-purple-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      <Building2 size={24} />
                      <span className="text-xs font-bold">โอนผ่านบัญชี</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('CREDIT_CARD')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${method === 'CREDIT_CARD' ? 'border-purple-600 bg-purple-50 text-purple-600 ring-1 ring-purple-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                      <CreditCard size={24} />
                      <span className="text-xs font-bold">บัตรเครดิต</span>
                    </button>
                  </div>
                </div>

                {/* Credit Card Input */}
                {method === 'CREDIT_CARD' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">หมายเลขบัตร (Test: 4242...)</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isTopUpLoading}
                  className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200"
                >
                  {isTopUpLoading ? 'กำลังทำรายการ...' : 'ยืนยันการเติมเงิน'}
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: Transaction History */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={20} className="text-slate-400" /> ประวัติธุรกรรม
                </h3>
              </div>

              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
                {transactions.length > 0 ? transactions.map((txn) => (
                  <div key={txn.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'TOPUP' || !txn.receiverId ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {txn.type === 'TOPUP' || !txn.receiverId ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm">
                          {txn.workId ? "ชำระค่าจ้างงาน" : (txn.receiverId ? (txn.receiverId === user.id ? "เติมเงินเข้า Wallet" : "โอนเงิน") : "เติมเงิน")}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{new Date(txn.createdAt).toLocaleString('th-TH')}</span>
                          <span>•</span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">{txn.method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`block font-bold ${txn.type === 'TOPUP' || !txn.receiverId || txn.receiverId === user.id ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.type === 'TOPUP' || !txn.receiverId || txn.receiverId === user.id ? '+' : '-'} {parseFloat(txn.amount).toLocaleString()}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${txn.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
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