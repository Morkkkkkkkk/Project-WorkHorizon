// src/pages/MyHiresPage.jsx
import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Star, User, Calendar, Clock, Search, Filter, MessageSquare, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { freelancerApi } from '../api/freelancerApi';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const MyHiresPage = () => {
    const [works, setWorks] = useState([]);
    const [activeTab, setActiveTab] = useState('ACTIVE'); // ACTIVE | OFFER_PENDING | COMPLETED
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedWorkId, setSelectedWorkId] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');

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

    const handleStatusUpdate = async (workId, newStatus) => {
        let confirmMessage = '';
        if (newStatus === 'IN_PROGRESS') confirmMessage = 'คุณต้องการ "ตอบรับใบเสนอราคา" และเริ่มงานใช่หรือไม่?';
        if (newStatus === 'REVISION_REQUESTED') confirmMessage = 'คุณต้องการ "ส่งคำขอแก้ไขงาน" ใช่หรือไม่?';
        if (newStatus === 'COMPLETED') confirmMessage = 'คุณต้องการ "อนุมัติงาน" และเสร็จสิ้นโปรเจกต์ใช่หรือไม่?';

        if (!window.confirm(confirmMessage)) return;

        try {
            await freelancerApi.updateWorkStatus(workId, newStatus);
            fetchHires();
            toast.success('อัปเดตสถานะเรียบร้อยแล้ว');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleOpenReviewModal = (workId) => {
        setSelectedWorkId(workId);
        setReviewRating(5);
        setReviewComment('');
        setIsReviewModalOpen(true);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            // Find freelancerId from works
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

    // Filter works
    const filteredWorks = works.filter(work => {
        // 1. Filter by Tab
        let matchesTab = false;
        if (activeTab === 'ACTIVE') {
            matchesTab = ['IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'DISPUTED'].includes(work.status);
        } else {
            matchesTab = work.status === activeTab;
        }

        // 2. Filter by Search
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            work.jobTitle.toLowerCase().includes(searchLower) ||
            (work.freelancerProfile?.user?.firstName || '').toLowerCase().includes(searchLower) ||
            (work.freelancerProfile?.user?.lastName || '').toLowerCase().includes(searchLower);

        return matchesTab && matchesSearch;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'OFFER_PENDING': return { label: 'รอตอบรับข้อเสนอ', color: 'bg-orange-50 text-orange-700 border-orange-100' };
            case 'IN_PROGRESS': return { label: 'กำลังดำเนินการ', color: 'bg-blue-50 text-blue-700 border-blue-100' };
            case 'SUBMITTED': return { label: 'รอตรวจสอบงาน', color: 'bg-purple-50 text-purple-700 border-purple-100' };
            case 'REVISION_REQUESTED': return { label: 'รอแก้ไขงาน', color: 'bg-red-50 text-red-700 border-red-100' };
            case 'COMPLETED': return { label: 'เสร็จสิ้น', color: 'bg-green-50 text-green-700 border-green-100' };
            case 'DISPUTED': return { label: 'มีข้อพิพาท', color: 'bg-gray-50 text-gray-700 border-gray-100' };
            default: return { label: status, color: 'bg-slate-50 text-slate-700 border-slate-100' };
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900">งานที่ฉันจ้าง</h1>
                    <p className="text-slate-500">ติดตามสถานะงานที่คุณจ้างฟรีแลนซ์</p>
                </div>

                {/* Search & Filter */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่องาน หรือ ชื่อฟรีแลนซ์..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('ACTIVE')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'ACTIVE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Briefcase size={16} />
                            งานที่กำลังทำ
                        </button>
                        <button
                            onClick={() => setActiveTab('OFFER_PENDING')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'OFFER_PENDING' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Clock size={16} />
                            ข้อเสนอที่รอตอบรับ
                        </button>
                        <button
                            onClick={() => setActiveTab('COMPLETED')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'COMPLETED' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <CheckCircle size={16} />
                            ประวัติการจ้างงาน
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <LoadingSpinner text="กำลังโหลดข้อมูล..." />
                    ) : filteredWorks.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Filter size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">ไม่พบรายการงาน</h3>
                            <p className="text-slate-500">คุณยังไม่มีงานในสถานะนี้</p>
                        </div>
                    ) : (
                        filteredWorks.map((work) => {
                            const badge = getStatusBadge(work.status);
                            const freelancer = work.freelancerProfile?.user;

                            return (
                                <div key={work.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row gap-6">

                                        {/* Freelancer Info */}
                                        <div className="flex items-start gap-4 md:w-1/4 min-w-[200px]">
                                            <img
                                                src={freelancer?.profileImageUrl ? `http://localhost:8081${freelancer.profileImageUrl}` : "https://via.placeholder.com/150"}
                                                alt="Freelancer"
                                                className="w-12 h-12 rounded-full object-cover border border-slate-200"
                                            />
                                            <div>
                                                <h4 className="font-bold text-slate-900">{freelancer?.firstName} {freelancer?.lastName}</h4>
                                                <p className="text-xs text-slate-500">Freelancer</p>
                                                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg w-fit">
                                                    <MessageSquare size={12} />
                                                    <span>แชท</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Job Info */}
                                        <div className="flex-1 border-l border-slate-100 pl-0 md:pl-6 pt-4 md:pt-0 border-t md:border-t-0 mt-4 md:mt-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-slate-900">{work.jobTitle}</h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
                                                    {badge.label}
                                                </span>
                                            </div>

                                            <p className="text-slate-600 text-sm mb-4">{work.description || '-'}</p>

                                            <div className="flex flex-wrap gap-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-700">ราคา:</span>
                                                    <span>฿{parseFloat(work.price).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-700">ระยะเวลา:</span>
                                                    <span>{work.duration} วัน</span>
                                                </div>
                                                {work.completedAt && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-700">เสร็จสิ้นเมื่อ:</span>
                                                        <span>{new Date(work.completedAt).toLocaleDateString('th-TH')}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="mt-4 flex flex-wrap gap-3">
                                                {work.status === 'OFFER_PENDING' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(work.id, 'IN_PROGRESS')}
                                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
                                                    >
                                                        ตอบรับข้อเสนอ & เริ่มงาน
                                                    </button>
                                                )}

                                                {work.status === 'SUBMITTED' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(work.id, 'COMPLETED')}
                                                            className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-all shadow-sm shadow-green-200"
                                                        >
                                                            อนุมัติงาน (เสร็จสิ้น)
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(work.id, 'REVISION_REQUESTED')}
                                                            className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-all"
                                                        >
                                                            ขอแก้ไขงาน
                                                        </button>
                                                    </>
                                                )}

                                                {work.status === 'COMPLETED' && !work.review && (
                                                    <button
                                                        onClick={() => handleOpenReviewModal(work.id)}
                                                        className="px-4 py-2 bg-yellow-500 text-white text-sm font-bold rounded-lg hover:bg-yellow-600 transition-all shadow-sm shadow-yellow-200 flex items-center gap-2"
                                                    >
                                                        <Star size={16} className="fill-white" />
                                                        ให้คะแนนรีวิว
                                                    </button>
                                                )}

                                                {work.status === 'COMPLETED' && work.review && (
                                                    <div className="flex items-center gap-2 text-yellow-500 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                                                        <Star size={16} className="fill-yellow-500" />
                                                        <span className="font-bold">คุณให้คะแนน {work.review.rating}/5</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Review Modal */}
                <Modal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    title="ให้คะแนนและรีวิวฟรีแลนซ์"
                >
                    <form onSubmit={handleSubmitReview} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">คะแนนความพึงพอใจ</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={32}
                                            className={`${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">ความคิดเห็นเพิ่มเติม</label>
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="บอกเล่าความประทับใจ หรือสิ่งที่ควรปรับปรุง..."
                                rows={4}
                                className="w-full px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsReviewModalOpen(false)}
                                className="px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-600"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                            >
                                ส่งรีวิว
                            </button>
                        </div>
                    </form>
                </Modal>

            </div>
        </div>
    );
};

export default MyHiresPage;
