// src/pages/MyHiresPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Briefcase, CheckCircle, Star, Search, MessageSquare,
    Clock, Filter, X, ChevronRight, AlertCircle, Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { freelancerApi } from '../api/freelancerApi';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import PaymentModal from '../components/PaymentModal';
import { BACKEND_URL } from '../api/apiClient';

// Import ส่วนที่เพิ่มใหม่
import CreateDisputeModal from "../components/CreateDisputeModal";
import PaymentTransferForm from "../components/PaymentTransferForm"; // Component ที่สร้างไว้ก่อนหน้า

const MyHiresPage = () => {
    const [works, setWorks] = useState([]);
    const [activeTab, setActiveTab] = useState('ACTIVE');
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // State สำหรับ Slide-over Drawer
    const [selectedWork, setSelectedWork] = useState(null);

    // Payment & Review States
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedWorkId, setSelectedWorkId] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

    // ✅ State ที่เพิ่มเข้ามาสำหรับระบบใหม่
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [showTransferForm, setShowTransferForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHires();
    }, []);

    const fetchHires = async () => {
        setIsLoading(true);
        try {
            const data = await freelancerApi.getMyHires();
            setWorks(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // ฟังก์ชันจัดการสถานะ
    const handleStatusUpdate = async (workId, newStatus) => {
        // CASE A: จ่ายเงิน (ปรับปรุงให้เปิดหน้าโอนเงิน)
        if (newStatus === 'IN_PROGRESS') {
            const workToPay = works.find(w => w.id === workId);
            if (workToPay) {
                setSelectedWork(workToPay);
                setShowTransferForm(true); // เปิดหน้าจอ QR/โอนเงิน
            }
            return;
        }

        // CASE B: เปลี่ยนสถานะปกติ
        if (!window.confirm(`ยืนยันการเปลี่ยนสถานะเป็น "${newStatus}"?`)) return;

        try {
            await freelancerApi.updateWorkStatus(workId, newStatus);
            toast.success('อัปเดตสถานะเรียบร้อย');
            fetchHires();
            setSelectedWork(null);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handlePaymentSuccess = () => {
        setIsPaymentOpen(false);
        setShowTransferForm(false);
        toast.success('แจ้งโอนเงินเรียบร้อย รอการตรวจสอบ! 🚀');
        fetchHires();
        setActiveTab('ACTIVE');
        setSelectedWork(null);
    };

    // Review Logic
    const handleOpenReviewModal = (workId) => {
        setSelectedWorkId(workId);
        setReviewRating(5);
        setReviewComment('');
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            const work = works.find(w => w.id === selectedWorkId);
            if (!work) return;

            await freelancerApi.submitReview(work.freelancerId, {
                workId: selectedWorkId,
                rating: reviewRating,
                comment: reviewComment
            });

            setIsReviewModalOpen(false);
            fetchHires();
            toast.success('รีวิวเรียบร้อยแล้ว!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    // Filter Logic
    const filteredWorks = works.filter(work => {
        const matchesSearch = work.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (work.freelancerProfile?.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'ALL') return matchesSearch;

        if (activeTab === 'ACTIVE') {
            return matchesSearch && ['IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'DISPUTED'].includes(work.status);
        }
        if (activeTab === 'OFFER_PENDING') {
            return matchesSearch && work.status === 'OFFER_PENDING';
        }
        if (activeTab === 'COMPLETED') {
            return matchesSearch && work.status === 'COMPLETED';
        }
        return matchesSearch;
    });

    const getStatusBadge = (status) => {
        const styles = {
            'OFFER_PENDING': 'bg-orange-100 text-orange-700',
            'IN_PROGRESS': 'bg-blue-100 text-blue-700',
            'SUBMITTED': 'bg-purple-100 text-purple-700',
            'COMPLETED': 'bg-emerald-100 text-emerald-700',
            'REVISION_REQUESTED': 'bg-red-100 text-red-700',
            'DISPUTED': 'bg-gray-100 text-gray-700',
            'REFUNDED': 'bg-slate-200 text-slate-600'
        };
        const labels = {
            'OFFER_PENDING': 'รอตอบรับ',
            'IN_PROGRESS': 'กำลังทำ',
            'SUBMITTED': 'รอตรวจงาน',
            'COMPLETED': 'เสร็จสิ้น',
            'REVISION_REQUESTED': 'ขอแก้ไข',
            'DISPUTED': 'ข้อพิพาท',
            'REFUNDED': 'คืนเงินแล้ว'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
                ${activeTab === id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}
            `}
        >
            <Icon size={16} />
            {label}
        </button>
    );


    const generateQRUrl = (phone, amount) => {
        // ใช้ Service ของ promptpay.io ซึ่งง่ายที่สุดสำหรับโปรเจกต์ส่งอาจารย์
        // รูปแบบ: https://promptpay.io/{เบอร์โทร}/{ยอดเงิน}.png
        const cleanPhone = phone.replace(/\D/g, ''); // ลบขีดออกให้เหลือแค่ตัวเลข
        return `https://promptpay.io/${cleanPhone}/${amount}.png`;
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans relative overflow-x-hidden" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">งานที่ฉันจ้าง (My Hires)</h1>
                        <p className="text-slate-500 text-sm">จัดการสถานะและอนุมัติงานได้ที่นี่</p>
                    </div>
                </div>

                {/* Controls & Filters */}
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
                        <TabButton id="ACTIVE" label="กำลังดำเนินการ" icon={Briefcase} />
                        <TabButton id="OFFER_PENDING" label="รอตอบรับ" icon={Clock} />
                        <TabButton id="COMPLETED" label="ประวัติเก่า" icon={CheckCircle} />
                    </div>
                    <div className="relative w-full md:w-64 px-2 md:px-0">
                        <Search className="absolute left-5 md:left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="ค้นหางาน..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                    </div>
                </div>

                {/* Table View */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                                    <th className="p-4 font-bold min-w-[200px]">ชื่องาน</th>
                                    <th className="p-4 font-bold min-w-[150px]">ฟรีแลนซ์</th>
                                    <th className="p-4 font-bold">ราคา</th>
                                    <th className="p-4 font-bold">สถานะ</th>
                                    <th className="p-4 font-bold text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="p-10 text-center"><LoadingSpinner /></td></tr>
                                ) : filteredWorks.length === 0 ? (
                                    <tr><td colSpan="5" className="p-10 text-center text-slate-400">ไม่พบรายการงานในหมวดหมู่นี้</td></tr>
                                ) : (
                                    filteredWorks.map(work => (
                                        <tr key={work.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => { setSelectedWork(work); setShowTransferForm(false); }}>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800 truncate max-w-[200px]">{work.jobTitle}</p>
                                                <p className="text-xs text-slate-400">ID: {work.id.slice(-6)}</p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={work.freelancerProfile?.user?.profileImageUrl ? `${BACKEND_URL}${work.freelancerProfile.user.profileImageUrl}` : "https://placehold.co/40"}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                        alt=""
                                                    />
                                                    <span className="text-sm font-medium text-slate-700">{work.freelancerProfile?.user?.firstName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-sm text-slate-600">฿{parseFloat(work.price).toLocaleString()}</td>
                                            <td className="p-4">{getStatusBadge(work.status)}</td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedWork(work); setShowTransferForm(false); }}
                                                    className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1"
                                                >
                                                    รายละเอียด <ChevronRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Quick View Drawer */}
            {selectedWork && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setSelectedWork(null)}></div>

                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">

                        {/* Header */}
                        <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 leading-tight">{selectedWork.jobTitle}</h2>
                                <p className="text-sm text-slate-500 mt-1">อัปเดตล่าสุด: {new Date(selectedWork.updatedAt).toLocaleDateString('th-TH')}</p>
                            </div>
                            <button onClick={() => setSelectedWork(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 space-y-6">
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                {showTransferForm && selectedWork.status === 'OFFER_PENDING' ? (
                                    <div className="space-y-4">

                                      

                                        <button onClick={() => setShowTransferForm(false)} className="text-xs text-blue-600 font-bold mb-2 flex items-center gap-1">
                                            ← กลับไปหน้ารายละเอียด
                                        </button>

                                        {/* ส่วนแสดง QR Code ที่เพิ่มเข้ามา */}
                                        <div className="bg-white p-4 rounded-2xl border-2 border-blue-500 flex flex-col items-center shadow-inner">
                                            <h4 className="text-sm font-bold text-blue-700 mb-3 text-center">สแกนจ่ายเงิน (PromptPay)</h4>

                                            {/* ดึงเบอร์จาก selectedWork.freelancerProfile.promptPayNumber */}
                                            {/* <img
                                               src={generateQRUrl(selectedWork.freelancerProfile?.promptPayNumber || "0812345678", selectedWork.price)}
                                               alt="QR Code"
                                                className="w-48 h-48 rounded-lg shadow-sm mb-3"
                                            /> */}

                                           // ส่วนแสดง QR Code ใน MyHiresPage.jsx
                                            <img
                                                src={`https://promptpay.io/${selectedWork.freelancerProfile?.promptPayNumber}/${selectedWork.price}.png`}
                                                alt="QR Code"
                                                className="w-48 h-48 rounded-lg"
                                                // 💡 ใส่ onError เพื่อเช็คว่าถ้าเบอร์ไม่มาให้โชว์รูปสำรอง
                                                onError={(e) => { e.target.src = "https://placehold.co/200?text=Waiting+for+Payment+Info"; }}
                                            />

                                            <div className="text-center">
                                                <p className="text-xs text-gray-500">โอนเข้าบัญชีกลาง (Admin)</p>
                                                <p className="text-lg font-mono font-bold text-slate-800">฿{parseFloat(selectedWork.price).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* ฟอร์มส่งสลิปเดิมของคุณ */}
                                        <PaymentTransferForm
                                            workId={selectedWork.id}
                                            amount={selectedWork.price}
                                            // ✅ ส่งเบอร์ที่ดึงมาจาก freelancerProfile
                                            promptPayId={selectedWork.freelancerProfile?.promptPayNumber}
                                            onFetchData={handlePaymentSuccess}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-xs font-bold text-slate-400 uppercase">สถานะงาน</p>
                                            {getStatusBadge(selectedWork.status)}
                                        </div>
                                        <div className="text-3xl font-bold text-slate-800 mb-6">฿{parseFloat(selectedWork.price).toLocaleString()}</div>

                                        <div className="space-y-3">
                                            {selectedWork.status === 'OFFER_PENDING' && !selectedWork.isPayerPaid && (
                                                <button
                                                    onClick={() => setShowTransferForm(true)}
                                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                                                >
                                                    ชำระเงิน & เริ่มงาน
                                                </button>
                                            )}

                                            {selectedWork.isPayerPaid && !selectedWork.isReceiverConfirmed && (
                                                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-center">
                                                    <p className="text-orange-700 text-sm font-bold">แจ้งโอนเงินเรียบร้อย</p>
                                                    <p className="text-xs text-orange-600">รอฟรีแลนซ์ตรวจสอบสลิปบัญชีกลาง</p>
                                                </div>
                                            )}

                                            {selectedWork.status === 'SUBMITTED' && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button onClick={() => handleStatusUpdate(selectedWork.id, 'COMPLETED')} className="py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">อนุมัติงาน</button>
                                                    <button onClick={() => handleStatusUpdate(selectedWork.id, 'REVISION_REQUESTED')} className="py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all">ขอแก้ไข</button>
                                                </div>
                                            )}

                                            {selectedWork.status === 'COMPLETED' && !selectedWork.review && (
                                                <button onClick={() => handleOpenReviewModal(selectedWork.id)} className="w-full py-3 bg-yellow-400 text-white font-bold rounded-xl hover:bg-yellow-500 shadow-lg shadow-yellow-200 transition-all flex items-center justify-center gap-2">
                                                    <Star size={18} fill="white" /> ให้คะแนนรีวิว
                                                </button>
                                            )}
                                        </div>

                                        {/* Dispute Section */}
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            {["IN_PROGRESS", "SUBMITTED", "REVISION_REQUESTED"].includes(selectedWork.status) && (
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-400 mb-2">หากพบปัญหา สามารถแจ้งเจ้าหน้าที่ได้</p>
                                                    <button onClick={() => setShowDisputeModal(true)} className="text-red-500 hover:text-red-700 underline text-sm font-medium transition-colors flex items-center justify-center gap-1 mx-auto">
                                                        <MessageSquare size={14} /> แจ้งปัญหา / ขอคืนเงิน
                                                    </button>
                                                </div>
                                            )}

                                            {selectedWork.status === "DISPUTED" && (
                                                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex flex-col gap-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-red-100 rounded-full text-red-600"><MessageSquare size={20} /></div>
                                                        <div>
                                                            <h4 className="font-bold text-red-800 text-sm">งานนี้อยู่ระหว่างข้อพิพาท</h4>
                                                            <p className="text-xs text-red-600 mt-1">กรุณาพูดคุยกับเจ้าหน้าที่</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => navigate(`/dispute-chat/${selectedWork.disputeTicket?.id}`)} className="w-full py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all shadow-sm">ไปที่ห้องระงับข้อพิพาท</button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <Link to={`/chat`} className="flex items-center justify-center gap-2 w-full py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all"><MessageSquare size={18} /> เปิดห้องแชท</Link>

                            <div>
                                <h3 className="font-bold text-slate-800 mb-2">รายละเอียด</h3>
                                <div className="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100">{selectedWork.description || "ไม่มีรายละเอียดเพิ่มเติม"}</div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-800 mb-2">ฟรีแลนซ์</h3>
                                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                                    <img src={selectedWork.freelancerProfile?.user?.profileImageUrl ? `${BACKEND_URL}${selectedWork.freelancerProfile.user.profileImageUrl}` : "https://placehold.co/50"} className="w-10 h-10 rounded-full object-cover" alt="" />
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{selectedWork.freelancerProfile?.user?.firstName} {selectedWork.freelancerProfile?.user?.lastName}</p>
                                        <p className="text-xs text-slate-500">Freelancer</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {paymentData && (
                <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} paymentData={paymentData} onSuccess={handlePaymentSuccess} />
            )}

            <Modal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title="ให้คะแนนและรีวิว">
                <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
                    <div className="text-center">
                        <label className="block text-base font-bold text-slate-800 mb-3">ความพึงพอใจ</label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => setReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110 p-1">
                                    <Star size={40} className={`transition-colors ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="เขียนรีวิว..." rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-100 outline-none" required />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setIsReviewModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">ยกเลิก</button>
                        <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">ส่งรีวิว</button>
                    </div>
                </form>
            </Modal>

            {showDisputeModal && selectedWork && (
                <CreateDisputeModal workId={selectedWork.id} onClose={() => setShowDisputeModal(false)} onSuccess={() => { fetchHires(); setShowDisputeModal(false); setSelectedWork(null); }} />
            )}
        </div>
    );
};

export default MyHiresPage;