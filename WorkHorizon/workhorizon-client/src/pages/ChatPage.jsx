import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useConversation } from '../hooks/useConversation';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { BACKEND_URL } from '../api/apiClient.js';
import Modal from '../components/Modal.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import CreateWorkForm from '../components/CreateWorkForm.jsx';
import ChatList from '../components/ChatList.jsx'; // ✅ Import ChatList
import { Star, Briefcase, Plus, Menu, ArrowLeft, MessageSquare } from 'lucide-react';
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

  // Only fetch conversation if convoId exists
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
      // Optional: Send a system message or refresh chat
    } catch (err) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการสร้างใบเสนอราคา');
    }
  };

  // Helper to determine if we should show the chat window or the list (on mobile)
  const showChat = !!convoId;

  // --- Render Content Logic ---
  const renderChatContent = () => {
    if (!convoId) {
      return (
        <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-400">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare size={40} />
          </div>
          <p className="text-lg font-medium">เลือกการสนทนาเพื่อเริ่มแชท</p>
        </div>
      );
    }

    if (isLoading) return <LoadingSpinner text="กำลังโหลดแชท..." fullScreen={false} />;

    if (error || !conversation) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <h1 className="text-2xl font-bold text-red-600">ไม่พบการสนทนา</h1>
          <p className="text-slate-500 mt-2">การสนทนานี้อาจถูกลบหรือคุณไม่มีสิทธิ์เข้าถึง</p>
          <Link to="/chat" className="text-blue-600 mt-4 hover:underline">กลับไปหน้ารวมแชท</Link>
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

    // Fallback if otherUser is still null (should not happen if data is correct)
    if (!otherUser) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <h1 className="text-xl font-bold text-red-600">ข้อมูลไม่ครบถ้วน</h1>
          <p className="text-slate-500 mt-2">ไม่สามารถระบุคู่สนทนาได้</p>
        </div>
      );
    }

    const getImageUrl = (relativeUrl) => {
      if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
      return `${BACKEND_URL}${relativeUrl}`;
    };

    const otherUserProfileImg = getImageUrl(otherUser.profileImageUrl) ||
      `https://placehold.co/100x100/E0E0E0/777?text=${otherUser.firstName.charAt(0)}`;

    const isFreelancer = user.role === 'FREELANCER';

    return (
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            <Link to="/chat" className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <ArrowLeft size={20} />
            </Link>

            <img
              src={otherUserProfileImg}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <h2 className="font-bold text-slate-800 leading-tight">
                {otherUser.firstName} {otherUser.lastName}
              </h2>
              <p className="text-xs text-slate-500 truncate max-w-[200px]">
                {jobTitle}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isFreelancer && (
              <button
                onClick={() => setIsWorkModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs md:text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-all"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">เสนอราคา</span>
              </button>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map(msg => {
            const isMe = msg.senderId === user.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}>
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                  <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <footer className="bg-white border-t p-3 md:p-4">
          <form onSubmit={handleSend} className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="พิมพ์ข้อความ..."
              className="flex-1 bg-transparent focus:outline-none text-sm md:text-base text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
        </footer>

        {/* Modals */}
        {/* Review Modal */}
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

        {/* Create Offer Modal */}
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
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
      {/* Sidebar (Chat List) */}
      <div className={`
        w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white flex flex-col
        ${showChat ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">ข้อความ</h2>
          <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            ทั้งหมด
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatList />
        </div>
      </div>

      {/* Main Content (Chat Window) */}
      <div className={`
        flex-1 bg-slate-50 flex flex-col
        ${showChat ? 'flex' : 'hidden md:flex'}
      `}>
        {renderChatContent()}
      </div>
    </div>
  );
};

export default ChatPage;
