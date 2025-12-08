import React, { useState } from 'react';
import { applicationApi } from '../api/applicationApi';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '../api/apiClient.js';
import { Mail, FileText, Star, MessageSquare, Trash2, MessageCircle, Calendar, User as UserIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { conversationApi } from '../api/conversationApi.js';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

/* === MODERNIZED: Status Configuration === */
const statusConfig = {
  PENDING: {
    text: "สมัครใหม่",
    color: "text-slate-700",
    bg: "bg-slate-100",
    borderColor: "border-slate-200"
  },
  REVIEWED: {
    text: "กำลังพิจารณา",
    color: "text-blue-700",
    bg: "bg-blue-100",
    borderColor: "border-blue-200"
  },
  SHORTLISTED: {
    text: "นัดสัมภาษณ์",
    color: "text-green-700",
    bg: "bg-green-100",
    borderColor: "border-green-200"
  },
  REJECTED: {
    text: "ปฏิเสธ",
    color: "text-red-700",
    bg: "bg-red-100",
    borderColor: "border-red-200"
  },
  HIRED: {
    text: "จ้างแล้ว",
    color: "text-purple-700",
    bg: "bg-purple-100",
    borderColor: "border-purple-200"
  },
  COMPLETED: {
    text: "เสร็จสิ้น",
    color: "text-amber-700",
    bg: "bg-amber-100",
    borderColor: "border-amber-200"
  }
};

/* === MODERNIZED: Status Action Button === */
const StatusActionButton = ({ onClick, text, colorClass }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-bold rounded-xl ${colorClass} hover:opacity-80 transition-all shadow-sm`}
  >
    {text}
  </button>
);

/* === MODERNIZED: Star Rating Component === */
const StarRating = ({ rating, onRate }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="transition-all hover:scale-110"
        >
          <Star
            size={20}
            className={
              (hoverRating >= star || rating >= star)
                ? "text-yellow-500 fill-yellow-500"
                : "text-slate-300"
            }
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm font-bold text-slate-600">({rating}/5)</span>
      )}
    </div>
  );
};

/* === MODERNIZED: Note Form === */
const NoteForm = ({ appId, onNoteAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const { data: newNote } = await applicationApi.addInternalNote(appId, content);
      onNoteAdded(newNote);
      setContent('');
      toast.success("เพิ่มโน้ตสำเร็จ");
    } catch (err) {
      toast.error("เพิ่มโน้ตไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        placeholder="เพิ่มโน้ตภายใน..."
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400 resize-none text-sm"
      />
      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="mt-2 px-5 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกโน้ต'}
      </button>
    </form>
  );
};

/* === MODERNIZED: Main Applicant Card Component === */
const ApplicantCard = ({ application, onUpdate, onStatusChange, onDelete }) => {
  const { user: authUser } = useAuth();
  const { user } = application;
  const navigate = useNavigate();

  const [showDetails, setShowDetails] = useState(false);

  /* === Handlers === */
  const handleRate = async (rating) => {
    try {
      const { data: newRating } = await applicationApi.setApplicantRating(application.id, rating);
      onUpdate(application.id, 'rating', newRating);
      toast.success("ให้คะแนนสำเร็จ");
    } catch (err) {
      toast.error("ให้คะแนนไม่สำเร็จ");
    }
  };

  const handleNoteAdded = (newNote) => {
    onUpdate(application.id, 'note', newNote);
  };

  const myRating = application.ratings?.find(r => r.raterId === authUser.id)?.rating || 0;

  const currentStatusInfo = statusConfig[application.status] || statusConfig.PENDING;

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(application.id, `${user.firstName} ${user.lastName}`);
  };

  // ✅ Helper function to construct full URL from relative path
  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  const userProfileImg = getImageUrl(user.profileImageUrl) ||
    `https://placehold.co/100x100/E0E0E0/777?text=${user.firstName.charAt(0)}`;

  const handleChatClick = async (e) => {
    e.stopPropagation();
    try {
      const { data } = await conversationApi.getConversationByApp(application.id);
      navigate(`/chat/${data.conversationId}`);
    } catch (err) {
      toast.error("ไม่สามารถเริ่มแชทได้: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 p-6">

      {/* === MODERNIZED: Header - Applicant Info & Status === */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-4 flex-1">
          <Link to={`/freelancers/${user.id}`} target="_blank" className="shrink-0 relative">
            <img
              src={userProfileImg}
              alt="Profile"
              className="w-14 h-14 rounded-xl object-cover border-2 border-slate-100 shadow-md hover:border-blue-200 transition-colors"
            />
          </Link>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors mb-1">
              <Link to={`/freelancers/${user.id}`} target="_blank">
                {user.firstName} {user.lastName}
              </Link>
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar size={14} />
              <span>สมัครเมื่อ: {new Date(application.appliedAt).toLocaleDateString("th-TH", {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm border ${currentStatusInfo.bg} ${currentStatusInfo.color} ${currentStatusInfo.borderColor}`}>
          {currentStatusInfo.text}
        </span>
      </div>

      {/* === MODERNIZED: Rating Section === */}
      <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Star size={16} className="text-yellow-500" /> ให้คะแนนผู้สมัคร
        </h4>
        <StarRating rating={myRating} onRate={handleRate} />
      </div>

      {/* === MODERNIZED: Action Buttons Row === */}
      <div className="flex flex-wrap gap-3 mb-5">
        <button
          onClick={() => setShowDetails(prev => !prev)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all text-sm"
        >
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {showDetails ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
        </button>

        {/* ✅ Resume Button with BACKEND_URL prefix */}
        {application.resume?.url && (
          <a
            href={getImageUrl(application.resume.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all text-sm"
          >
            <FileText size={16} /> Resume
          </a>
        )}

        <button
          onClick={handleChatClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 font-bold rounded-xl hover:bg-green-100 transition-all text-sm"
          title="เริ่มแชทกับผู้สมัคร"
        >
          <MessageCircle size={16} /> แชท
        </button>
      </div>

      {/* === MODERNIZED: Status Change Actions === */}
      <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">

        {application.status !== 'HIRED' && application.status !== 'COMPLETED' && (
          <>
            <span className="text-sm font-bold text-slate-500">เปลี่ยนสถานะ:</span>

            {application.status !== 'REVIEWED' && (
              <StatusActionButton
                onClick={() => onStatusChange(application.id, 'REVIEWED')}
                text="พิจารณา"
                colorClass="bg-blue-100 text-blue-700 hover:bg-blue-200"
              />
            )}

            {application.status !== 'SHORTLISTED' && (
              <StatusActionButton
                onClick={() => onStatusChange(application.id, 'SHORTLISTED')}
                text="สัมภาษณ์"
                colorClass="bg-green-100 text-green-700 hover:bg-green-200"
              />
            )}

            <StatusActionButton
              onClick={() => onStatusChange(application.id, 'HIRED')}
              text="จ้างแล้ว"
              colorClass="bg-purple-100 text-purple-700 hover:bg-purple-200"
            />

            {application.status !== 'REJECTED' && (
              <StatusActionButton
                onClick={() => onStatusChange(application.id, 'REJECTED')}
                text="ปฏิเสธ"
                colorClass="bg-red-100 text-red-700 hover:bg-red-200"
              />
            )}
          </>
        )}

        {application.status === 'HIRED' && (
          <>
            <span className="text-sm font-bold text-purple-600">✓ จ้างงานแล้ว</span>
            <StatusActionButton
              onClick={() => onStatusChange(application.id, 'COMPLETED')}
              text="เสร็จสิ้นงาน"
              colorClass="bg-amber-500 text-white hover:bg-amber-600"
            />
          </>
        )}

        {application.status === 'COMPLETED' && (
          <span className="text-sm font-bold text-amber-600">✓ งานเสร็จสิ้นแล้ว</span>
        )}

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="ml-auto flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 font-bold rounded-xl hover:bg-red-100 transition-all"
          title="ลบใบสมัครนี้อย่างถาวร"
        >
          <Trash2 size={16} /> ลบใบสมัคร
        </button>
      </div>

      {/* === MODERNIZED: Expandable Details Section === */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-5">

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-bold text-sm text-blue-900 mb-3 flex items-center gap-2">
                <FileText size={16} /> Cover Letter
              </h4>
              <p className="text-sm text-slate-700 italic whitespace-pre-wrap leading-relaxed">
                {application.coverLetter}
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
              <Mail size={16} /> ข้อมูลติดต่อ
            </h4>
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <Mail size={14} className="text-slate-400" /> {user.email}
            </p>
          </div>

          {/* Internal Notes */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2">
              <MessageSquare size={16} /> โน้ตภายใน (ทีม)
            </h4>

            <NoteForm appId={application.id} onNoteAdded={handleNoteAdded} />

            <div className="space-y-3 mt-4 max-h-64 overflow-y-auto custom-scroll">
              {application.internalNotes?.map(note => {
                const authorProfileImg = getImageUrl(note.author.profileImageUrl) ||
                  `https://placehold.co/100x100/E0E0E0/777?text=${note.author.firstName.charAt(0)}`;

                return (
                  <div key={note.id} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-100">
                    <img
                      src={authorProfileImg}
                      alt={note.author.firstName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-slate-100"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-700 mb-1">{note.author.firstName} {note.author.lastName}</p>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    </div>
                  </div>
                )
              })}

              {(!application.internalNotes || application.internalNotes.length === 0) && (
                <p className="text-center text-sm text-slate-400 py-4">ยังไม่มีโน้ตภายใน</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantCard;