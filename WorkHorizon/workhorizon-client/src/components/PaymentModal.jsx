import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Wallet, QrCode, X, Lock, CheckCircle, AlertCircle, Loader2, ChevronRight 
} from 'lucide-react';
import { paymentApi } from '../api/paymentApi';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentModal({ isOpen, onClose, paymentData, onSuccess }) {
  const { user, refreshAuthUser } = useAuth();
  const [activeTab, setActiveTab] = useState('card'); // card, qr, wallet
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // success, error
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  if (!isOpen) return null;

  const { amount, receiverId, workId, title } = paymentData;
  const isWalletEnough = parseFloat(user?.walletBalance || 0) >= parseFloat(amount);

  // Auto format card number (4-4-4-4)
  const handleCardNumChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(val);
  };

  // Auto format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
    }
    setExpiry(val);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg('');
    setResult(null);

    // Map tab to backend method enum
    let method = 'CREDIT_CARD';
    if (activeTab === 'qr') method = 'BANK_TRANSFER';
    if (activeTab === 'wallet') method = 'WALLET';

    try {
      const payload = {
        payerId: user.id,
        receiverId,
        amount,
        method,
        workId,
        // ส่งข้อมูลบัตรไปด้วย (ถ้าเป็นแท็บ Card)
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
        // ถ้าตัด Wallet ให้ update client state ทันที
        if (method === 'WALLET') {
            refreshAuthUser({ walletBalance: parseFloat(user.walletBalance) - parseFloat(amount) });
        }
        setTimeout(() => {
            onSuccess();
            onClose();
        }, 2000); // โชว์ Success ค้างไว้ 2 วิ แล้วค่อยปิด
      } else {
        setResult('error');
        setErrorMsg(res.data.message || 'การชำระเงินถูกปฏิเสธ');
      }
    } catch (err) {
      setResult('error');
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* --- Header --- */}
        <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center">
            <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Lock size={16} className="text-green-500"/> Secure Payment
                </h3>
                <p className="text-xs text-slate-500">Encrypted by 256-bit SSL (Simulated)</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X size={20} className="text-slate-500"/>
            </button>
        </div>

        <div className="flex flex-col md:flex-row h-full">
            
            {/* --- Left: Summary & Tabs --- */}
            <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 p-5 flex flex-col gap-4">
                <div className="mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ยอดที่ต้องชำระ</p>
                    <h2 className="text-3xl font-extrabold text-slate-900">฿{parseFloat(amount).toLocaleString()}</h2>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{title}</p>
                </div>

                <div className="flex flex-col gap-2">
                    <button 
                        onClick={() => setActiveTab('card')}
                        className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all border ${activeTab === 'card' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'}`}
                    >
                        <CreditCard size={18} /> Credit Card
                    </button>
                    <button 
                        onClick={() => setActiveTab('qr')}
                        className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all border ${activeTab === 'qr' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'}`}
                    >
                        <QrCode size={18} /> QR PromptPay
                    </button>
                    <button 
                        onClick={() => setActiveTab('wallet')}
                        className={`flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all border ${activeTab === 'wallet' ? 'bg-white border-blue-500 text-blue-600 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'}`}
                    >
                        <Wallet size={18} /> My Wallet
                    </button>
                </div>
            </div>

            {/* --- Right: Payment Form --- */}
            <div className="w-full md:w-2/3 p-6 relative">
                
                {/* 1. CREDIT CARD FORM */}
                {activeTab === 'card' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Card Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                                <input 
                                    type="text" 
                                    placeholder="4242 4242 4242 4242"
                                    value={cardNumber}
                                    onChange={handleCardNumChange}
                                    maxLength={19}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                    {/* Mock Icons */}
                                    <div className="w-8 h-5 bg-slate-200 rounded"></div>
                                    <div className="w-8 h-5 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Expiration</label>
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
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14}/>
                                    <input 
                                        type="text" 
                                        placeholder="123"
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0,3))}
                                        className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500">Cardholder Name</label>
                            <input 
                                type="text" 
                                placeholder="YOUR NAME"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                             <p className="text-[10px] text-blue-600 font-bold mb-1">ℹ️ Test Cards:</p>
                             <ul className="text-[10px] text-blue-500 space-y-1 font-mono">
                                <li>• 4242 4242 4242 4242 (Success)</li>
                                <li>• 4000 0000 0000 0000 (Decline)</li>
                                <li>• 5555 5555 5555 5555 (No Funds)</li>
                             </ul>
                        </div>
                    </div>
                )}

                {/* 2. QR PROMPT PAY */}
                {activeTab === 'qr' && (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm relative">
                             {/* Mock QR Code */}
                             <div className="w-40 h-40 bg-slate-900 flex items-center justify-center text-white rounded-lg overflow-hidden relative">
                                <div className="absolute inset-0 border-8 border-white"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white rounded flex items-center justify-center">
                                        <div className="w-8 h-8 bg-blue-900 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                                <span className="absolute bottom-2 text-[10px] font-mono opacity-50">SCAN ME</span>
                             </div>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-slate-800">Thai QR Payment</p>
                            <p className="text-xs text-slate-500">สแกนเพื่อชำระเงิน (จำลอง)</p>
                        </div>
                    </div>
                )}

                {/* 3. WALLET */}
                {activeTab === 'wallet' && (
                    <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                         <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                            <Wallet size={40} className="text-orange-500" />
                         </div>
                         <div className="text-center w-full">
                            <p className="text-slate-500 text-sm mb-1">ยอดเงินคงเหลือของคุณ</p>
                            <h3 className={`text-3xl font-extrabold ${isWalletEnough ? 'text-slate-800' : 'text-red-500'}`}>
                                ฿{parseFloat(user?.walletBalance || 0).toLocaleString()}
                            </h3>
                            {!isWalletEnough && (
                                <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg inline-flex items-center gap-2">
                                    <AlertCircle size={14}/> ยอดเงินไม่เพียงพอ กรุณาเติมเงิน
                                </div>
                            )}
                         </div>
                    </div>
                )}

                {/* --- Loading / Result Overlay --- */}
                {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                        <p className="font-bold text-slate-700 animate-pulse">Processing Payment...</p>
                        <p className="text-xs text-slate-500">กำลังติดต่อธนาคาร (จำลอง)</p>
                    </div>
                )}

                {result === 'success' && (
                    <div className="absolute inset-0 bg-green-50 flex flex-col items-center justify-center z-20 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200 mb-6">
                            <CheckCircle size={40} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h3>
                        <p className="text-green-600">ขอบคุณสำหรับการชำระเงิน</p>
                    </div>
                )}

                {result === 'error' && (
                    <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-20 animate-in zoom-in duration-300 px-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <X size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Payment Failed</h3>
                        <p className="text-slate-500 mb-6">{errorMsg}</p>
                        <button 
                            onClick={() => setResult(null)}
                            className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
                        >
                            ลองใหม่อีกครั้ง
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* --- Footer Button --- */}
        <div className="bg-white border-t border-slate-100 p-5">
            <button 
                onClick={handleSubmit}
                disabled={loading || (activeTab === 'wallet' && !isWalletEnough)}
                className={`
                    w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                    ${loading || (activeTab === 'wallet' && !isWalletEnough) 
                        ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 active:scale-95'
                    }
                `}
            >
                {activeTab === 'qr' ? 'ยืนยันการโอนเงิน' : `ชำระเงิน ฿${parseFloat(amount).toLocaleString()}`}
                {!loading && <ChevronRight size={20}/>}
            </button>
        </div>

      </div>
    </div>
  );
}