import React, { useState, useEffect } from 'react';
import { applicationApi } from '../api/applicationApi';
import { jobApi } from '../api/jobApi'; // Keep jobApi if needed for job details display, otherwise can be removed if not used for payment logic. Kept for title.
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '../api/apiClient.js';
import { Mail, FileText, Star, MessageSquare, Trash2, MessageCircle, Calendar, User as UserIcon, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { conversationApi } from '../api/conversationApi.js';
import { toast } from 'react-toastify';
import Modal from '../components/Modal.jsx';

/* === Status Configuration === */
const statusConfig = {
  PENDING: { text: "สมัครใหม่", color: "text-slate-700", bg: "bg-slate-100", borderColor: "border-slate-200" },
  REVIEWED: { text: "กำลังพิจารณา", color: "text-blue-700", bg: "bg-blue-100", borderColor: "border-blue-200" },
  SHORTLISTED: { text: "นัดสัมภาษณ์", color: "text-green-700", bg: "bg-green-100", borderColor: "border-green-200" },
  REJECTED: { text: "ปฏิเสธ", color: "text-red-700", bg: "bg-red-100", borderColor: "border-red-200" },
  HIRED: { text: "จ้างแล้ว", color: "text-purple-700", bg: "bg-purple-100", borderColor: "border-purple-200" },
  COMPLETED: { text: "เสร็จสิ้น", color: "text-amber-700", bg: "bg-amber-100", borderColor: "border-amber-200" }
};

/* === Helper Components === */
const StatusActionButton = ({ onClick, text, colorClass }) => (
  <button onClick={onClick} className={`px-4 py-2 text-sm font-bold rounded-xl ${colorClass} hover:opacity-80 transition-all shadow-sm`}>{text}</button>
);

const StarRating = ({ rating, onRate }) => {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} onClick={() => onRate(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="transition-all hover:scale-110">
          <Star size={20} className={(hoverRating >= star || rating >= star) ? "text-yellow-500 fill-yellow-500" : "text-slate-300"} />
        </button>
      ))}
      {rating > 0 && <span className="ml-2 text-sm font-bold text-slate-600">({rating}/5)</span>}
    </div>
  );
};

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
    } catch (err) { toast.error("เพิ่มโน้ตไม่สำเร็จ"); } finally { setIsSubmitting(false); }
  };
  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} placeholder="เพิ่มโน้ตภายใน..." className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none text-sm" />
      <button type="submit" disabled={isSubmitting || !content.trim()} className="mt-2 px-5 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl text-sm">{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกโน้ต'}</button>
    </form>
  );
};

/* === Applicant Card === */
const ApplicantCard = ({ application, onUpdate, onStatusChange, onDelete }) => {
  const { user: authUser } = useAuth();
  const { user } = application;
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const handleRate = async (rating) => {
    try {
      const { data: newRating } = await applicationApi.setApplicantRating(application.id, rating);
      onUpdate(application.id, 'rating', newRating);
      toast.success("ให้คะแนนสำเร็จ");
    } catch (err) { toast.error("ให้คะแนนไม่สำเร็จ"); }
  };

  const handleNoteAdded = (newNote) => onUpdate(application.id, 'note', newNote);
  const handleDelete = (e) => { e.stopPropagation(); onDelete(application.id, `${user.firstName} ${user.lastName}`); };
  const getImageUrl = (url) => (!url || url.startsWith('http')) ? url : `${BACKEND_URL}${url}`;
  const userProfileImg = getImageUrl(user.profileImageUrl) || `https://placehold.co/100x100/E0E0E0/777?text=${user.firstName.charAt(0)}`;

  const handleChatClick = async (e) => {
    e.stopPropagation();
    try {
      const { data } = await conversationApi.getConversationByApp(application.id);
      navigate(`/chat/${data.conversationId}`);
    } catch (err) { toast.error("ไม่สามารถเริ่มแชทได้: " + (err.response?.data?.error || err.message)); }
  };

  const myRating = application.ratings?.find(r => r.raterId === authUser.id)?.rating || 0;
  const currentStatusInfo = statusConfig[application.status] || statusConfig.PENDING;

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl p-6 transition-all duration-300">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-4 flex-1">
          <Link to={`/freelancers/${user.id}`} target="_blank" className="shrink-0 relative">
            <img src={userProfileImg} alt="Profile" className="w-14 h-14 rounded-xl object-cover border-2 border-slate-100 shadow-md" />
          </Link>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors mb-1">
              <Link to={`/freelancers/${user.id}`} target="_blank">{user.firstName} {user.lastName}</Link>
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar size={14} />
              <span>สมัครเมื่อ: {new Date(application.appliedAt).toLocaleDateString("th-TH", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <span className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm border ${currentStatusInfo.bg} ${currentStatusInfo.color} ${currentStatusInfo.borderColor}`}>{currentStatusInfo.text}</span>
      </div>

      <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Star size={16} className="text-yellow-500" /> ให้คะแนนผู้สมัคร</h4>
        <StarRating rating={myRating} onRate={handleRate} />
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <button onClick={() => setShowDetails(prev => !prev)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 text-sm">
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {showDetails ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
        </button>
        {application.resume?.url && (
          <a href={getImageUrl(application.resume.url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 text-sm">
            <FileText size={16} /> Resume
          </a>
        )}
        <button onClick={handleChatClick} className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 font-bold rounded-xl hover:bg-green-100 text-sm">
          <MessageCircle size={16} /> แชท
        </button>
      </div>

      <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
        {application.status !== 'HIRED' && application.status !== 'COMPLETED' && (
          <>
            <span className="text-sm font-bold text-slate-500 mr-2">เปลี่ยนสถานะ:</span>
            {application.status !== 'REVIEWED' && <StatusActionButton onClick={() => onStatusChange(application.id, 'REVIEWED')} text="พิจารณา" colorClass="bg-blue-100 text-blue-700 hover:bg-blue-200" />}
            {application.status !== 'SHORTLISTED' && <StatusActionButton onClick={() => onStatusChange(application.id, 'SHORTLISTED')} text="นัดสัมภาษณ์" colorClass="bg-green-100 text-green-700 hover:bg-green-200" />}

            {/* ✅ Restored Normal Hiring Button (No Payment) */}
            <button onClick={() => onStatusChange(application.id, 'HIRED')} className="px-5 py-2 text-sm font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md transition-all flex items-center gap-2 shadow-purple-200">
              <Briefcase size={16} /> จ้างงาน
            </button>

            {application.status !== 'REJECTED' && <StatusActionButton onClick={() => onStatusChange(application.id, 'REJECTED')} text="ปฏิเสธ" colorClass="bg-red-100 text-red-700 hover:bg-red-200" />}
          </>
        )}

        {application.status === 'HIRED' && (
          <>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-bold border border-purple-100"><Briefcase size={16} /> <span>จ้างแล้ว</span></div>
            <StatusActionButton onClick={() => onStatusChange(application.id, 'COMPLETED')} text="เสร็จสิ้นงาน" colorClass="bg-amber-500 text-white hover:bg-amber-600 shadow-md" />
          </>
        )}
        {application.status === 'COMPLETED' && <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg">✓ งานเสร็จสิ้นแล้ว</span>}

        <button onClick={handleDelete} className="ml-auto flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 font-bold rounded-xl hover:bg-red-100" title="ลบใบสมัครนี้"><Trash2 size={16} /> ลบใบสมัคร</button>
      </div>

      {showDetails && (
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-5">
          {application.coverLetter && <div className="p-5 bg-blue-50 rounded-xl border border-blue-100"><h4 className="font-bold text-sm text-blue-900 mb-3 flex items-center gap-2"><FileText size={16} /> Cover Letter</h4><p className="text-sm text-slate-700 italic">{application.coverLetter}</p></div>}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100"><h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2"><Mail size={16} /> ข้อมูลติดต่อ</h4><p className="text-sm text-slate-600"><Mail size={14} className="text-slate-400 inline mr-2" /> {user.email}</p></div>
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2"><MessageSquare size={16} /> โน้ตภายใน (ทีม)</h4>
            <NoteForm appId={application.id} onNoteAdded={handleNoteAdded} />
            <div className="space-y-3 mt-4 max-h-64 overflow-y-auto custom-scroll">
              {application.internalNotes?.map(note => (
                <div key={note.id} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-100">
                  <img src={getImageUrl(note.author.profileImageUrl) || `https://placehold.co/100x100/E0E0E0?text=${note.author.firstName.charAt(0)}`} alt={note.author.firstName} className="w-8 h-8 rounded-full" />
                  <div className="flex-1"><p className="text-xs font-bold text-slate-700">{note.author.firstName}</p><p className="text-sm text-slate-600">{note.content}</p></div>
                </div>
              ))}
              {(!application.internalNotes || application.internalNotes.length === 0) && <p className="text-center text-sm text-slate-400 py-4">ยังไม่มีโน้ตภายใน</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* === Main PAGE Component === */
const ApplicantsPage = () => {
  const { jobId } = useParams();
  const { user } = useAuth();

  // State
  const [applications, setApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch both Applications and Job Info
      const [appRes, jobRes] = await Promise.all([
        applicationApi.getApplicantsForJob(jobId),
        jobApi.getJobDetail(jobId)
      ]);

      const apps = appRes.data.applications || appRes.data || [];
      if (!Array.isArray(apps)) throw new Error("Invalid API Response: Applications is not an array");

      setApplications(apps);
      setJobDetails(jobRes.data);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApp = (appId, type, payload) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== appId) return app;
      if (type === 'rating') {
        const otherRatings = app.ratings?.filter(r => r.raterId !== user.id) || [];
        return { ...app, ratings: [...otherRatings, payload] };
      }
      if (type === 'note') {
        return { ...app, internalNotes: [payload, ...(app.internalNotes || [])] };
      }
      return app;
    }));
  };

  const handleDeleteApp = async (appId, name) => {
    if (window.confirm(`ยืนยันลบใบสมัครของ ${name}?`)) {
      try {
        await applicationApi.deleteApplication(appId);
        setApplications(prev => prev.filter(app => app.id !== appId));
        toast.success("ลบสำเร็จ");
      } catch (err) { toast.error("ลบไม่สำเร็จ"); }
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    // ✅ No Payment Interception. Just update status.
    updateApplicationStatus(appId, newStatus);
  };

  const updateApplicationStatus = async (appId, newStatus) => {
    try {
      const { data: updatedApp } = await applicationApi.updateApplicationStatus(appId, newStatus);
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: updatedApp.status } : app));
      toast.success(`เปลี่ยนสถานะเป็น ${statusConfig[newStatus]?.text || newStatus} แล้ว`);
    } catch (err) {
      toast.error("เปลี่ยนสถานะไม่สำเร็จ");
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">กำลังโหลดผู้สมัคร...</div>;
  if (error) return <div className="text-center py-20 text-red-500">เกิดข้อผิดพลาด: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">จัดการผู้สมัคร {(jobDetails?.title) && ` - ${jobDetails.title}`}</h1>
        <p className="text-slate-500">เลือกฟรีแลนซ์ที่คุณต้องการร่วมงานด้วย</p>
      </header>

      {applications.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <UserIcon size={32} className="text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">ยังไม่มีผู้สมัครสำหรับงานนี้</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map(app => (
            <ApplicantCard
              key={app.id}
              application={app}
              onUpdate={handleUpdateApp}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteApp}
            />
          ))}
        </div>
      )}

      {/* No Payment Modal in this component anymore */}
    </div>
  );
};

export default ApplicantsPage;