import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Trash2, Briefcase } from 'lucide-react';
import { useConversations } from '../hooks/useConversations';
import { BACKEND_URL } from '../api/apiClient';
import { toast } from 'react-toastify';

const ChatList = ({ onItemClick, className = "" }) => {
    const { conversations, isLoading, deleteConversation } = useConversations();

    const handleDelete = async (e, conversationId) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('คุณต้องการลบการสนทนานี้หรือไม่?')) {
            try {
                await deleteConversation(conversationId);
                toast.success('ลบการสนทนาเรียบร้อยแล้ว');
            } catch (err) {
                toast.error('ไม่สามารถลบการสนทนาได้: ' + err.message);
            }
        }
    };

    const getImageUrl = (relativeUrl) => {
        if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
        return `${BACKEND_URL}${relativeUrl}`;
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'เพิ่งจะคุย';
        if (diffMins < 60) return `${diffMins} นาที`;
        if (diffHours < 24) return `${diffHours} ชม.`;
        if (diffDays < 7) return `${diffDays} วัน`;
        return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-1">ยังไม่มีการสนทนา</p>
                <p className="text-sm text-slate-400">เริ่มแชทกับนายจ้างหรือฟรีแลนซ์</p>
            </div>
        );
    }

    return (
        <div className={`divide-y divide-slate-100 ${className}`}>
            {conversations.map((conversation) => {
                const otherUser = conversation.otherUser || {};
                const lastMessage = conversation.lastMessage || {};
                const jobTitle = conversation.jobTitle || conversation.serviceTitle || 'งาน';

                return (
                    <Link
                        key={conversation.id}
                        to={`/chat/${conversation.id}`}
                        onClick={onItemClick}
                        className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors group relative"
                    >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <img
                                src={getImageUrl(otherUser.profileImageUrl) || `https://placehold.co/100x100/FF9800/FFFFFF?text=${otherUser.firstName?.charAt(0) || 'U'}`}
                                alt={otherUser.firstName}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                            {conversation.isOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-bold text-slate-800 truncate">
                                    {otherUser.firstName} {otherUser.lastName}
                                </p>
                                <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                                    {formatTime(conversation.updatedAt)}
                                </span>
                            </div>

                            {/* Job/Service Title */}
                            <div className="flex items-center gap-1 mb-1">
                                <Briefcase size={12} className="text-orange-500" />
                                <p className="text-xs text-slate-500 truncate">{jobTitle}</p>
                            </div>

                            {/* Last Message Preview */}
                            <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                                {lastMessage.senderId === otherUser.id ? '' : 'คุณ: '}
                                {lastMessage.content || 'ส่งรูปภาพ'}
                            </p>
                        </div>

                        {/* Unread Badge */}
                        {conversation.unreadCount > 0 && (
                            <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-orange-500 rounded-full ring-2 ring-white"></span>
                        )}

                        {/* Delete Button */}
                        <button
                            onClick={(e) => handleDelete(e, conversation.id)}
                            className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all text-slate-400 hover:text-red-600"
                            title="ลบการสนทนา"
                        >
                            <Trash2 size={16} />
                        </button>
                    </Link>
                );
            })}
        </div>
    );
};

export default ChatList;
