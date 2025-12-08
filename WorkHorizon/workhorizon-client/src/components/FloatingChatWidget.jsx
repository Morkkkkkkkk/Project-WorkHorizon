import React, { useState } from 'react';
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChatList from './ChatList';

const FloatingChatWidget = () => {
    const { isAuth } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    if (!isAuth) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 font-sans">

            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`
            bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 origin-bottom-right
            ${isMinimized ? 'w-72 h-14' : 'w-80 md:w-96 h-[500px]'}
          `}
                >
                    {/* Header */}
                    <div
                        className="bg-gradient-to-r from-orange-600 to-red-600 p-3 flex items-center justify-between cursor-pointer"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        <div className="flex items-center gap-2 text-white">
                            <MessageSquare size={18} />
                            <span className="font-bold text-sm">แชทของคุณ</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                                className="p-1 hover:bg-white/20 rounded text-white transition-colors"
                            >
                                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                className="p-1 hover:bg-white/20 rounded text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {!isMinimized && (
                        <div className="h-[calc(100%-48px)] bg-white overflow-y-auto custom-scrollbar">
                            <ChatList onItemClick={() => { }} />
                        </div>
                    )}
                </div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => { setIsOpen(true); setIsMinimized(false); }}
                    className="group flex items-center justify-center w-14 h-14 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full shadow-lg shadow-orange-600/30 hover:scale-110 hover:shadow-orange-600/50 transition-all duration-300"
                >
                    <MessageSquare size={28} className="group-hover:animate-pulse" />
                </button>
            )}
        </div>
    );
};

export default FloatingChatWidget;
