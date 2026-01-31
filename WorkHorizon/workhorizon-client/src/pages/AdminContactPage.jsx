import React, { useState, useEffect } from 'react';
import contactApi from '../api/contactApi';
import { Mail, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminContactPage = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, READ, REPLIED

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const res = await contactApi.getAllContactRequests();
            // Note: Pagination logic can be added later if needed, currently fetching all (or first page default)
            setRequests(res.data.requests || []);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await contactApi.updateContactRequestStatus(id, newStatus);
            setRequests(prev => prev.map(req =>
                req.id === id ? { ...req, status: newStatus } : req
            ));
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'ALL') return true;
        return req.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'READ': return 'bg-blue-100 text-blue-800';
            case 'REPLIED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">กล่องข้อความจากผู้ใช้</h1>
                    <p className="text-slate-500">จัดการข้อความติดต่อและแจ้งปัญหาต่างๆ</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-200 w-fit">
                {['ALL', 'PENDING', 'READ', 'REPLIED'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        {tab === 'ALL' ? 'ทั้งหมด' : tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-20 text-center">
                        <LoadingSpinner />
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-20 text-center text-slate-500">
                        <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
                        <p>ไม่มีข้อความในสถานะนี้</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredRequests.map((req) => (
                            <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{req.subject}</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <span>{req.name}</span>
                                                <span>•</span>
                                                <span>{req.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                        <div className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(req.createdAt).toLocaleString('th-TH')}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm whitespace-pre-wrap mb-4 border border-slate-100">
                                    {req.message}
                                </div>

                                <div className="flex justify-end gap-2">
                                    {req.status === 'PENDING' && (
                                        <button
                                            onClick={() => updateStatus(req.id, 'READ')}
                                            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            ทำเครื่องหมายว่าอ่านแล้ว
                                        </button>
                                    )}
                                    {req.status !== 'REPLIED' && (
                                        <button
                                            onClick={() => updateStatus(req.id, 'REPLIED')}
                                            className="px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                                        >
                                            <CheckCircle size={14} />
                                            ตอบกลับแล้ว
                                        </button>
                                    )}
                                    {/* Link to email handling could be added here */}
                                    <a
                                        href={`mailto:${req.email}?subject=Re: ${req.subject}`}
                                        className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                    >
                                        ส่งอีเมลตอบกลับ
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminContactPage;
