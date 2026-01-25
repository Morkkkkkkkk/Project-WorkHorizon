import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { disputeApi } from '../api/disputeApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Search, Trash2, CheckCircle, Clock, AlertCircle, 
  Filter, FileText, User, ChevronDown, Check 
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- Sub-Component: Dropdown สวยๆ ---
const StatusFilterDropdown = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const options = [
        { value: 'ALL', label: 'สถานะทั้งหมด', color: 'bg-slate-400' },
        { value: 'OPEN', label: 'OPEN (เปิดใหม่)', color: 'bg-red-500' },
        { value: 'IN_PROGRESS', label: 'IN PROGRESS (กำลังตรวจสอบ)', color: 'bg-orange-500' },
        { value: 'RESOLVED_REFUNDED', label: 'REFUNDED (คืนเงิน)', color: 'bg-green-500' },
        { value: 'RESOLVED_COMPLETED', label: 'COMPLETED (สำเร็จ)', color: 'bg-blue-500' },
        { value: 'CLOSED', label: 'CLOSED (ปิดเคส)', color: 'bg-gray-500' }
    ];

    const selectedOption = options.find(o => o.value === value) || options[0];

    // ปิด Dropdown เมื่อคลิกข้างนอก
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full sm:w-64" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded-xl text-sm font-medium transition-all shadow-sm
                    ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'}
                `}
            >
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${selectedOption.color}`}></span>
                    <span className="text-slate-700 truncate">{selectedOption.label}</span>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                                    ${value === option.value ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${option.color}`}></span>
                                    <span>{option.label}</span>
                                </div>
                                {value === option.value && <Check size={16} className="text-blue-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---
const AdminDisputePage = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- State สำหรับ Filter & Tabs ---
    const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' | 'HISTORY'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            const res = await disputeApi.getAll();
            setDisputes(res.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (ticketId) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ?',
            text: "ข้อมูลข้อพิพาทและแชททั้งหมดจะหายไป!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'ลบเลย',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            try {
                await disputeApi.deleteTicket(ticketId);
                Swal.fire('ลบสำเร็จ', '', 'success');
                fetchDisputes(); 
            } catch (error) {
                Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบได้', 'error');
            }
        }
    };

    // --- Logic การกรองข้อมูล ---
    const filteredDisputes = useMemo(() => {
        return disputes.filter(item => {
            // 1. กรองตาม Tab
            const isResolved = ['RESOLVED_COMPLETED', 'RESOLVED_REFUNDED', 'CLOSED'].includes(item.status);
            if (activeTab === 'ACTIVE' && isResolved) return false;
            if (activeTab === 'HISTORY' && !isResolved) return false;

            // 2. กรองตาม Search
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = 
                item.ticketNumber.toLowerCase().includes(searchLower) ||
                item.reason.toLowerCase().includes(searchLower) ||
                item.creator?.firstName?.toLowerCase().includes(searchLower) ||
                (item.creator?.role === 'FREELANCER' ? item.work.jobSeeker.firstName : item.work.freelancer.firstName).toLowerCase().includes(searchLower);

            // 3. กรองตาม Status Dropdown
            const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [disputes, activeTab, searchTerm, filterStatus]);

    // Helper: Badge สี
    const getStatusBadge = (status) => {
        const styles = {
            'OPEN': 'bg-red-50 text-red-700 border-red-200',
            'IN_PROGRESS': 'bg-orange-50 text-orange-700 border-orange-200',
            'RESOLVED_REFUNDED': 'bg-green-50 text-green-700 border-green-200',
            'RESOLVED_COMPLETED': 'bg-blue-50 text-blue-700 border-blue-200',
            'CLOSED': 'bg-gray-50 text-gray-600 border-gray-200'
        };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>{status}</span>;
    };

    if (loading) return <div className="p-10 text-center"><LoadingSpinner /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการข้อพิพาท (Dispute Management)</h1>
                    <p className="text-slate-500">ตรวจสอบและแก้ไขปัญหาระหว่างผู้จ้างและฟรีแลนซ์</p>
                </div>
            </div>

            {/* --- Controls: Tabs & Filters --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
                
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit">
                    <button 
                        onClick={() => setActiveTab('ACTIVE')}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'ACTIVE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <AlertCircle size={16} /> กำลังดำเนินการ
                    </button>
                    <button 
                        onClick={() => setActiveTab('HISTORY')}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Clock size={16} /> ประวัติ (เสร็จสิ้น)
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    
                    {/* ✅ ใช้ Custom Dropdown แทน Select เดิม */}
                    <StatusFilterDropdown 
                        value={filterStatus} 
                        onChange={setFilterStatus} 
                    />

                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="ค้นหา Ticket, ผู้แจ้ง..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm hover:border-slate-300"
                        />
                    </div>
                </div>
            </div>

            {/* --- Table --- */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="p-4 pl-6">Ticket Info</th>
                                <th className="p-4">ผู้แจ้ง (Reporter)</th>
                                <th className="p-4">คู่กรณี (Target)</th>
                                <th className="p-4">สถานะ</th>
                                <th className="p-4 pr-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDisputes.length === 0 ? (
                                <tr><td colSpan="5" className="p-12 text-center text-slate-400">ไม่พบข้อมูล</td></tr>
                            ) : filteredDisputes.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-4 pl-6">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <span className="font-mono text-xs font-medium text-slate-400 block mb-0.5">{item.ticketNumber}</span>
                                                <p className="font-bold text-slate-800 text-sm">{item.reason}</p>
                                                <p className="text-xs text-slate-500 truncate max-w-[180px]">{item.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{item.creator?.firstName}</p>
                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-medium">{item.creator?.role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">
                                        {item.creator?.role === 'FREELANCER' 
                                            ? <span className="flex items-center gap-1"><User size={12}/> ลูกค้า: {item.work.jobSeeker.firstName}</span>
                                            : <span className="flex items-center gap-1"><User size={12}/> ฟรีแลนซ์: {item.work.freelancer.firstName}</span>
                                        }
                                    </td>
                                    <td className="p-4">{getStatusBadge(item.status)}</td>
                                    <td className="p-4 pr-6 text-right space-x-2">
                                        <Link 
                                            to={`/dispute-chat/${item.id}`} 
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            {activeTab === 'ACTIVE' ? 'ตรวจสอบ' : 'ดูรายละเอียด'}
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="ลบข้อมูล"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDisputePage;