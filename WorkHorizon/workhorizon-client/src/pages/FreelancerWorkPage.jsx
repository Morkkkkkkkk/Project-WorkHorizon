// src/pages/FreelancerWorkPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, Briefcase, CheckCircle, Star, User, Calendar, 
  Trash2, Clock, Search, ChevronRight, X, MessageSquare, PlayCircle, Package 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { freelancerApi } from '../api/freelancerApi';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '../api/apiClient';
import CreateDisputeModal from "../components/CreateDisputeModal"; 

const FreelancerWorkPage = () => {
    const [works, setWorks] = useState([]);
    const [activeTab, setActiveTab] = useState('ACTIVE'); 
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWork, setSelectedWork] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorks();
    }, []);

    const fetchWorks = async () => {
        setIsLoading(true);
        try {
            // ดึงงานทั้งหมดของ Freelancer
            const data = await freelancerApi.getMyWorks(); 
            setWorks(data || []);
        } catch (err) {
            console.error(err);
            toast.error("โหลดข้อมูลไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateWork = async (workData) => {
        try {
            await freelancerApi.createWork(workData);
            setIsCreateModalOpen(false);
            fetchWorks();
            toast.success('เพิ่มงานใหม่เรียบร้อยแล้ว');
        } catch (err) {
            toast.error(err.message || 'เกิดข้อผิดพลาด');
        }
    };

    const handleStatusUpdate = async (workId, newStatus) => {
        let confirmMsg = `ยืนยันการเปลี่ยนสถานะ?`;
        if (newStatus === 'IN_PROGRESS') confirmMsg = 'ยืนยันการ "รับงาน" และเริ่มดำเนินการ?';
        if (newStatus === 'SUBMITTED') confirmMsg = 'ยืนยันการ "ส่งงาน" ให้ลูกค้าตรวจสอบ?';

        if (!window.confirm(confirmMsg)) return;

        try {
            await freelancerApi.updateWorkStatus(workId, newStatus);
            fetchWorks();
            setSelectedWork(null); 
            toast.success('อัปเดตสถานะเรียบร้อยแล้ว');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (workId) => {
        if (!window.confirm('คุณต้องการลบงานนี้ใช่หรือไม่?')) return;

        try {
            await freelancerApi.deleteWork(workId);
            fetchWorks();
            setSelectedWork(null);
            toast.success('ลบงานเรียบร้อยแล้ว');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const filteredWorks = works.filter(work => {
        const matchesSearch =
            work.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (work.jobSeeker?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase());

        let matchesTab = false;
        if (activeTab === 'ACTIVE') {
            matchesTab = ['IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'DISPUTED'].includes(work.status);
        } else if (activeTab === 'OFFER_PENDING') {
            matchesTab = work.status === 'OFFER_PENDING';
        } else {
            matchesTab = ['COMPLETED', 'REFUNDED', 'CANCELLED'].includes(work.status);
        }

        return matchesTab && matchesSearch;
    });

    const getStatusBadge = (status) => {
        const styles = {
            'OFFER_PENDING': 'bg-orange-100 text-orange-700',
            'IN_PROGRESS': 'bg-blue-100 text-blue-700',
            'SUBMITTED': 'bg-purple-100 text-purple-700',
            'REVISION_REQUESTED': 'bg-red-100 text-red-700',
            'COMPLETED': 'bg-emerald-100 text-emerald-700',
            'DISPUTED': 'bg-gray-100 text-gray-700',
            'REFUNDED': 'bg-slate-200 text-slate-600',
            'CANCELLED': 'bg-slate-200 text-slate-500'
        };
        const labels = {
            'OFFER_PENDING': 'รอตอบรับ/เริ่มงาน',
            'IN_PROGRESS': 'กำลังทำ',
            'SUBMITTED': 'รอตรวจ',
            'REVISION_REQUESTED': 'ต้องแก้ไข',
            'COMPLETED': 'เสร็จสิ้น',
            'DISPUTED': 'ข้อพิพาท',
            'REFUNDED': 'คืนเงินแล้ว',
            'CANCELLED': 'ยกเลิกแล้ว'
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
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

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 font-sans relative overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">จัดการงาน (Freelancer Work)</h1>
                        <p className="text-slate-500 text-sm">ติดตามสถานะงานที่คุณรับทำ</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> เพิ่มงานใหม่
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
                        <TabButton id="ACTIVE" label="งานที่กำลังทำ" icon={Briefcase} />
                        <TabButton id="OFFER_PENDING" label="รอตอบรับ" icon={Clock} />
                        <TabButton id="COMPLETED" label="ประวัติ/เสร็จสิ้น" icon={CheckCircle} />
                    </div>
                    <div className="relative w-full md:w-64 px-2 md:px-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="ค้นหางาน / ลูกค้า..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                    <th className="p-4 font-bold min-w-[150px]">ลูกค้า</th>
                                    <th className="p-4 font-bold">ราคา</th>
                                    <th className="p-4 font-bold">สถานะ</th>
                                    <th className="p-4 font-bold text-right">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr><td colSpan="5" className="p-10 text-center"><LoadingSpinner /></td></tr>
                                ) : filteredWorks.length === 0 ? (
                                    <tr><td colSpan="5" className="p-10 text-center text-slate-400">ไม่พบรายการงาน</td></tr>
                                ) : (
                                    filteredWorks.map((work) => (
                                        <tr key={work.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedWork(work)}>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800 truncate max-w-[200px]">{work.jobTitle}</p>
                                                <p className="text-xs text-slate-400 truncate max-w-[200px]">{work.description || '-'}</p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <img src={work.jobSeeker?.profileImageUrl ? `${BACKEND_URL}${work.jobSeeker.profileImageUrl}` : "https://placehold.co/40"} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                    <span className="text-sm font-medium text-slate-700">{work.jobSeeker?.firstName || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-sm text-slate-600">฿{parseFloat(work.price).toLocaleString()}</td>
                                            <td className="p-4">{getStatusBadge(work.status)}</td>
                                            <td className="p-4 text-right">
                                                <button className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1">
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
                            
                            {/* Status & Price */}
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase">สถานะงาน</p>
                                    {getStatusBadge(selectedWork.status)}
                                </div>
                                <div className="text-3xl font-bold text-slate-800 mb-6">฿{parseFloat(selectedWork.price).toLocaleString()}</div>
                                
                                {/* 🟢 FREELANCER ACTION BUTTONS (แก้ไขใหม่) */}
                                <div className="space-y-3">
                                    
                                    {/* CASE 1: OFFER_PENDING - เช็คว่าลูกค้าจ่ายเงินหรือยัง */}
                                    {selectedWork.status === 'OFFER_PENDING' && (
                                        selectedWork.isPayerPaid ? (
                                            // 1.1 จ่ายแล้ว -> ปุ่มรับงาน (สีน้ำเงิน)
                                            <button 
                                                onClick={() => handleStatusUpdate(selectedWork.id, 'IN_PROGRESS')}
                                                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                <PlayCircle size={20} /> รับงาน & เริ่มทำทันที
                                            </button>
                                        ) : (
                                            // 1.2 ยังไม่จ่าย -> ข้อความแจ้งเตือน (สีส้ม)
                                            <div className="flex flex-col gap-2">
                                                <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl text-center">
                                                    <Clock size={24} className="text-orange-400 mx-auto mb-1" />
                                                    <p className="text-sm font-bold text-orange-700">รอผู้ว่าจ้างชำระเงิน</p>
                                                    <p className="text-xs text-orange-600">เมื่อชำระแล้ว ปุ่มรับงานจะปรากฏขึ้น</p>
                                                </div>
                                                {/* ให้ปุ่มยกเลิก เผื่อ Freelance อยากถอน Offer */}
                                                <button 
                                                    onClick={() => handleDelete(selectedWork.id)}
                                                    className="w-full py-2 bg-white border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 text-sm"
                                                >
                                                    <Trash2 size={16} className="inline mr-1" /> ยกเลิกใบเสนอนี้
                                                </button>
                                            </div>
                                        )
                                    )}

                                    {/* CASE 2: กำลังทำ -> ส่งงาน */}
                                    {selectedWork.status === 'IN_PROGRESS' && (
                                        <button 
                                            onClick={() => handleStatusUpdate(selectedWork.id, 'SUBMITTED')}
                                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Package size={20} /> ส่งมอบงาน (Submit Work)
                                        </button>
                                    )}

                                    {/* CASE 3: ต้องแก้ไข */}
                                    {selectedWork.status === 'REVISION_REQUESTED' && (
                                        <>
                                            <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-2 text-sm text-red-700">
                                                <p className="font-bold flex items-center gap-1"><Clock size={14}/> ลูกค้าขอให้แก้ไขงาน</p>
                                                <p className="mt-1">เมื่อแก้ไขเสร็จแล้ว กดปุ่มด้านล่างเพื่อส่งงานอีกครั้ง</p>
                                            </div>
                                            <button 
                                                onClick={() => handleStatusUpdate(selectedWork.id, 'SUBMITTED')}
                                                className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all"
                                            >
                                                ส่งงานที่แก้ไขแล้ว
                                            </button>
                                        </>
                                    )}

                                    {/* CASE 4: ยกเลิกแล้ว -> ลบทิ้ง */}
                                    {selectedWork.status === 'CANCELLED' && (
                                        <button 
                                            onClick={() => handleDelete(selectedWork.id)}
                                            className="w-full py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={18} /> ลบรายการนี้
                                        </button>
                                    )}
                                </div>

                                {/* Link to Dispute / Chat */}
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    {["IN_PROGRESS", "SUBMITTED", "REVISION_REQUESTED"].includes(selectedWork.status) && (
                                        <div className="text-center">
                                            <button onClick={() => setShowDisputeModal(true)} className="text-red-500 hover:text-red-700 underline text-sm font-medium flex items-center justify-center gap-1 mx-auto">
                                                <MessageSquare size={14} /> แจ้งปัญหา / ข้อพิพาท
                                            </button>
                                        </div>
                                    )}
                                    {selectedWork.status === "DISPUTED" && (
                                        <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                                            <p className="text-red-700 font-bold text-sm">งานนี้อยู่ระหว่างข้อพิพาท</p>
                                            <button onClick={() => navigate(`/dispute-chat/${selectedWork.disputeTicket?.id}`)} className="mt-2 w-full py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">
                                                ไปที่ห้องระงับข้อพิพาท
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Chat Link */}
                            <Link to={`/chat/${selectedWork.serviceConversationId || '#'}`} className="flex items-center justify-center gap-2 w-full py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all">
                                <MessageSquare size={18} /> เปิดห้องแชท
                            </Link>

                            {/* Description */}
                            <div>
                                <h3 className="font-bold text-slate-800 mb-2">รายละเอียด</h3>
                                <div className="text-sm text-slate-600 bg-white p-4 rounded-xl border border-slate-100 leading-relaxed">
                                    {selectedWork.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h3 className="font-bold text-slate-800 mb-2">ข้อมูลลูกค้า</h3>
                                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100">
                                    <img src={selectedWork.jobSeeker?.profileImageUrl ? `${BACKEND_URL}${selectedWork.jobSeeker.profileImageUrl}` : "https://placehold.co/50"} className="w-10 h-10 rounded-full object-cover" alt="" />
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{selectedWork.jobSeeker?.firstName} {selectedWork.jobSeeker?.lastName}</p>
                                        <p className="text-xs text-slate-500">Customer</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for Manual Creation */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="เพิ่มงานใหม่">
                <div className="p-4">
                    <p className="text-sm text-slate-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        💡 แนะนำ: สร้างงานผ่านห้องแชทกับลูกค้าจะสะดวกกว่า เพราะระบบจะผูกข้อมูลลูกค้าให้อัตโนมัติ
                    </p>
                    <ManualCreateWorkForm onSubmit={handleCreateWork} onCancel={() => setIsCreateModalOpen(false)} />
                </div>
            </Modal>

            {/* Dispute Modal */}
            {showDisputeModal && selectedWork && (
                <CreateDisputeModal
                    workId={selectedWork.id}
                    onClose={() => setShowDisputeModal(false)}
                    onSuccess={() => {
                        fetchWorks();
                        setShowDisputeModal(false);
                        setSelectedWork(null);
                    }}
                />
            )}
        </div>
    );
};

const ManualCreateWorkForm = ({ onSubmit, onCancel }) => {
    const [jobSeekerId, setJobSeekerId] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('1');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ jobSeekerId, jobTitle, description, price, duration });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">User ID ลูกค้า</label>
                <input type="text" value={jobSeekerId} onChange={e => setJobSeekerId(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none" required placeholder="ระบุ ID ลูกค้า" />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ชื่องาน</label>
                <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none" required placeholder="เช่น ออกแบบโลโก้" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">ราคา (บาท)</label>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none" required placeholder="0.00" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">ระยะเวลา (วัน)</label>
                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none" required placeholder="1" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">รายละเอียดงาน</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="รายละเอียดเพิ่มเติม..." rows={3} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg resize-none outline-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-600 hover:bg-slate-200">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">สร้างงาน</button>
            </div>
        </form>
    );
};

export default FreelancerWorkPage;