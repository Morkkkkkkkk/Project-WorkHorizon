import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { conversationApi } from '../api/conversationApi';
import { BACKEND_URL } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Send, 
  Paperclip, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  ArrowLeft, 
  CheckCheck,
  Briefcase,
  Smile,
  MessageCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const ChatPage = () => {
  const { id: currentChatId } = useParams(); // รับ ID จาก URL (ถ้ามี)
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Helper: Get Image URL
  const getImageUrl = (url) => 
    url ? (url.startsWith('http') ? url : `${BACKEND_URL}${url}`) : null;

  // Helper: Format Time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  // 1. Fetch Conversations List
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await conversationApi.getMyConversations();
        setConversations(data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        // toast.error("ไม่สามารถโหลดรายการแชทได้");
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchConversations();
  }, []);

  // 2. Fetch Active Chat Details & Messages
  useEffect(() => {
    if (!currentChatId) {
      setActiveChat(null);
      return;
    }

    const fetchChatDetails = async () => {
      try {
        setIsLoadingChat(true);
        const data = await conversationApi.getById(currentChatId);
        setActiveChat(data.conversation); 
        setMessages(data.messages || []);
        
        // Mark as read logic could go here
      } catch (err) {
        console.error("Error fetching chat details:", err);
        toast.error("ไม่สามารถโหลดบทสนทนาได้");
        navigate('/chat');
      } finally {
        setIsLoadingChat(false);
      }
    };

    fetchChatDetails();

    // Polling หรือ Socket logic ควรอยู่ที่นี่
    // const interval = setInterval(fetchChatDetails, 5000);
    // return () => clearInterval(interval);

  }, [currentChatId, navigate]);

  // 3. Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChatId) return;

    const tempMsg = {
      id: 'temp-' + Date.now(),
      content: newMessage,
      senderId: user.id,
      createdAt: new Date().toISOString(),
      isSending: true
    };

    // Optimistic UI Update
    setMessages((prev) => [...prev, tempMsg]);
    setNewMessage('');

    try {
      const sentMsg = await conversationApi.sendMessage(currentChatId, tempMsg.content);
      // Update with real message from server
      setMessages((prev) => prev.map(m => m.id === tempMsg.id ? sentMsg : m));
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("ส่งข้อความไม่สำเร็จ");
      setMessages((prev) => prev.filter(m => m.id !== tempMsg.id)); // Remove failed message
    }
  };

  // Filter Conversations
  const filteredConversations = conversations.filter(chat => {
    const otherUser = chat.user1Id === user.id ? chat.user2 : chat.user1;
    // รองรับทั้ง ServiceChat และ JobApplicationChat
    const name = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get Other User Info helper
  const getOtherUser = (chat) => {
    if (!chat) return {};
    // ตรวจสอบว่าเป็น ServiceConversation หรือ Conversation (Job)
    // ตาม Schema: ServiceConversation มี user1, user2 / Conversation มี application -> user, job -> company -> user
    if (chat.user1 && chat.user2) {
      return chat.user1Id === user.id ? chat.user2 : chat.user1;
    }
    // Fallback for generic structure
    return chat.participants?.find(p => p.id !== user.id) || {};
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden font-sans">
      
      {/* --- SIDEBAR (List) --- */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col ${currentChatId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-extrabold text-slate-800">ข้อความ</h2>
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto custom-scroll p-2 space-y-1">
          {isLoadingList ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((chat) => {
              const otherUser = getOtherUser(chat);
              const isActive = chat.id === currentChatId;
              const lastMessage = chat.messages?.[0]?.content || "เริ่มบทสนทนาใหม่";
              const lastTime = chat.messages?.[0]?.createdAt;

              return (
                <div 
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.id}`)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isActive ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={getImageUrl(otherUser.profileImageUrl) || `https://ui-avatars.com/api/?name=${otherUser.firstName}+${otherUser.lastName}&background=random`} 
                      alt="avatar" 
                      className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-100"
                    />
                    {/* Online Status Indicator (Mock) */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`text-sm font-bold truncate ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>
                        {otherUser.firstName} {otherUser.lastName}
                      </h4>
                      {lastTime && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatTime(lastTime)}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                      {/* ถ้าเป็น Service Chat อาจจะโชว์ชื่อ Service */}
                      {chat.service ? <span className="font-bold mr-1">[{chat.service.title}]</span> : ''}
                      {lastMessage}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-slate-400 text-sm">
              ไม่พบรายการสนทนา
            </div>
          )}
        </div>
      </div>

      {/* --- MAIN CHAT WINDOW --- */}
      <div className={`flex-1 flex flex-col bg-white w-full ${!currentChatId ? 'hidden md:flex' : 'flex'}`}>
        
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/chat')} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700">
                  <ArrowLeft size={20} />
                </button>
                
                <img 
                  src={getImageUrl(getOtherUser(activeChat).profileImageUrl) || `https://ui-avatars.com/api/?name=${getOtherUser(activeChat).firstName}`} 
                  className="w-10 h-10 rounded-full object-cover shadow-sm cursor-pointer"
                  alt="avatar"
                  onClick={() => navigate(`/freelancers/${getOtherUser(activeChat).id}`)} // หรือ Link ไปหน้าโปรไฟล์
                />
                
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    {getOtherUser(activeChat).firstName} {getOtherUser(activeChat).lastName}
                    {activeChat.service && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full font-bold">
                        Service
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    Online
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                 <button className="p-2 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-all" title="โทร (เร็วๆ นี้)">
                    <Phone size={20} />
                 </button>
                 <button className="p-2 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-all" title="วิดีโอคอล (เร็วๆ นี้)">
                    <Video size={20} />
                 </button>
                 <button className="p-2 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-all">
                    <MoreVertical size={20} />
                 </button>
              </div>
            </div>

            {/* Service / Job Context Header (Optional) */}
            {activeChat.service && (
               <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2 font-medium">
                     <Briefcase size={14} className="text-slate-400"/>
                     กำลังคุยเรื่องงาน: <span className="font-bold text-slate-800 underline cursor-pointer hover:text-blue-600" onClick={() => navigate(`/services/${activeChat.service.id}`)}>{activeChat.service.title}</span>
                  </div>
                  <div className="font-bold text-slate-900">฿{Number(activeChat.service.price).toLocaleString()}</div>
               </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll bg-slate-50/50" ref={chatContainerRef}>
              {isLoadingChat ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner text="กำลังโหลดข้อความ..." />
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === user.id;
                  const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-1`}>
                      
                      {/* Avatar for Them */}
                      {!isMe && (
                        <div className={`w-8 h-8 mr-2 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                           <img 
                              src={getImageUrl(getOtherUser(activeChat).profileImageUrl) || `https://ui-avatars.com/api/?name=${getOtherUser(activeChat).firstName}`} 
                              className="w-full h-full rounded-full object-cover shadow-sm"
                           />
                        </div>
                      )}

                      <div className={`max-w-[70%] lg:max-w-[60%]`}>
                        {/* Name on top for group chat (Optional) */}
                        {/* {!isMe && showAvatar && <p className="text-xs text-slate-500 mb-1 ml-1">{getOtherUser(activeChat).firstName}</p>} */}

                        <div 
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words relative group-hover:shadow-md transition-shadow ${
                            isMe 
                              ? 'bg-blue-600 text-white rounded-br-none' 
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        
                        {/* Time & Status */}
                        <div className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}>
                           <span>{formatTime(msg.createdAt)}</span>
                           {isMe && (
                             msg.isSending ? <span className="text-slate-300">กำลังส่ง...</span> : <CheckCheck size={12} className="text-blue-500" />
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                  <MessageCircle size={64} className="mb-4" />
                  <p className="text-sm font-medium">ยังไม่มีข้อความ เริ่มต้นทักทายได้เลย!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
                <button type="button" className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                  <Paperclip size={20} />
                </button>
                <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 py-1"
                  />
                  <button type="button" className="ml-2 text-slate-400 hover:text-yellow-500 transition-colors">
                     <Smile size={20} />
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none transition-all transform hover:scale-105 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>

          </>
        ) : (
          /* --- EMPTY STATE (No Chat Selected) --- */
          <div className="hidden md:flex flex-col items-center justify-center h-full bg-slate-50/50 text-center p-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
               <MessageCircle size={48} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">ยินดีต้อนรับสู่ WorkHorizon Chat</h2>
            <p className="text-slate-500 max-w-md">
              เลือกบทสนทนาจากรายการทางด้านซ้าย หรือเริ่มงานใหม่โดยการทักหาฟรีแลนซ์ที่คุณสนใจ
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;