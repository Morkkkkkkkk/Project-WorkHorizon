
// src/pages/FreelancerWorkPage.jsx
/* === FREELANCER WORK MANAGEMENT PAGE === */
// ✅ หน้าสำหรับ Freelancer เพิ่มงานที่ทำเสร็จแล้ว
// ✅ แสดงรายการงานที่เพิ่มไว้แล้วพร้อมสถานะรีวิว

import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, CheckCircle, Star, User, Calendar, Trash2, Clock, Search, ChevronDown, Filter } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { freelancerApi } from '../api/freelancerApi';
import Modal from '../components/Modal'; // Assuming you have a Modal component
// import CreateWorkForm from '../components/CreateWorkForm'; // Reusing the form - not used directly, ManualCreateWorkForm is defined below
import { toast } from 'react-toastify';

const FreelancerWorkPage = () => {
    // ✅ State สำหรับ Works List
    const [works, setWorks] = useState([]);
    const [activeTab, setActiveTab] = useState('ACTIVE'); // ACTIVE | OFFER_PENDING | COMPLETED
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ Search State
    const [searchTerm, setSearchTerm] = useState('');

    // ✅ Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // ✅ Fetch completed works
    useEffect(() => {
        fetchWorks();
    }, []);

    const fetchWorks = async () => {
        setIsLoading(true);
        try {
            const data = await freelancerApi.getMyProfile();
            // ✅ NOTE: ต้อง update backend เพื่อ include completed works
            setWorks(data.completedWorks || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Handle Create Work (from Modal)
    const handleCreateWork = async (workData) => {
        try {
            // ✅ ใช้ API client
            await freelancerApi.createOffer(workData);
            setIsCreateModalOpen(false);
            fetchWorks();
            toast.success('เพิ่มงานใหม่เรียบร้อยแล้ว');
        } catch (err) {
            toast.error(err.message || 'เกิดข้อผิดพลาด');
        }
    };

    // ✅ Handle Status Update
    const handleStatusUpdate = async (workId, newStatus) => {
        if (!window.confirm(`คุณต้องการเปลี่ยนสถานะเป็น "${newStatus === 'COMPLETED' ? 'เสร็จสิ้น' : 'รอดำเนินการ'}" ใช่หรือไม่ ? `)) return;

        try {
            await freelancerApi.updateWorkStatus(workId, newStatus);
            fetchWorks();
            toast.success('อัปเดตสถานะเรียบร้อยแล้ว');
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ✅ Handle Delete
    const handleDelete = async (workId) => {
        if (!window.confirm('คุณต้องการลบงานนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;

        try {
            await freelancerApi.deleteWork(workId);
            fetchWorks();
            toast.success('ลบงานเรียบร้อยแล้ว');
        } catch (err) {
            toast.error(err.message);
        }
    };

    // ✅ Filter works based on active tab AND search term
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
            (work.jobSeeker?.firstName || '').toLowerCase().includes(searchLower) ||
            (work.jobSeeker?.lastName || '').toLowerCase().includes(searchLower);

        return matchesTab && matchesSearch;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'OFFER_PENDING': return { label: 'รอตอบรับ', color: 'bg-orange-50 text-orange-700 border-orange-100' };
            case 'IN_PROGRESS': return { label: 'กำลังทำงาน', color: 'bg-blue-50 text-blue-700 border-blue-100' };
            case 'SUBMITTED': return { label: 'รอตรวจสอบ', color: 'bg-purple-50 text-purple-700 border-purple-100' };
            case 'REVISION_REQUESTED': return { label: 'แก้ไขงาน', color: 'bg-red-50 text-red-700 border-red-100' };
            case 'COMPLETED': return { label: 'เสร็จสิ้น', color: 'bg-green-50 text-green-700 border-green-100' };
            case 'DISPUTED': return { label: 'มีข้อพิพาท', color: 'bg-gray-50 text-gray-700 border-gray-100' };
            default: return { label: status, color: 'bg-slate-50 text-slate-700 border-slate-100' };
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
            <div className="container mx-auto px-4 max-w-5xl">

                {/* ✅ Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">จัดการผลงาน</h1>
                        <p className="text-slate-500">ติดตามสถานะงานและประวัติการทำงานของคุณ</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} />
                        เพิ่มงานใหม่
                    </button>
                </div>

                {/* ✅ Search & Filter Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">

                    {/* Search Input */}
                    <div className="relative flex-1 w-full">
                        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่องาน หรือ ชื่อลูกค้า..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Tabs (as Filter Buttons) */}
                    <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('ACTIVE')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'ACTIVE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Briefcase size={16} />
                            งานที่กำลังทำ
                        </button>
                        <button
                            onClick={() => setActiveTab('OFFER_PENDING')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'OFFER_PENDING' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Clock size={16} />
                            รอตอบรับ
                        </button>
                        <button
                            onClick={() => setActiveTab('COMPLETED')}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'COMPLETED' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <CheckCircle size={16} />
                            เสร็จสิ้น
                        </button>
                    </div>
                </div>

                {/* ✅ Works List */}
                <div className="space-y-4">
                    {isLoading ? (
                        <LoadingSpinner text="กำลังโหลดผลงาน..." />
                    ) : filteredWorks.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Filter size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">ไม่พบรายการงาน</h3>
                            <p className="text-slate-500">ลองเปลี่ยนคำค้นหา หรือเพิ่มงานใหม่</p>
                        </div>
                    ) : (
                        filteredWorks.map((work) => {
                            const badge = getStatusBadge(work.status);
                            return (
                                <div
                                    key={work.id}
                                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">

                                        {/* Work Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {work.jobTitle}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
                                                    {badge.label}
                                                </span>
                                            </div>

                                            <p className="text-slate-600 text-sm mb-3 line-clamp-2">{work.description || '-'}</p>

                                            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                                    <User size={14} />
                                                    <span>ลูกค้า: {work.jobSeeker?.firstName} {work.jobSeeker?.lastName}</span>
                                                </div>
                                                {work.completedAt && (
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                                        <Calendar size={14} />
                                                        <span>{new Date(work.completedAt).toLocaleDateString('th-TH')}</span>
                                                    </div>
                                                )}
                                                {work.price && (
                                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                                        <span>฿ {parseFloat(work.price).toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions & Status */}
                                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">

                                            {/* Action Buttons based on Status */}
                                            {work.status === 'IN_PROGRESS' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(work.id, 'SUBMITTED')}
                                                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all"
                                                >
                                                    ส่งงาน
                                                </button>
                                            )}

                                            {work.status === 'REVISION_REQUESTED' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(work.id, 'SUBMITTED')}
                                                    className="px-3 py-1.5 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-all"
                                                >
                                                    ส่งงานแก้ไข
                                                </button>
                                            )}

                                            {/* Review Status (Only if Completed) */}
                                            {work.status === 'COMPLETED' && (
                                                work.review ? (
                                                    <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                                        <Star size={14} className="fill-yellow-500" />
                                                        <span className="text-sm font-bold">{work.review.rating}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium px-2">รอรีวิว</span>
                                                )
                                            )}

                                            {/* Delete Button (Only if Offer Pending or Completed) */}
                                            {['OFFER_PENDING', 'COMPLETED', 'CANCELLED'].includes(work.status) && (
                                                <button
                                                    onClick={() => handleDelete(work.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="ลบรายการ"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* ✅ Create Work Modal */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="เพิ่มงานใหม่"
                >
                    {/* Note: We need a way to select Job Seeker if creating from here manually */}
                    {/* For simplicity, we reuse CreateWorkForm but we might need an input for Job Seeker ID if not provided */}
                    <div className="p-4">
                        <p className="text-sm text-slate-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            💡 แนะนำ: คุณสามารถสร้างงานได้โดยตรงจากหน้า <b>แชท</b> กับลูกค้า เพื่อความสะดวกรวดเร็ว
                        </p>

                        {/* Simple Form for Manual Entry */}
                        <ManualCreateWorkForm
                            onSubmit={handleCreateWork}
                            onCancel={() => setIsCreateModalOpen(false)}
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
};

const ManualCreateWorkForm = ({ onSubmit, onCancel }) => {
    const [jobSeekerId, setJobSeekerId] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('1');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('OFFER_PENDING');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ jobSeekerId, jobTitle, description, price, duration, status });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">User ID ลูกค้า</label>
                <input
                    type="text"
                    value={jobSeekerId}
                    onChange={e => setJobSeekerId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    placeholder="ระบุ ID ลูกค้า"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ชื่องาน</label>
                <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    placeholder="ชื่องาน"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">ราคา (บาท)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">ระยะเวลา (วัน)</label>
                    <input
                        type="number"
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        required
                        placeholder="1"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">รายละเอียดงาน (ไม่บังคับ)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="อธิบายสั้นๆ เกี่ยวกับงานที่ทำ..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg resize-none"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">สถานะ</label>
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                >
                    <option value="OFFER_PENDING">รอตอบรับ</option>
                    <option value="COMPLETED">เสร็จสิ้น (บันทึกย้อนหลัง)</option>
                </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-100 rounded-lg">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">บันทึก</button>
            </div>
        </form>
    );
};

export default FreelancerWorkPage;

