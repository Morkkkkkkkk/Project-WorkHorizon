import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { disputeApi } from "../api/disputeApi";
import { useAuth } from "../contexts/AuthContext";
import { 
  ArrowLeft, Send, Paperclip, AlertCircle, CheckCircle, 
  ShieldAlert, User, MessageSquare 
} from "lucide-react"; // ใช้ Lucide Icons เพิ่มความสวยงาม
import { BACKEND_URL } from "../api/apiClient"; // เพื่อดึงรูปโปรไฟล์

export default function DisputeChatPage() {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef(null); // สำหรับเลื่อนแชทลงล่างสุดอัตโนมัติ

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูล Ticket
  const fetchTicket = async () => {
    try {
      const res = await disputeApi.getDetail(ticketId);
      setTicket(res.data);
      setMessages(res.data.messages);
    } catch (error) {
      console.error("Error fetching dispute:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 5000);
    return () => clearInterval(interval);
  }, [ticketId]);

  // เลื่อนลงล่างสุดเสมอเมื่อมีข้อความใหม่
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ส่งข้อความ
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await disputeApi.reply({
        ticketId,
        content: newMessage,
        fileUrl: null 
      });
      setNewMessage("");
      fetchTicket(); 
    } catch (error) {
      alert("ส่งข้อความไม่สำเร็จ");
    }
  };

  // (Admin) ตัดสินเคส
  const handleResolve = async (resolution) => {
    const confirmMsg = resolution === 'REFUND' 
      ? "ยืนยันคืนเงินให้ผู้จ้าง (Refund)?" 
      : "ยืนยันให้งานผ่านและจ่ายเงินฟรีแลนซ์ (Complete)?";
      
    if (!window.confirm(confirmMsg)) return;
    
    try {
      await disputeApi.resolve({ ticketId, resolution });
      fetchTicket();
    } catch (error) {
      alert("เกิดข้อผิดพลาด: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!ticket) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-500">
      <AlertCircle size={48} className="mb-4 text-red-400" />
      <p className="text-lg">ไม่พบข้อมูลข้อพิพาท</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">ย้อนกลับ</button>
    </div>
  );

  const isResolved = ticket.status.startsWith("RESOLVED") || ticket.status === "CLOSED";

  // Helper สำหรับแสดงสถานะ
  const getStatusBadge = (status) => {
    const styles = {
      'OPEN': 'bg-red-100 text-red-700 border-red-200',
      'IN_PROGRESS': 'bg-orange-100 text-orange-700 border-orange-200',
      'RESOLVED_REFUNDED': 'bg-green-100 text-green-700 border-green-200',
      'RESOLVED_COMPLETED': 'bg-blue-100 text-blue-700 border-blue-200',
      'CLOSED': 'bg-gray-100 text-gray-600 border-gray-200'
    };
    const labels = {
        'OPEN': 'เปิดข้อพิพาท',
        'IN_PROGRESS': 'กำลังตรวจสอบ',
        'RESOLVED_REFUNDED': 'คืนเงินแล้ว',
        'RESOLVED_COMPLETED': 'งานเสร็จสมบูรณ์',
        'CLOSED': 'ปิดเคส'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles['CLOSED']}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 font-sans">
      <div className="max-w-5xl mx-auto h-[calc(100vh-3rem)] flex flex-col">
        
        {/* Header Section */}
        <div className="bg-white rounded-t-2xl shadow-sm border-b border-slate-100 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert size={20} className="text-red-500" />
                  Dispute #{ticket.ticketNumber}
                </h1>
                {getStatusBadge(ticket.status)}
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <span className="font-medium text-slate-700">{ticket.work?.jobTitle}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>เหตุผล: <span className="text-red-600">{ticket.reason}</span></span>
              </p>
            </div>
          </div>
          
          {/* Admin Tools (Desktop) */}
          {user?.role === "SUPER_ADMIN" && !isResolved && (
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => handleResolve("REFUND")}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold border border-red-200 transition-colors"
              >
                คืนเงิน (Refund)
              </button>
              <button
                onClick={() => handleResolve("COMPLETE")}
                className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-bold border border-green-200 transition-colors"
              >
                จ่ายเงิน (Complete)
              </button>
            </div>
          )}
        </div>

        {/* Dispute Details & Description */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 shadow-sm text-sm">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600">
                <span className="font-bold text-slate-700 block mb-1">รายละเอียดปัญหา:</span>
                {ticket.description}
            </div>
            
            {/* Admin Tools (Mobile) */}
            {user?.role === "SUPER_ADMIN" && !isResolved && (
                <div className="flex md:hidden gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button onClick={() => handleResolve("REFUND")} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-200">คืนเงิน</button>
                    <button onClick={() => handleResolve("COMPLETE")} className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-200">จ่ายเงิน</button>
                </div>
            )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-6">
          {/* Start Message */}
          <div className="flex justify-center">
            <span className="text-xs text-slate-400 bg-slate-200 px-3 py-1 rounded-full">
              เริ่มการสนทนาเมื่อ {new Date(ticket.createdAt).toLocaleDateString('th-TH')}
            </span>
          </div>

          {messages.map((msg, index) => {
            const isMe = msg.senderId === user.id;
            const isAdmin = msg.sender?.role === "SUPER_ADMIN";
            const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;

            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                
                {/* Avatar (Left) */}
                {!isMe && showAvatar && (
                  <div className="w-8 h-8 flex-shrink-0 mt-1">
                    {isAdmin ? (
                        <div className="w-full h-full bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center border border-yellow-200">
                            <ShieldAlert size={16} />
                        </div>
                    ) : (
                        <img 
                            src={msg.sender?.profileImageUrl ? `${BACKEND_URL}${msg.sender.profileImageUrl}` : "https://placehold.co/40"} 
                            className="w-full h-full rounded-full object-cover border border-slate-200"
                            alt=""
                        />
                    )}
                  </div>
                )}
                {!isMe && !showAvatar && <div className="w-8 flex-shrink-0" />}

                {/* Message Bubble */}
                <div className={`max-w-[75%] md:max-w-[60%] space-y-1 ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                    {!isMe && showAvatar && (
                        <span className="text-xs text-slate-500 ml-1">
                            {isAdmin ? "Admin Support" : msg.sender?.firstName}
                        </span>
                    )}
                    
                    <div className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed relative group
                        ${isMe 
                            ? "bg-blue-600 text-white rounded-tr-none" 
                            : isAdmin 
                                ? "bg-yellow-50 text-yellow-900 border border-yellow-200 rounded-tl-none"
                                : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                        }
                    `}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        
                        {msg.fileUrl && (
                            <a 
                                href={msg.fileUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className={`flex items-center gap-2 mt-2 p-2 rounded-lg text-xs font-medium transition-colors
                                    ${isMe ? "bg-blue-500 hover:bg-blue-400 text-blue-50" : "bg-slate-100 hover:bg-slate-200 text-slate-600"}
                                `}
                            >
                                <Paperclip size={14} /> ดูไฟล์แนบ
                            </a>
                        )}
                        
                        <span className={`text-[10px] absolute bottom-1 right-3 opacity-60 
                            ${isMe ? "text-blue-100" : "text-slate-400"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>

              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 rounded-b-2xl border-t border-slate-100 shadow-lg z-20">
          {!isResolved ? (
            <form onSubmit={handleSend} className="flex gap-3 items-end">
              <button 
                type="button" 
                className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                title="แนบไฟล์ (ยังไม่เปิดใช้งาน)"
              >
                <Paperclip size={20} />
              </button>
              
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder="พิมพ์ข้อความ... (Shift+Enter เพื่อขึ้นบรรทัดใหม่)"
                  className="w-full bg-transparent outline-none text-slate-700 text-sm resize-none max-h-32 py-1"
                  rows={1}
                  style={{ minHeight: '24px' }} 
                />
              </div>

              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <Send size={20} />
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
              <CheckCircle size={20} className="text-green-500" />
              <span className="font-medium">เคสนี้ถูกปิดแล้ว ไม่สามารถส่งข้อความได้</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}