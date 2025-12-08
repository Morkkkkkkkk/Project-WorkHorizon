import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, X } from 'lucide-react';
import ChatList from './ChatList';

const ChatDropdown = ({ isOpen, onClose, dropdownRef }) => {
    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[500px] flex flex-col"
        >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="text-orange-600" size={20} />
                    <h3 className="font-bold text-slate-800">การสนทนา</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                >
                    <X size={18} className="text-slate-500" />
                </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <ChatList onItemClick={onClose} />
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                    to="/chat"
                    onClick={onClose}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                    ดูการสนทนาทั้งหมด
                </Link>
            </div>
        </div>
    );
};

export default ChatDropdown;
