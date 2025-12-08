import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApplicants } from '../hooks/useApplicants';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ApplicantCard from '../components/ApplicantCard.jsx';
import { applicationApi } from '../api/applicationApi';
import { toast } from 'react-toastify';

/* === MODERNIZED UI - Import Icons === */
import { Users, ArrowLeft, Briefcase, FileText } from 'lucide-react';

/* === Tab Configuration === */
const TABS = [
  { id: 'PENDING', title: 'สมัครใหม่', color: 'slate' },
  { id: 'REVIEWED', title: 'กำลังพิจารณา', color: 'blue' },
  { id: 'SHORTLISTED', title: 'นัดสัมภาษณ์', color: 'green' },
  { id: 'REJECTED', title: 'ปฏิเสธ', color: 'red' },
  { id: 'HIRED', title: 'จ้างแล้ว', color: 'purple' },
];

/* === MODERNIZED: Tab Button Component === */
const TabButton = ({ title, count, isActive, onClick, color }) => (
  <button
    onClick={onClick}
    className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${isActive
      ? `border-${color}-600 text-${color}-600 bg-${color}-50`
      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50'
      } rounded-t-xl`}
  >
    {title}
    <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${isActive ? `bg-${color}-100 text-${color}-700` : 'bg-slate-100 text-slate-600'
      }`}>
      {count}
    </span>
  </button>
);

/* === Main Component === */
const ApplicantsPage = () => {
  const { jobId } = useParams();
  const { job, applications, isLoading, error, refreshApplicants, updateApplicantData } = useApplicants(jobId);

  const [internalApps, setInternalApps] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('PENDING');

  useEffect(() => {
    if (!isLoading && !isLoaded) {
      setInternalApps(applications);
      setIsLoaded(true);
    }
  }, [applications, isLoading, isLoaded]);

  const appCounts = useMemo(() => {
    const counts = { PENDING: 0, REVIEWED: 0, SHORTLISTED: 0, REJECTED: 0, HIRED: 0 };
    internalApps.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  }, [internalApps]);

  const filteredApps = useMemo(() => {
    return internalApps.filter(app => app.status === activeTab);
  }, [internalApps, activeTab]);

  const handleStatusChange = async (appId, newStatus) => {
    const originalApps = [...internalApps];
    setInternalApps(prev =>
      prev.map(app =>
        app.id === appId ? { ...app, status: newStatus } : app
      )
    );

    try {
      await applicationApi.updateApplicationStatus(appId, newStatus);
      await refreshApplicants();
      toast.success("เปลี่ยนสถานะเรียบร้อยแล้ว");
    } catch (err) {
      toast.error("เปลี่ยนสถานะไม่สำเร็จ: " + (err.response?.data?.error || err.message));
      setInternalApps(originalApps);
    }
  };

  const handleCardUpdate = (appId, field, newData) => {
    setInternalApps(prev =>
      prev.map(app => {
        if (app.id === appId) {
          if (field === 'rating') {
            const newRatings = (app.ratings || []).filter(r => r.raterId !== newData.raterId);
            newRatings.push(newData);
            return { ...app, ratings: newRatings };
          }
          if (field === 'note') {
            return { ...app, internalNotes: [newData, ...(app.internalNotes || [])] };
          }
        }
        return app;
      })
    );
    updateApplicantData(appId, field, newData);
  };

  const handleDeleteApplication = async (appId, applicantName) => {
    const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ที่จะลบใบสมัครของ "${applicantName}" อย่างถาวร?`);
    if (!isConfirmed) return;

    const originalApps = [...internalApps];
    setInternalApps(prev => prev.filter(app => app.id !== appId));

    try {
      await applicationApi.deleteApplication(appId);
      await refreshApplicants();
      toast.success("ลบใบสมัครเรียบร้อยแล้ว");
    } catch (err) {
      toast.error("ลบไม่สำเร็จ: " + (err.response?.data?.error || err.message));
      setInternalApps(originalApps);
    }
  };

  if (isLoading || !isLoaded) {
    return <LoadingSpinner text="กำลังโหลดใบสมัคร..." />;
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200 max-w-md">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-slate-600 mb-6">ไม่พบข้อมูลงาน หรือคุณไม่มีสิทธิ์เข้าถึง</p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            <ArrowLeft size={20} /> กลับไปหน้าแดชบอร์ด
          </Link>
        </div>
      </div>
    );
  }

  const totalApplicants = internalApps.length;

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* === MODERNIZED: Hero Header === */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-12 relative z-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white mb-6 font-medium transition-colors"
          >
            <ArrowLeft size={20} /> กลับไปหน้าแดชบอร์ด
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Users className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold mb-2 drop-shadow-lg">
                ผู้สมัครงาน
              </h1>
              <p className="text-purple-100 text-lg flex items-center gap-2">
                <Briefcase size={18} />
                {job.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-5 py-3 rounded-xl backdrop-blur-sm w-fit">
            <FileText size={18} />
            <span className="font-bold">ทั้งหมด {totalApplicants} ใบสมัคร</span>
          </div>
        </div>
      </div>

      {/* === Main Content === */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* === MODERNIZED: Tabs === */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="border-b border-slate-200 overflow-x-auto">
            <nav className="flex space-x-2 px-4 pt-4" aria-label="Tabs">
              {TABS.map(tab => (
                <TabButton
                  key={tab.id}
                  title={tab.title}
                  count={appCounts[tab.id]}
                  color={tab.color}
                  isActive={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* === Applicant List === */}
        <div className="space-y-4">
          {filteredApps.length > 0 ? (
            filteredApps.map(app => (
              <ApplicantCard
                key={app.id}
                application={app}
                onUpdate={handleCardUpdate}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteApplication}
              />
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
              <Users size={64} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                ไม่มีผู้สมัครในสถานะนี้
              </h3>
              <p className="text-slate-500">เลือก tab อื่นเพื่อดูผู้สมัครในสถานะต่างๆ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantsPage;