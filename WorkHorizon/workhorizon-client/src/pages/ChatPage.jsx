import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { conversationApi } from '../api/conversationApi';
import { BACKEND_URL } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
// ❌ ลบ PaymentModal ออก เพราะไม่ใช้ในหน้านี้แล้ว
// import PaymentModal from '../components/PaymentModal'; 
import {
  Send, Paperclip, Search, MoreVertical, Phone,
  ArrowLeft, CheckCheck, Briefcase, Smile, MessageCircle,
  CreditCard, DollarSign, User as UserIcon, X, Trash2,
  AlertTriangle, Receipt, CheckCircle2, Clock, Image, Package, FileEdit, Trophy, PlayCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

import { socket } from '../services/socket';
import EmojiPicker from 'emoji-picker-react';
import { freelancerApi } from '../api/freelancerApi';

const ChatPage = () => {
  const { id: currentChatId } = useParams();
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

  // Modal States
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Emoji & File States
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Offer Form State
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDetail, setOfferDetail] = useState('');

  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Helper: Get Image URL
  const getImageUrl = (url) =>
    url ? (url.startsWith('http') ? url : `${BACKEND_URL}${url}`) : null;

  // Helper: Format Time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper: Parse Offer Message
  const parseOfferMessage = (content) => {
    try {
      const priceMatch = content.match(/฿([\d,]+)/);
      const detailMatch = content.split('รายละเอียด:')[1];
      return {
        price: priceMatch ? priceMatch[1] : '0',
        detail: detailMatch ? detailMatch.trim() : '-'
      };
    } catch (e) {
      return { price: '0', detail: content };
    }
  };

  // Helper: Parse Status Message
  const parseStatusMessage = (content) => {
    try {
      const typeMatch = content.match(/\[STATUS:(\w+)\]/);
      const textPart = content.replace(/\[STATUS:\w+\]/, '').trim();
      const [title, desc] = textPart.split('|');
      return {
        type: typeMatch ? typeMatch[1] : 'INFO',
        title: title || 'แจ้งเตือนสถานะ',
        desc: desc || '-'
      };
    } catch (e) {
      return { type: 'INFO', title: 'แจ้งเตือน', desc: content };
    }
  };

  // Click Outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Fetch Conversations List & Socket Setup
  useEffect(() => {
    if (user?.id) {
      socket.connect();
    }

    const fetchConversations = async () => {
      try {
        const data = await conversationApi.getMyConversations();
        setConversations(data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setIsLoadingList(false);
      }
    };
    fetchConversations();

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  // Handle Joining Rooms
  useEffect(() => {
    if (!currentChatId) return;

    socket.emit("join_room", currentChatId);

    const handleReceiveMessage = (data) => {
      if (data.senderId === user.id) return;
      setMessages((prev) => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    };

    const handleWorkStatusUpdate = (data) => {
      console.log("Work status updated:", data);
      fetchChatDetails();
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("work_status_updated", handleWorkStatusUpdate);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("work_status_updated", handleWorkStatusUpdate);
    };
  }, [currentChatId, user.id]);

  // 2. Fetch Active Chat Details
  const fetchChatDetails = async () => {
    try {
      setIsLoadingChat(true);
      const data = await conversationApi.getById(currentChatId);
      if (data) {
        setActiveChat(data.conversation || data);
        const msgs = data.messages || [];
        setMessages(msgs);
      }
    } catch (err) {
      console.error("Error fetching chat details:", err);
      toast.error("ไม่สามารถโหลดข้อมูลแชทได้");
    } finally {
      setIsLoadingChat(false);
    }
  };

  useEffect(() => {
    if (!currentChatId) {
      setActiveChat(null);
      return;
    }
    fetchChatDetails();
  }, [currentChatId]);

  // 3. Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ขนาดไฟล์เกิน 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !currentChatId) return;
    await submitMessage(newMessage, selectedFile);
    setNewMessage('');
    setSelectedFile(null);
    setShowEmoji(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitMessage = async (content, file = null) => {
    const tempId = 'temp-' + Date.now();
    const tempMsg = {
      id: tempId,
      content: content || (file ? `Sending file...` : ''),
      senderId: user.id,
      createdAt: new Date().toISOString(),
      isSending: true,
      fileType: file ? (file.type.startsWith('image/') ? 'IMAGE' : 'FILE') : null,
      fileUrl: file && file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      let sentMsg;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        if (content) formData.append('content', content);
        sentMsg = await conversationApi.sendMessage(currentChatId, formData);
      } else {
        sentMsg = await conversationApi.sendMessage(currentChatId, content);
      }

      socket.emit("send_message", {
        ...sentMsg,
        room: currentChatId
      });

      setMessages((prev) => prev.map(m => m.id === tempId ? sentMsg : m));
      return true;
    } catch (err) {
      toast.error("ส่งข้อความไม่สำเร็จ");
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      return false;
    }
  };

  const handleSendOffer = async () => {
    // ✅ เช็คก่อน: ถ้ากำลังส่งอยู่ ห้ามทำซ้ำ
    if (isSubmittingOffer) return;

    if (!offerPrice) {
      toast.error("กรุณาระบุราคา");
      return;
    }

    // ✅ ล็อคปุ่มทันที
    setIsSubmittingOffer(true);

    try {
      const workData = {
        jobSeekerId: getOtherUser(activeChat).id,
        price: parseFloat(offerPrice),
        jobTitle: `เสนอราคา: ${activeChat.serviceTitle || 'จ้างงาน'}`,
        description: offerDetail || '-',
        serviceConversationId: currentChatId,
        duration: 7
      };

      await freelancerApi.createWork(workData);

      const offerContent = `[OFFER] เสนอราคา: ฿${Number(offerPrice).toLocaleString()} \nรายละเอียด: ${offerDetail || '-'}`;
      await submitMessage(offerContent);

      setShowOfferModal(false);
      setOfferPrice('');
      setOfferDetail('');
      toast.success("ส่งใบเสนอราคาเรียบร้อย");

      window.location.reload();

    } catch (err) {
      console.error(err);
      toast.error("สร้างใบเสนอราคาไม่สำเร็จ: " + (err.response?.data?.error || err.message));

      // ✅ ถ้า Error ต้องปลดล็อคปุ่ม (แต่ถ้าสำเร็จไม่ต้อง เพราะเดี๋ยวมัน Reload)
      setIsSubmittingOffer(false);
    }
  };

  const handleDeleteChat = async () => {
    try {
      await conversationApi.deleteConversation(currentChatId);
      toast.success("ลบการสนทนาเรียบร้อยแล้ว");
      setShowDeleteModal(false);
      setConversations(prev => prev.filter(c => c.id !== currentChatId));
      navigate('/chat');
    } catch (err) {
      toast.error("ลบไม่สำเร็จ: " + (err.response?.data?.error || err.message));
    }
  };

  // ✅ ฟังก์ชันใหม่: พาไปหน้า "งานที่ฉันจ้าง" แทนการจ่ายเงินตรงๆ
  const handleGoToPayment = () => {
    navigate('/my-hires');
  };

  const handleUpdateStatus = async (workId, status) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะดำเนินการนี้?")) return;
    try {
      await freelancerApi.updateWorkStatus(workId, status);
      toast.success("อัปเดตสถานะเรียบร้อย!");
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาด: " + (err.response?.data?.error || err.message));
    }
  };

  const handleCancelWork = async (workId) => {
    if (!window.confirm("คุณต้องการยกเลิกงานและขอคืนเงินใช่หรือไม่?")) return;
    try {
      await freelancerApi.cancelWork(workId);
      toast.success("ยกเลิกงานและคืนเงินเรียบร้อยแล้ว");
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาด: " + (err.response?.data?.error || err.message));
    }
  };

  const filteredConversations = conversations.filter(chat => {
    const otherUser = getOtherUser(chat);
    const name = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  function getOtherUser(chat) {
    if (!chat) return {};
    if (chat.otherUser) return chat.otherUser;
    if (chat.user1 && chat.user2 && typeof chat.user1 === 'object') {
      return chat.user1Id === user.id ? chat.user2 : chat.user1;
    }
    if (chat.participants) {
      return chat.participants.find(p => p.id !== user.id) || {};
    }
    return {};
  };

  const chatType = activeChat?.type || (activeChat?.service ? 'SERVICE' : 'JOB');
  const canCreateOffer = user?.role === 'FREELANCER' && chatType === 'SERVICE';

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden font-sans">

      {/* --- SIDEBAR --- */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col ${currentChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-extrabold text-slate-800">ข้อความ</h2>
          </div>
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"><MoreVertical size={20} /></button>
        </div>

        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="ค้นหาชื่อ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-2 space-y-1">
          {isLoadingList ? <div className="p-4 text-center text-slate-400">Loading...</div> : filteredConversations.map((chat) => {
            const otherUser = getOtherUser(chat);
            const isActive = chat.id === currentChatId;
            const lastMessage = chat.lastMessage?.content || "เริ่มบทสนทนาใหม่";
            const lastTime = chat.lastMessage?.createdAt;
            const isJob = chat.type === 'JOB';

            return (
              <div key={chat.id} onClick={() => navigate(`/chat/${chat.id}`)} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isActive ? 'bg-blue-50 border-blue-100 shadow-sm' : 'hover:bg-slate-50 border-transparent'}`}>
                <div className="relative shrink-0 mt-1">
                  <img src={getImageUrl(otherUser.profileImageUrl) || `https://ui-avatars.com/api/?name=${otherUser.firstName || 'U'}`} alt="avatar" className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-100" />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white ${isJob ? 'bg-orange-500' : 'bg-blue-500'}`}>{isJob ? <Briefcase size={10} /> : <UserIcon size={10} />}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={`text-sm font-bold truncate ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>{otherUser.firstName} {otherUser.lastName}</h4>
                    {lastTime && <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">{formatTime(lastTime)}</span>}
                  </div>
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1 truncate">
                    {chat.jobTitle && <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold truncate max-w-[120px]">{chat.jobTitle}</span>}
                    {chat.serviceTitle && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold truncate max-w-[120px]">{chat.serviceTitle}</span>}
                  </div>
                  <p className={`text-xs truncate ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{lastMessage.startsWith('[OFFER]') ? '📄 ใบเสนอราคา' : lastMessage}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MAIN CHAT WINDOW --- */}
      <div className={`flex-1 flex flex-col bg-white w-full ${!currentChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            <div className="h-16 px-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/chat')} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"><ArrowLeft size={20} /></button>
                <img src={getImageUrl(getOtherUser(activeChat).profileImageUrl) || `https://ui-avatars.com/api/?name=${getOtherUser(activeChat).firstName || 'U'}`} className="w-10 h-10 rounded-full object-cover shadow-sm cursor-pointer" onClick={() => navigate(activeChat.type === 'SERVICE' ? `/freelancers/${getOtherUser(activeChat).id}` : '#')} alt="avatar" />
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">{getOtherUser(activeChat).firstName} {getOtherUser(activeChat).lastName}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">{activeChat.type === 'JOB' ? 'Employer' : 'Freelancer'} • Active now</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-400 relative" ref={menuRef}>
                <button className="p-2 hover:bg-slate-50 hover:text-blue-600 rounded-full transition-all"><Phone size={20} /></button>
                <button onClick={() => setShowMenu(!showMenu)} className={`p-2 rounded-full transition-all ${showMenu ? 'bg-slate-100 text-slate-700' : 'hover:bg-slate-50 hover:text-slate-600'}`}><MoreVertical size={20} /></button>
                {showMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => { setShowMenu(false); setShowDeleteModal(true); }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={16} /> ลบแชทนี้</button>
                  </div>
                )}
              </div>
            </div>

            {(activeChat.jobTitle || activeChat.serviceTitle) && (
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2 font-medium"><Briefcase size={14} className="text-slate-400" /> {activeChat.type === 'JOB' ? 'สมัครงาน:' : 'บริการ:'} <span className="font-bold text-slate-800">{activeChat.jobTitle || activeChat.serviceTitle}</span></div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll bg-[#FDFDFD]" ref={chatContainerRef}>
              {isLoadingChat ? <div className="flex items-center justify-center h-full"><LoadingSpinner /></div> : messages.map((msg, index) => {
                const isMe = msg.senderId === user.id;
                const isOffer = msg.content && msg.content.startsWith('[OFFER]');
                const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                let content = null;

                if (isOffer) {
                  const { price, detail } = parseOfferMessage(msg.content);
                  const workStatus = activeChat?.freelancerWork;
                  const isPaid = workStatus?.isPayerPaid || (workStatus?.status && workStatus?.status !== 'OFFER_PENDING');
                  const currentStatus = workStatus?.status;

                  content = (
                    <div className="w-full max-w-sm">
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                          <div className="flex items-center gap-2 text-slate-700 font-bold text-sm"><Receipt size={18} className="text-blue-600" /> ใบเสนอราคา</div>
                        </div>
                        <div className="p-5 flex flex-col gap-3">
                          <div className="text-center">
                            <div className="text-sm text-slate-500 mb-1">ยอดสุทธิ</div>
                            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">฿{price}</div>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 leading-relaxed border border-dashed border-slate-200">
                            <span className="font-bold text-slate-700 block mb-1">รายละเอียด:</span>{detail}
                          </div>
                        </div>
                        <div className="p-4 pt-0">
                          {user?.id === workStatus?.freelancerId ? (
                            // 👷‍♂️ ส่วนของ Freelancer
                            (isPaid && currentStatus === 'OFFER_PENDING') ? (
                              <button onClick={() => handleUpdateStatus(workStatus.id, 'IN_PROGRESS')} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                                <PlayCircle size={18} /> ยืนยันรับงาน / เริ่มงาน
                              </button>
                            ) : (currentStatus === 'IN_PROGRESS' || currentStatus === 'REVISION_REQUESTED') ? (
                              <button onClick={() => handleUpdateStatus(workStatus.id, 'SUBMITTED')} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5">
                                <Package size={18} /> ส่งมอบงาน {currentStatus === 'REVISION_REQUESTED' && '(แก้ไขแล้ว)'}
                              </button>
                            ) : currentStatus === 'SUBMITTED' ? (
                              <button disabled className="w-full py-2.5 bg-purple-50 text-purple-600 font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-purple-200"><Clock size={18} /> รอการตรวจสอบจากลูกค้า</button>
                            ) : currentStatus === 'COMPLETED' ? (
                              <button disabled className="w-full py-2.5 bg-green-50 text-green-600 font-bold rounded-xl text-sm flex items-center justify-center gap-2 border border-green-200"><Trophy size={18} /> งานเสร็จสมบูรณ์</button>
                            ) : (
                              <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed"><Clock size={16} /> รอการชำระเงิน</button>
                            )
                          ) : (
                            // 👔 ส่วนของ Employer
                            currentStatus === 'SUBMITTED' ? (
                              <div className="flex gap-2">
                                <button onClick={() => handleUpdateStatus(workStatus.id, 'REVISION_REQUESTED')} className="flex-1 py-2.5 bg-orange-100 text-orange-700 hover:bg-orange-200 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"><FileEdit size={18} /> ขอแก้ไข</button>
                                <button onClick={() => handleUpdateStatus(workStatus.id, 'COMPLETED')} className="flex-[2] py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5"><Trophy size={18} /> อนุมัติ / จบงาน</button>
                              </div>
                            ) : isPaid ? (
                              <div className="flex flex-col gap-2 w-full">
                                <button disabled className={`w-full py-2.5 font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-not-allowed border ${currentStatus === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-200' : currentStatus === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-200' : currentStatus === 'REFUNDED' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                  {currentStatus === 'IN_PROGRESS' && <><PlayCircle size={18} /> ฟรีแลนซ์กำลังทำงาน</>}
                                  {currentStatus === 'REVISION_REQUESTED' && <><FileEdit size={18} /> รอแก้ไขงาน</>}
                                  {currentStatus === 'COMPLETED' && <><Trophy size={18} /> งานเสร็จสิ้นแล้ว</>}
                                  {currentStatus === 'OFFER_PENDING' && <><CheckCheck size={18} /> ชำระเงินแล้ว / รอรับงาน</>}
                                  {currentStatus === 'REFUNDED' && <><X size={18} /> งานถูกยกเลิก (คืนเงินแล้ว)</>}
                                </button>
                                {currentStatus === 'OFFER_PENDING' && (
                                  <button onClick={() => handleCancelWork(workStatus.id)} className="text-xs text-red-500 hover:text-red-700 underline py-1 transition-colors self-center">ยกเลิกการจ้างและขอคืนเงิน</button>
                                )}
                              </div>
                            ) : (
                              // ✅ ปุ่มใหม่: พาไปหน้า My Hires แทนการจ่ายตรงนี้
                              <button onClick={handleGoToPayment} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                                <CreditCard size={18} /> ไปที่เมนู "งานที่ฉันจ้าง" เพื่อชำระเงิน
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                } else if (msg.content && msg.content.startsWith('[STATUS:')) {
                  const { type, title, desc } = parseStatusMessage(msg.content);
                  let statusConfig = {
                    IN_PROGRESS: { color: 'bg-blue-50 border-blue-200 text-blue-800', icon: <PlayCircle size={24} className="text-blue-600" /> },
                    SUBMITTED: { color: 'bg-purple-50 border-purple-200 text-purple-800', icon: <Package size={24} className="text-purple-600" /> },
                    REVISION_REQUESTED: { color: 'bg-orange-50 border-orange-200 text-orange-800', icon: <FileEdit size={24} className="text-orange-600" /> },
                    COMPLETED: { color: 'bg-green-50 border-green-200 text-green-800', icon: <Trophy size={24} className="text-green-600" /> },
                    REFUNDED: { color: 'bg-red-50 border-red-200 text-red-800', icon: <AlertTriangle size={24} className="text-red-600" /> },
                  }[type] || { color: 'bg-slate-50 border-slate-200 text-slate-800', icon: <CheckCircle2 size={24} className="text-slate-600" /> };

                  content = (
                    <div className="w-full max-w-sm my-2">
                      <div className={`rounded-2xl border ${statusConfig.color} overflow-hidden shadow-sm`}>
                        <div className="p-4 flex gap-4 items-start">
                          <div className="p-2 bg-white rounded-full shadow-sm shrink-0">{statusConfig.icon}</div>
                          <div><h4 className="font-bold text-sm mb-1">{title}</h4><p className="text-xs opacity-80 leading-relaxed">{desc}</p></div>
                        </div>
                        <div className="px-4 py-2 bg-white/50 text-[10px] font-medium text-right opacity-70 border-t border-black/5">{formatTime(msg.createdAt)}</div>
                      </div>
                    </div>
                  );
                  return <div key={msg.id} className="flex justify-center my-4 w-full px-4">{content}</div>;
                } else if (msg.fileType === 'IMAGE') {
                  content = (<div className=""><img src={getImageUrl(msg.fileUrl)} alt="attachment" className="rounded-lg max-w-full max-h-72 object-cover cursor-pointer hover:opacity-95 transition-opacity border border-slate-200" onClick={() => window.open(getImageUrl(msg.fileUrl), '_blank')} /></div>);
                } else if (msg.fileType === 'FILE') {
                  const fileName = msg.fileUrl ? msg.fileUrl.split('/').pop() : 'Attached File';
                  content = (<a href={getImageUrl(msg.fileUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-100 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors border border-slate-200 group/file"><div className="p-2 bg-white rounded-lg shadow-sm text-slate-500 group-hover/file:text-blue-600"><Paperclip size={20} /></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate max-w-[150px]">{fileName}</p><p className="text-xs text-slate-400">คลิกเพื่อดาวน์โหลด</p></div></a>);
                } else {
                  content = msg.content;
                }

                const bubbleStyle = isOffer ? "flex justify-center my-4 w-full" : `px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'} ${msg.fileType ? 'p-1.5 bg-white border-slate-200 hover:shadow-md transition-shadow' : ''}`;
                if (isOffer) return <div key={msg.id} className="flex justify-center my-6 zoom-in-95 duration-200 w-full">{content}</div>;

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-2`}>
                    {!isMe && (<div className={`w-8 h-8 mr-2 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}><img src={getImageUrl(getOtherUser(activeChat).profileImageUrl)} className="w-full h-full rounded-full object-cover shadow-sm" alt="avatar" /></div>)}
                    <div className={`max-w-[75%] lg:max-w-[65%]`}>
                      <div className={bubbleStyle}>{content}</div>
                      <div className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 ${isMe ? 'justify-end' : 'justify-start'}`}><span>{formatTime(msg.createdAt)}</span>{isMe && (msg.isSending ? <span>Sending...</span> : <CheckCheck size={12} className="text-blue-500" />)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100 relative">
              {selectedFile && (<div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 mx-auto max-w-4xl relative animate-in fade-in slide-in-from-bottom-2"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg">{selectedFile.type.startsWith('image/') ? <Image size={20} /> : <Paperclip size={20} />}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate text-slate-700">{selectedFile.name}</p><p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p></div><button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-red-500"><X size={18} /></button></div>)}
              {showEmoji && (<div className="absolute bottom-20 right-4 z-50 shadow-2xl rounded-2xl border border-slate-200 animate-in zoom-in-95 origin-bottom-right"><EmojiPicker onEmojiClick={onEmojiClick} searchDisabled skinTonesDisabled height={350} width={300} previewConfig={{ showPreview: false }} /></div>)}
              <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx" />
                <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-3 rounded-full transition-colors ${selectedFile ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50'}`}><Paperclip size={20} /></button>
                {canCreateOffer && (<button type="button" onClick={() => setShowOfferModal(true)} className="p-3 text-white bg-green-600 hover:bg-green-700 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 px-4" title="เสนอราคา"><DollarSign size={18} /><span className="hidden md:inline font-bold text-sm">เสนอราคา</span></button>)}
                <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all"><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="พิมพ์ข้อความ..." className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 py-1" /><Smile size={20} onClick={() => setShowEmoji(!showEmoji)} className={`cursor-pointer ml-2 transition-colors ${showEmoji ? 'text-yellow-500' : 'text-slate-400 hover:text-yellow-500'}`} /></div>
                <button type="submit" disabled={!newMessage.trim() && !selectedFile} className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all"><Send size={20} /></button>
              </form>
            </div>
          </>
        ) : <div className="hidden md:flex flex-col items-center justify-center h-full bg-slate-50 text-slate-400"><MessageCircle size={64} className="mb-4 text-slate-300" /><p>เลือกแชทเพื่อเริ่มสนทนา</p></div>}
      </div>

      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-green-600 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <CreditCard size={20} /> เสนอราคา / สร้างใบแจ้งหนี้
              </h3>
              <button
                onClick={() => !isSubmittingOffer && setShowOfferModal(false)} // ห้ามปิดตอนกำลังโหลด
                className="hover:bg-white/20 p-1 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">ราคาที่เสนอ (บาท)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    disabled={isSubmittingOffer}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-bold text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">รายละเอียดงาน / เงื่อนไข</label>
                <textarea
                  value={offerDetail}
                  onChange={(e) => setOfferDetail(e.target.value)}
                  disabled={isSubmittingOffer}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none min-h-[100px]"
                  placeholder="ระบุรายละเอียดงาน สิ่งที่จะได้รับ และระยะเวลา..."
                ></textarea>
              </div>

              {/* ✅ 3. ปุ่มที่แก้ไขแล้ว (มี Loading State) */}
              <button
                onClick={handleSendOffer}
                disabled={isSubmittingOffer}
                className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isSubmittingOffer
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 hover:shadow-green-500/30'
                  }`}
              >
                {isSubmittingOffer ? (
                  <>
                    <LoadingSpinner size={20} color="white" /> กำลังบันทึก...
                  </>
                ) : (
                  "ส่งใบเสนอราคา"
                )}
              </button>

            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><AlertTriangle size={32} /></div>
            <h3 className="font-bold text-xl text-slate-800 mb-2">ลบแชทนี้?</h3>
            <p className="text-slate-500 mb-6">คุณแน่ใจหรือไม่ที่จะลบประวัติการสนทนานี้? <br /> การกระทำนี้ไม่สามารถเรียกคืนได้</p>
            <div className="flex gap-3"><button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">ยกเลิก</button><button onClick={handleDeleteChat} className="flex-1 py-3 text-white font-bold bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-500/30 transition-colors">ลบถาวร</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;