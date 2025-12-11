import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useConversation } from '../hooks/useConversation';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { BACKEND_URL } from '../api/apiClient.js';
import Modal from '../components/Modal.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import CreateWorkForm from '../components/CreateWorkForm.jsx';
import ChatList from '../components/ChatList.jsx';
import { Star, Briefcase, Plus, Menu, ArrowLeft, MessageSquare, ExternalLink, Send, MoreVertical, ShieldCheck } from 'lucide-react';
import { freelancerApi } from '../api/freelancerApi';
import { toast } from 'react-toastify';

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
};

const ChatPage = () => {
  const { convoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');

  const {
    conversation,
    messages,
    isLoading,
    error,
    sendMessage,
  } = useConversation(convoId);

  const [isSending, setIsSending] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      await sendMessage(newMessage);
      setNewMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateWork = async (workData) => {
    try {
      await freelancerApi.createOffer(workData);
      toast.success('ส่งใบเสนอราคาเรียบร้อยแล้ว! ลูกค้าจะเห็นข้อเสนอของคุณ');
      setIsWorkModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการสร้างใบเสนอราคา');
    }
  };

  const showChat = !!convoId;

  // --- UI Helper: System Message Content ---
  const renderMessageContent = (msg, isMe) => {
    const systemPatterns = [
      { prefix: '📄', type: 'OFFER', label: 'ดูใบเสนอราคา', color: 'bg-indigo-500' },
      { prefix: '✅', type: 'STATUS', label: 'ดูสถานะงาน', color: 'bg-emerald-500' },
      { prefix: '📦', type: 'STATUS', label: 'ตรวจสอบงานที่ส่ง', color: 'bg-blue-500' },
      { prefix: '📝', type: 'STATUS', label: 'ดูคำขอแก้ไข', color: 'bg-amber-500' },
      { prefix: '🎉', type: 'STATUS', label: 'ดูงานที่เสร็จสิ้น', color: 'bg-purple-500' },
      { prefix: '⚠️', type: 'STATUS', label: 'ดูข้อพิพาท', color: 'bg-red-500' }
    ];

    const matchedPattern = systemPatterns.find(p => msg.content.startsWith(p.prefix));

    if (matchedPattern) {
      const targetLink = user.role === 'JOB_SEEKER' ? '/my-hires' : '/freelancer/works';

      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl filter drop-shadow-sm">{msg.content.substring(0, 2)}</span>
            <p className={`text-sm leading-relaxed font-medium ${isMe ? 'text-white/90' : 'text-slate-700'}`}>
              {msg.content.substring(2)}
            </p>
          </div>
          
          <Link 
            to={targetLink}
            className={`
              mt-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200
              ${isMe 
                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'}
            `}
          >
            <ExternalLink size={16} />
            {matchedPattern.label}
          </Link>
        </div>
      );
    }

    return <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">{msg.content}</p>;
  };

  // --- UI Helper: Main Content ---
  const renderChatContent = () => {
    if (!convoId) {
      return (
        <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <MessageSquare size={48} className="text-indigo-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">เริ่มการสนทนา</h3>
          <p className="text-slate-500">เลือกรายชื่อจากด้านซ้ายเพื่อแชทกับฟรีแลนซ์หรือผู้ว่าจ้าง</p>
        </div>
      );
    }

    if (isLoading) return <LoadingSpinner text="กำลังโหลดแชท..." fullScreen={false} />;

    if (error || !conversation) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} className="text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">ไม่พบการสนทนา</h1>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">การสนทนานี้อาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง</p>
          <Link to="/chat" className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm">
            กลับไปหน้ารวมแชท
          </Link>
        </div>
      );
    }

    const isServiceChat = !!conversation.serviceId;
    let otherUser = null;
    let jobTitle = '';

    if (isServiceChat) {
      if (conversation.user1 && conversation.user2) {
        otherUser = conversation.user1.id === user?.id ? conversation.user2 : conversation.user1;
      }
      jobTitle = conversation.service?.title || 'งานบริการ';
    } else {
      const applicant = conversation.application?.user;
      const employer = conversation.application?.job?.company?.user;
      if (applicant && employer) {
        otherUser = applicant.id === user?.id ? employer : applicant;
      }
      jobTitle = conversation.application?.job?.title || 'งาน';
    }

    if (!otherUser) return null;

    const getImageUrl = (relativeUrl) => {
      if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
      return `${BACKEND_URL}${relativeUrl}`;
    };

    const otherUserProfileImg = getImageUrl(otherUser.profileImageUrl) ||
      `https://placehold.co/100x100/E0E0E0/777?text=${otherUser.firstName.charAt(0)}`;

    const isFreelancer = user.role === 'FREELANCER';

    return (
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        {/* --- Chat Header --- */}
        <header className="bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200/60 sticky top-0 z-20 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 md:gap-4">
            <Link to="/chat" className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100/80 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>

            <div className="relative group cursor-pointer">
              <img
                src={otherUserProfileImg}
                alt="Profile"
                className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 border-white ring-2 ring-slate-100 shadow-sm transition-transform group-hover:scale-105"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            
            <div className="flex flex-col">
              <h2 className="font-bold text-slate-800 text-base md:text-lg leading-tight flex items-center gap-2">
                {otherUser.firstName} {otherUser.lastName}
              </h2>
              <div className="flex items-center gap-1.5 text-xs md:text-sm text-slate-500">
                <Briefcase size={12} className="text-indigo-400" />
                <span className="truncate max-w-[150px] md:max-w-[300px]">{jobTitle}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFreelancer && (
              <button
                onClick={() => setIsWorkModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95 transition-all"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">เสนอราคา</span>
              </button>
            )}
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* --- Messages Area --- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {/* Date Separator Example (Optional enhancement) */}
          <div className="flex justify-center">
            <span className="bg-slate-100 text-slate-500 text-[11px] font-medium px-3 py-1 rounded-full border border-slate-200/50">
              วันนี้
            </span>
          </div>

          {messages.map(msg => {
            const isMe = msg.senderId === user.id;
            const isSystemMsg = ['📄', '✅', '📦', '📝', '🎉', '⚠️'].some(prefix => msg.content.startsWith(prefix));
            
            return (
              <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group`}>
                <div className={`flex flex-col max-w-[85%] md:max-w-[65%] lg:max-w-[55%] ${isMe ? 'items-end' : 'items-start'}`}>
                  
                  {/* Chat Bubble */}
                  <div 
                    className={`
                      px-4 md:px-5 py-3 md:py-3.5 relative shadow-sm transition-all
                      ${isMe 
                        ? (isSystemMsg 
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-tr-sm shadow-orange-200' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-100') 
                        : (isSystemMsg
                            ? 'bg-white border-l-4 border-orange-500 rounded-xl shadow-md' 
                            : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-tl-sm shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]')
                      }
                    `}
                  >
                    {renderMessageContent(msg, isMe)}
                  </div>

                  {/* Timestamp */}
                  <span className={`text-[10px] md:text-[11px] mt-1.5 px-1 font-medium select-none ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                    {formatTime(msg.createdAt)}
                    {isMe && <span className="ml-1 text-slate-300">· อ่านแล้ว</span>}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </main>

        {/* --- Input Area --- */}
        <footer className="bg-white border-t border-slate-100 p-3 md:p-5 pb-safe z-10">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2 bg-slate-50 p-2 rounded-3xl border border-slate-200 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100/50 transition-all duration-300 shadow-sm">
            <button type="button" className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors flex-shrink-0">
               <Plus size={20} />
            </button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="พิมพ์ข้อความ..."
              className="flex-1 bg-transparent py-2.5 max-h-32 focus:outline-none text-slate-700 placeholder:text-slate-400 text-base min-w-0"
              autoComplete="off"
            />
            
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className={`
                p-2.5 rounded-full flex-shrink-0 transition-all duration-200
                ${!newMessage.trim() 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md transform hover:scale-105 active:scale-95'}
              `}
            >
              <Send size={18} className={isSending ? 'animate-pulse' : 'ml-0.5'} />
            </button>
          </form>
          
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-400">กด Enter เพื่อส่ง</p>
          </div>
        </footer>

        {/* Modals */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="รีวิวงานฟรีแลนซ์"
        >
          <ReviewForm
            workId={conversation.serviceId}
            freelancerId={otherUser.id}
            jobTitle={jobTitle}
            onSubmit={(result) => {
              toast.success('ส่งรีวิวเรียบร้อยแล้ว!');
              setIsReviewModalOpen(false);
            }}
            onCancel={() => setIsReviewModalOpen(false)}
          />
        </Modal>

        <Modal
          isOpen={isWorkModalOpen}
          onClose={() => setIsWorkModalOpen(false)}
          title="สร้างใบเสนอราคา"
        >
          <CreateWorkForm
            jobSeekerId={otherUser.id}
            onSubmit={handleCreateWork}
            onCancel={() => setIsWorkModalOpen(false)}
          />
        </Modal>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={`
        w-full md:w-80 lg:w-96 border-r border-slate-200/80 bg-white flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-20
        ${showChat ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">ข้อความ</h2>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            ทั้งหมด
          </span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100">
          <ChatList />
        </div>
      </div>

      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col relative
        ${showChat ? 'flex' : 'hidden md:flex'}
      `}>
        {renderChatContent()}
      </div>
    </div>
  );
};

export default ChatPage;