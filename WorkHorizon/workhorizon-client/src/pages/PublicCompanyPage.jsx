import React, { useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublicCompany } from '../hooks/usePublicCompany.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUserProfile } from '../hooks/useUserProfile.js';
import { userApi } from '../api/userApi.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import JobCard from '../components/JobCard.jsx';
import { BACKEND_URL } from '../api/apiClient.js';
import { toast } from 'react-toastify';

/* === MODERNIZED UI - Import Icons === */
import { Building2, Globe, Users, MapPin, Briefcase, ArrowLeft } from 'lucide-react';

const PublicCompanyPage = () => {
  const { companyId } = useParams();
  const { isJobSeeker } = useAuth();
  const { company, isLoading, error } = usePublicCompany(companyId);
  const { profile, refreshProfile } = useUserProfile(isJobSeeker);

  const savedJobIdSet = useMemo(() => {
    if (isJobSeeker && profile?.savedJobs) {
      return new Set(profile.savedJobs.map(job => job.jobId));
    }
    return new Set();
  }, [isJobSeeker, profile]);

  const handleSaveToggle = useCallback(async (jobId, shouldSave) => {
    if (!isJobSeeker) {
      toast.warning("กรุณาเข้าสู่ระบบเพื่อบันทึกงาน");
      return;
    }
    try {
      if (shouldSave) {
        await userApi.saveJob(jobId);
        toast.success("บันทึกงานเรียบร้อยแล้ว");
      } else {
        await userApi.deleteSavedJob(jobId);
        toast.success("ยกเลิกการบันทึกงานเรียบร้อยแล้ว");
      }
      if (refreshProfile) refreshProfile();
    } catch (err) {
      console.error("Save job failed:", err);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    }
  }, [isJobSeeker, refreshProfile]);

  if (isLoading) {
    return <LoadingSpinner text="กำลังโหลดข้อมูลบริษัท..." />;
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200 max-w-md">
          <div className="text-6xl mb-4">🏢</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-slate-600 mb-6">ไม่พบข้อมูลบริษัท หรือบริษัทนี้อาจยังไม่ได้รับการอนุมัติ</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            <ArrowLeft size={20} /> กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  const companyLogoUrl = getImageUrl(company.logoUrl) ||
    `https://placehold.co/200x200/E0E0E0/777?text=${company.companyName?.charAt(0) || '?'}`;

  const jobs = company.jobs || [];

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* === MODERNIZED: Hero Header with Company Info === */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-blue-700 to-cyan-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-12 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 font-medium transition-colors"
          >
            <ArrowLeft size={20} /> กลับไปหน้าค้นหา
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Company Logo */}
            <img
              src={companyLogoUrl}
              alt={`${company.companyName || 'N/A'} logo`}
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white/30 backdrop-blur-sm shadow-2xl bg-white"
            />

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3 drop-shadow-lg">
                {company.companyName || 'ยังไม่มีชื่อบริษัท'}
              </h1>
              <p className="text-xl text-blue-100 font-medium mb-4">
                {company.industry?.name || 'N/A'}
              </p>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4">
                {company.companySize && (
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <Users size={18} />
                    <span>{company.companySize} คน</span>
                  </div>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all"
                  >
                    <Globe size={18} />
                    <span>เว็บไซต์บริษัท</span>
                  </a>
                )}
                {company.address && (
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                    <MapPin size={18} />
                    <span>{company.address.split(' ').slice(0, 3).join(' ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === Main Content === */}
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">

        {/* === MODERNIZED: About Company Card === */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <Building2 size={20} />
            </div>
            เกี่ยวกับบริษัท
          </h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {company.description || 'ยังไม่มีข้อมูลเกี่ยวกับบริษัท'}
          </p>
        </div>

        {/* === MODERNIZED: Job Listings === */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <div className="p-2 bg-green-600 text-white rounded-xl">
                <Briefcase size={20} />
              </div>
              งานที่กำลังเปิดรับ
            </h2>
            <span className="px-4 py-2 bg-green-50 text-green-700 font-bold rounded-xl">
              {jobs.length} ตำแหน่ง
            </span>
          </div>

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIdSet.has(job.id)}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto mb-4">
                <Briefcase size={64} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                ยังไม่มีตำแหน่งงานเปิดรับ
              </h3>
              <p className="text-slate-500">
                บริษัทยังไม่มีตำแหน่งงานที่เปิดรับในขณะนี้
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicCompanyPage;