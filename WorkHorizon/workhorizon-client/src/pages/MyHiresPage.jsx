// src/pages/MyHiresPage.jsx
import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Star, Search, Filter, Clock } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { freelancerApi } from '../api/freelancerApi';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import MyHireCard from '../components/MyHireCard';
import PaymentModal from '../components/PaymentModal'; // ✅ 1. Import Payment Modal

const MyHiresPage = () => {
    const [works, setWorks] = useState([]);
    const [activeTab, setActiveTab] = useState('ACTIVE');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedWorkId, setSelectedWorkId] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

    // ✅ 2. Payment Modal State (เพิ่มใหม่)
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentData, setPaymentData] = useState(null);

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
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ 3. แก้ไขฟังก์ชันนี้เพื่อดักจับการจ่ายเงิน
    const handleStatusUpdate = async (workId, newStatus) => {
        
        // --- CASE A: ถ้าเป็นการเริ่มงาน (IN_PROGRESS) ต้องจ่ายเงินก่อน ---
        if (newStatus === 'IN_PROGRESS') {
            const workToPay = works.find(w => w.id === workId);
            if (workToPay) {
                // เตรียมข้อมูลสำหรับ Modal จ่ายเงิน
                setPaymentData({
                    title: `ชำระเงินเพื่อเริ่มงาน: ${workToPay.jobTitle}`,
                    amount: workToPay.price || 0, // ยอดเงินที่ตกลงกัน
                    receiverId: workToPay.freelancerId, // ปลายทาง (แต่ระบบจะกันไว้ก่อน)
                    workId: workId,
                    // flag พิเศษเพื่อให้ Backend รู้ว่าเป็น Escrow (ถ้ามี)
                });
                setIsPaymentOpen(true); // เปิด Modal
            }
            return; // ⛔ หยุดทำงานตรงนี้ รอจ่ายเงินเสร็จค่อยไปต่อ
        }

        // --- CASE B: สถานะอื่นๆ (ไม่ต้องจ่ายเงิน) ---
        let confirmMessage = '';
        if (newStatus === 'REVISION_REQUESTED') confirmMessage = 'คุณต้องการ "ส่งคำขอแก้ไขงาน" ใช่หรือไม่?';
        if (newStatus === 'COMPLETED') confirmMessage = 'คุณต้องการ "อนุมัติงาน" และเสร็จสิ้นโปรเจกต์ใช่หรือไม่? \n(ระบบจะโอนเงินให้ฟรีแลนซ์ทันที)';

        if (confirmMessage && !window.confirm(confirmMessage)) return;

        try {
            await freelancerApi.updateWorkStatus(workId, newStatus);
            fetchHires();
            
            if (newStatus === 'COMPLETED') {
                toast.success('อนุมัติงานเรียบร้อย! โอนเงินให้ฟรีแลนซ์แล้ว 🎉');
            } else {
                toast.success('อัปเดตสถานะเรียบร้อยแล้ว');
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ✅ 4. Callback เมื่อจ่ายเงินสำเร็จ
    const handlePaymentSuccess = async () => {
        // เมื่อจ่ายเงินผ่าน Modal เสร็จแล้ว -> อัปเดตสถานะเป็น IN_PROGRESS
        try {
            if (paymentData && paymentData.workId) {
                await freelancerApi.updateWorkStatus(paymentData.workId, 'IN_PROGRESS');
                toast.success('ชำระเงินเรียบร้อย เริ่มต้นโปรเจกต์แล้ว! 🚀');
                fetchHires(); // โหลดข้อมูลใหม่
                setActiveTab('ACTIVE'); // ย้ายไปแท็บงานที่กำลังทำ
            }
        } catch (err) {
            toast.error("เกิดข้อผิดพลาดในการเริ่มงาน: " + err.message);
        }
    };

    // ... (Review Logic เดิม เหมือนเดิมทุกอย่าง) ...
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
            toast.success('รีวิวเรียบร้อยแล้ว ขอบคุณครับ!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ... (Filter Logic เดิม) ...
    const filteredWorks = works.filter(work => {
        let matchesTab = false;
        if (activeTab === 'ACTIVE') {
            matchesTab = ['IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'DISPUTED'].includes(work.status);
        } else {
            matchesTab = work.status === activeTab;
        }

        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            work.jobTitle.toLowerCase().includes(searchLower) ||
            (work.freelancerProfile?.user?.firstName || '').toLowerCase().includes(searchLower) ||
            (work.freelancerProfile?.user?.lastName || '').toLowerCase().includes(searchLower);

        return matchesTab && matchesSearch;
    });

    const TabButton = ({ id, label, icon: Icon, colorClass }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`
                flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap border
                ${activeTab === id
                    ? `bg-white ${colorClass} shadow-sm border-slate-200`
                    : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-100 hover:text-slate-700'}
            `}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-10" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                            งานที่ฉันจ้าง
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium">ติดตามสถานะงานและจัดการการจ้างงานของคุณ</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="space-y-4 mb-8">
                    <div className="bg-slate-200/50 p-1.5 rounded-2xl flex overflow-x-auto">
                        <TabButton id="ACTIVE" label="งานที่กำลังทำ" icon={Briefcase} colorClass="text-blue-600" />
                        <TabButton id="OFFER_PENDING" label="ข้อเสนอที่รอตอบรับ" icon={Clock} colorClass="text-orange-600" />
                        <TabButton id="COMPLETED" label="ประวัติการจ้างงาน" icon={CheckCircle} colorClass="text-emerald-600" />
                    </div>

                    <div className="relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาตามชื่องาน หรือ ชื่อฟรีแลนซ์..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="py-20 text-center">
                            <LoadingSpinner text="กำลังโหลดข้อมูล..." />
                        </div>
                    ) : filteredWorks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Filter size={40} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1">ไม่พบรายการงาน</h3>
                            <p className="text-slate-500">
                                {searchTerm ? 'ลองเปลี่ยนคำค้นหา หรือเปลี่ยนตัวกรอง' : 'คุณยังไม่มีงานในสถานะนี้'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5">
                            {filteredWorks.map((work) => (
                                <MyHireCard
                                    key={work.id}
                                    work={work}
                                    onStatusUpdate={handleStatusUpdate}
                                    onReview={handleOpenReviewModal}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Summary */}
                {!isLoading && filteredWorks.length > 0 && (
                    <div className="mt-6 text-center text-sm text-slate-400">
                        แสดงทั้งหมด {filteredWorks.length} รายการ
                    </div>
                )}

                {/* Review Modal */}
                <Modal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    title="ให้คะแนนและรีวิวฟรีแลนซ์"
                >
                    <form onSubmit={handleSubmitReview} className="p-6 space-y-6">
                        {/* ... (Review Form Content เดิม) ... */}
                        <div className="text-center">
                            <label className="block text-base font-bold text-slate-800 mb-3">ความพึงพอใจของคุณ</label>
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110 p-1"
                                    >
                                        <Star
                                            size={40}
                                            className={`transition-colors ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'text-slate-200'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">ความคิดเห็นเพิ่มเติม</label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="บอกเล่าความประทับใจ หรือสิ่งที่ควรปรับปรุง..."
                                rows={4}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setIsReviewModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">ยกเลิก</button>
                            <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">ส่งรีวิว</button>
                        </div>
                    </form>
                </Modal>

                {/* ✅ 5. Payment Modal Component */}
                {paymentData && (
                    <PaymentModal
                        isOpen={isPaymentOpen}
                        onClose={() => setIsPaymentOpen(false)}
                        paymentData={paymentData}
                        onSuccess={handlePaymentSuccess}
                    />
                )}

            </div>
        </div>
    );
};

export default MyHiresPage;