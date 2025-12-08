import React from 'react';
import { Link } from 'react-router-dom';
import { useMySavedJobs } from '../hooks/useMySavedJobs.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import JobCard from '../components/JobCard.jsx';
import { userApi } from '../api/userApi.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-toastify';

/* === MODERNIZED UI - Import Icons === */
import { Heart, Bookmark, Search, TrendingUp } from 'lucide-react';

const MySavedJobsPage = () => {
  const { refreshProfile } = useAuth();
  const { savedJobs, isLoading, error, refreshSavedJobs } = useMySavedJobs();

  /* === Handle Save Toggle (Un-save) === */
  const handleSaveToggle = async (jobId, shouldSave) => {
    if (!shouldSave) {
      try {
        await userApi.deleteSavedJob(jobId);
        refreshSavedJobs();
        if (refreshProfile) refreshProfile();
        toast.success("เลิกบันทึกงานเรียบร้อยแล้ว");
      } catch (err) {
        console.error("Unsave failed:", err);
        toast.error("ไม่สามารถเลิกบันทึกงานได้");
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="กำลังโหลดงานที่บันทึกไว้..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
          <h1 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-slate-600">ไม่สามารถโหลดข้อมูลได้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">

      {/* === MODERNIZED: Hero Header with Gradient === */}
      <div className="relative bg-gradient-to-br from-pink-600 via-rose-600 to-red-700 rounded-3xl shadow-2xl p-8 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Heart className="w-10 h-10 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2">
                งานที่บันทึกไว้
              </h1>
              <p className="text-pink-100 text-lg">
                งานที่คุณสนใจและบันทึกไว้เพื่อดูทีหลัง
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === MODERNIZED: Statistics Card (if has saved jobs) === */}
      {savedJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Saved */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">งานที่บันทึก</p>
                <h3 className="text-4xl font-extrabold text-pink-600">{savedJobs.length}</h3>
                <p className="text-sm text-slate-500 mt-2">รายการทั้งหมด</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-xl">
                <Bookmark className="text-pink-600 w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Quick Tip */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-1">เคล็ดลับ</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  คลิกที่ไอคอนรูปหัวใจ <Heart size={14} className="inline text-red-500 fill-red-500" /> อีกครั้งเพื่อเลิกบันทึกงาน หรือสมัครงานที่คุณสนใจได้ทันที!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODERNIZED: Jobs Grid === */}
      {savedJobs.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Bookmark size={20} className="text-pink-600" />
            รายการงานที่บันทึกไว้
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((savedJob) => (
              <JobCard
                key={savedJob.id}
                job={savedJob.job}
                isSaved={true}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        </div>
      ) : (
        /* === MODERNIZED: Empty State === */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="p-6 bg-pink-50 rounded-full mb-6">
              <Heart size={64} className="text-pink-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              ยังไม่มีงานที่บันทึกไว้
            </h3>
            <p className="text-slate-500 mb-4 text-lg leading-relaxed">
              คุณสามารถกดไอคอนรูปหัวใจ <Heart size={20} className="inline text-red-500" /> ที่งานที่สนใจเพื่อบันทึกไว้ดูทีหลัง
            </p>
            <p className="text-slate-400 mb-8">
              บันทึกงานที่คุณสนใจและกลับมาสมัครได้ทุกเมื่อ
            </p>
            <Link
              to="/"
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold rounded-xl hover:from-pink-700 hover:to-rose-700 shadow-lg shadow-pink-600/20 transition-all hover:scale-105"
            >
              <Search size={22} /> ค้นหางาน
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySavedJobsPage;
