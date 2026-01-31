import React, { useState, useEffect } from 'react';
import {
    CreditCard, Wallet, QrCode, X, Lock, CheckCircle, AlertCircle, Loader2, ChevronRight
} from 'lucide-react';
import { paymentApi } from '../api/paymentApi';
import { useAuth } from '../contexts/AuthContext';
// ✅ นำเข้าฟอร์มแจ้งโอนเงินที่เราสร้างไว้
import PaymentTransferForm from './PaymentTransferForm';

export default function PaymentModal({ isOpen, onClose, paymentData, onSuccess }) {
    const { user, refreshAuthUser } = useAuth();

    // --- States จัดการการแสดงผลและข้อมูล ---
    const [activeTab, setActiveTab] = useState('card');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    // --- Form States ข้อมูลบัตร ---
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    // ป้องกันการกดปุ่มซ้ำ
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ถ้า Modal ปิดอยู่ ไม่ต้องเรนเดอร์
    if (!isOpen) return null;

    const { amount, receiverId, workId, title, serviceId, jobId, promptPayId } = paymentData;
    const isWalletEnough = parseFloat(user?.walletBalance || 0) >= parseFloat(amount);

    // จัดรูปแบบเลขบัตร (4-4-4-4)
    const handleCardNumChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        val = val.substring(0, 16);
        val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardNumber(val);
    };

    // จัดรูปแบบวันหมดอายุ (MM/YY)
    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        setExpiry(val);
    };

    // --- ฟังก์ชันส่งข้อมูล (สำหรับ Card และ Wallet) ---
    const handleSubmit = async () => {
        if (isSubmitting || loading) return;

        setIsSubmitting(true);
        setLoading(true);
        setErrorMsg('');
        setResult(null);

        let method = 'CREDIT_CARD';
        if (activeTab === 'wallet') method = 'WALLET';

        try {
            const payload = {
                payerId: user.id,
                receiverId,
                amount,
                method,
                workId,
                serviceId,
                jobId,
                cardDetails: activeTab === 'card' ? {
                    name: cardName,
                    number: cardNumber.replace(/\s/g, ''),
                    expiry,
                    cvc
                } : undefined
            };

            const res = await paymentApi.charge(payload);

            if (res.data.success) {
                setResult('success');
                if (method === 'WALLET') {
                    refreshAuthUser({ walletBalance: parseFloat(user.walletBalance) - parseFloat(amount) });
                }
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setIsSubmitting(false);
                }, 2000);
            } else {
                setResult('error');
                setErrorMsg(res.data.message || 'การชำระเงินถูกปฏิเสธ');
                setIsSubmitting(false);
            }
        } catch (err) {
            setResult('error');
            setErrorMsg(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
            setIsSubmitting(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

                {/* --- Header --- */}
                <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                            <Lock size={16} className="text-green-500" /> Secure Payment
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">WorkHorizon Escrow System</p>
                    </div>
                    <button onClick={onClose} disabled={isSubmitting} className="p-2 hover:bg-slate-200 rounded-full transition-colors disabled:opacity-50">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

                    {/* --- Left Column: สรุปยอดและเมนู --- */}
                    <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 p-5 flex flex-col gap-4">
                        <div className="mb-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ยอดชำระสุทธิ</p>
                            <h2 className="text-3xl font-black text-blue-600">฿{parseFloat(amount).toLocaleString()}</h2>
                            <p className="text-xs text-slate-500 mt-2 font-medium line-clamp-2">{title}</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setActiveTab('card')}
                                disabled={isSubmitting}
                                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all border ${activeTab === 'card' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'}`}
                            >
                                <CreditCard size={18} /> บัตรเครดิต
                            </button>
                            <button
                                onClick={() => setActiveTab('qr')}
                                disabled={isSubmitting}
                                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all border ${activeTab === 'qr' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'}`}
                            >
                                <QrCode size={18} /> PromptPay
                            </button>
                            <button
                                onClick={() => setActiveTab('wallet')}
                                disabled={isSubmitting}
                                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all border ${activeTab === 'wallet' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'}`}
                            >
                                <Wallet size={18} /> Wallet
                            </button>
                        </div>
                    </div>

                    {/* --- Right Column: ฟอร์ม (มี Scroll ภายใน) --- */}
                    <div className="w-full md:w-2/3 p-6 relative overflow-y-auto custom-scroll">

                        {/* 1. CREDIT CARD FORM */}
                        {activeTab === 'card' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">หมายเลขบัตร</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="4242 4242 4242 4242"
                                            value={cardNumber}
                                            onChange={handleCardNumChange}
                                            maxLength={19}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">หมดอายุ (MM/YY)</label>
                                        <input
                                            type="text"
                                            placeholder="MM / YY"
                                            value={expiry}
                                            onChange={handleExpiryChange}
                                            maxLength={5}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500">CVC</label>
                                        <input
                                            type="text"
                                            placeholder="123"
                                            value={cvc}
                                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">ชื่อบนบัตร</label>
                                    <input
                                        type="text"
                                        placeholder="ภาษาอังกฤษเท่านั้น"
                                        value={cardName}
                                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 2. ✅ QR PROMPT PAY (เรียกใช้ฟอร์มจริงที่ดึงเบอร์ Freelancer) */}
                        {activeTab === 'qr' && (
                            <div className="animate-in fade-in zoom-in duration-300">
                                <PaymentTransferForm
                                    workId={workId}
                                    amount={amount}
                                    promptPayId={promptPayId}
                                    receiverId={receiverId}
                                    title={title}
                                    serviceId={serviceId}
                                    jobId={jobId}
                                    onFetchData={() => {
                                        // เมื่อแจ้งสลิปสำเร็จ แสดงสถานะสำเร็จและปิด Modal
                                        setResult('success');
                                        setTimeout(() => {
                                            onSuccess();
                                            onClose();
                                        }, 2500);
                                    }}
                                />
                            </div>
                        )}

                        {/* 3. WALLET */}
                        {activeTab === 'wallet' && (
                            <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Wallet size={40} className="text-orange-500" />
                                </div>
                                <div className="text-center w-full">
                                    <p className="text-slate-500 text-sm mb-1">ยอดเงินคงเหลือของคุณ</p>
                                    <h3 className={`text-3xl font-extrabold ${isWalletEnough ? 'text-slate-800' : 'text-red-500'}`}>
                                        ฿{parseFloat(user?.walletBalance || 0).toLocaleString()}
                                    </h3>
                                    {!isWalletEnough && (
                                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg inline-flex items-center gap-2 border border-red-100">
                                            <AlertCircle size={14} /> ยอดเงินไม่เพียงพอ กรุณาเติมเงิน
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- Overlays สำหรับสถานะต่างๆ --- */}
                        {loading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                                <p className="font-bold text-slate-700">กำลังประมวลผล...</p>
                            </div>
                        )}

                        {result === 'success' && (
                            <div className="absolute inset-0 bg-green-50 flex flex-col items-center justify-center z-20 animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-6">
                                    <CheckCircle size={40} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-green-700">ชำระเงินสำเร็จ!</h3>
                                <p className="text-green-600 mt-2">กรุณารอระบบอัปเดตสถานะงาน</p>
                            </div>
                        )}

                        {result === 'error' && (
                            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-20 px-6 text-center">
                                <X size={48} className="text-red-500 mb-4" />
                                <h3 className="text-xl font-bold text-slate-800">เกิดข้อผิดพลาด</h3>
                                <p className="text-slate-500 text-sm mb-6">{errorMsg}</p>
                                <button onClick={() => setResult(null)} className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold transition-all active:scale-95">ลองใหม่อีกครั้ง</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Footer --- */}
                <div className="bg-white border-t border-slate-100 p-5">
                    {activeTab !== 'qr' ? (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || isSubmitting || (activeTab === 'wallet' && !isWalletEnough)}
                            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${loading || isSubmitting || (activeTab === 'wallet' && !isWalletEnough)
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                                }`}
                        >
                            {loading ? 'กำลังดำเนินรายการ...' : `ชำระเงิน ฿${parseFloat(amount).toLocaleString()}`}
                            {!loading && <ChevronRight size={20} />}
                        </button>
                    ) : (
                        <p className="text-center text-xs text-slate-400 font-medium italic">
                            * กรุณาสแกน QR และแนบสลิปด้านบนเพื่อยืนยันการชำระเงิน
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}