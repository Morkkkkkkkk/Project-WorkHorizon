import React from 'react';
import { MessageSquare, Star, Clock, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { BACKEND_URL } from '../api/apiClient';

const MyHireCard = ({ work, onStatusUpdate, onReview }) => {
    const { freelancerProfile, jobTitle, status, price, duration, createdAt, completedAt } = work;
    const freelancer = freelancerProfile?.user;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'OFFER_PENDING': return { label: 'รอการตอบรับ', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Clock size={14} /> };
            case 'IN_PROGRESS': return { label: 'กำลังดำเนินการ', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Clock size={14} /> };
            case 'SUBMITTED': return { label: 'ส่งงานแล้ว (รอตรวจ)', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <CheckCircle size={14} /> };
            case 'REVISION_REQUESTED': return { label: 'ขอแก้ไขงาน', color: 'bg-red-100 text-red-700 border-red-200', icon: <AlertTriangle size={14} /> };
            case 'COMPLETED': return { label: 'เสร็จสิ้น', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle size={14} /> };
            case 'DISPUTED': return { label: 'มีข้อพิพาท', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: <AlertTriangle size={14} /> };
            default: return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200', icon: null };
        }
    };

    const badge = getStatusBadge(status);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-200 group">
            <div className="p-5">
                <div className="flex flex-col md:flex-row gap-5">
                    {/* 1. Freelancer Profile Section */}
                    <div className="flex items-center gap-4 md:w-1/4 md:border-r md:border-slate-100 md:pr-5 min-w-[220px]">
                        <div className="relative">
                            <img
                                src={freelancer?.profileImageUrl ? `${BACKEND_URL}${freelancer.profileImageUrl}` : "https://placehold.co/100x100?text=User"}
                                alt="Freelancer"
                                className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shadow-sm group-hover:border-orange-200 transition-colors"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-slate-800 text-base truncate">{freelancer?.firstName} {freelancer?.lastName}</h4>
                            <p className="text-xs text-slate-500 mb-2 truncate">Freelancer</p>
                            <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-2 py-1 rounded-md transition-colors border border-slate-200">
                                <MessageSquare size={12} />
                                <span>แชทเลย</span>
                            </button>
                        </div>
                    </div>

                    {/* 2. Job Details Section */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">{jobTitle}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                                        {badge.icon}
                                        {badge.label}
                                    </span>
                                    <span className="text-xs text-slate-400">ID: #{work.id.toString().slice(-6)}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-extrabold text-slate-900">฿{parseFloat(price).toLocaleString()}</div>
                                <div className="text-xs text-slate-500">จ้างเหมา</div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-8 text-sm text-slate-600 mb-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-slate-400" />
                                <span className="text-slate-500 text-xs">ระยะเวลา:</span>
                                <span className="font-medium text-slate-700">{duration} วัน</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400" />
                                <span className="text-slate-500 text-xs">เริ่มเมื่อ:</span>
                                <span className="font-medium text-slate-700">{new Date(createdAt).toLocaleDateString('th-TH')}</span>
                            </div>
                            {completedAt && (
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-500" />
                                    <span className="text-slate-500 text-xs">เสร็จเมื่อ:</span>
                                    <span className="font-medium text-slate-700">{new Date(completedAt).toLocaleDateString('th-TH')}</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100/50">
                            {status === 'OFFER_PENDING' && (
                                <button
                                    onClick={() => onStatusUpdate(work.id, 'IN_PROGRESS')}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm transform active:scale-95"
                                >
                                    ตอบรับ & เริ่มงาน
                                </button>
                            )}

                            {status === 'SUBMITTED' && (
                                <>
                                    <button
                                        onClick={() => onStatusUpdate(work.id, 'COMPLETED')}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm transform active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} />
                                        อนุมัติงาน
                                    </button>
                                    <button
                                        onClick={() => onStatusUpdate(work.id, 'REVISION_REQUESTED')}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-all active:scale-95"
                                    >
                                        ขอแก้ไขงาน
                                    </button>
                                </>
                            )}

                            {status === 'COMPLETED' && !work.review && onReview && (
                                <button
                                    onClick={() => onReview(work.id)}
                                    className="px-4 py-2 bg-yellow-400 text-white text-sm font-bold rounded-lg hover:bg-yellow-500 transition-all shadow-sm flex items-center gap-2 transform active:scale-95"
                                >
                                    <Star size={16} className="fill-white" />
                                    ให้คะแนน
                                </button>
                            )}

                            {/* Read-only Review Status */}
                            {status === 'COMPLETED' && work.review && (
                                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                                    <Star size={14} className="fill-yellow-500 text-yellow-500" />
                                    <span className="font-bold text-xs">รีวิวแล้ว ({work.review.rating}/5)</span>
                                </div>
                            )}

                            {/* Fallback msg for other statuses */}
                            {status === 'IN_PROGRESS' && (
                                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                    รอฟรีแลนซ์ส่งงาน
                                </span>
                            )}
                            {status === 'REVISION_REQUESTED' && (
                                <span className="text-xs text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                                    รอส่งงานแก้ไข
                                </span>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyHireCard;
