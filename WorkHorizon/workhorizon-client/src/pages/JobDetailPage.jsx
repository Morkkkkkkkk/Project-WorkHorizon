import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';

/* === Import Hooks & Contexts (Your Backend) === */
import { useJobDetail } from '../hooks/useJobDetail';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { usePublicAds } from '../hooks/usePublicAds';
import { BACKEND_URL } from '../api/apiClient';

/* === Import Components === */
import Modal from '../components/Modal.jsx';
import ApplicationForm from '../components/ApplicationForm.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

/* === Import Icons (Lucide React) === */
import {
  MapPin, BriefcaseBusiness, CircleDollarSign, Building2,
  Calendar, CheckCircle, Send, ArrowLeft, ExternalLink,
  Star, Clock, User, FileText, Share2, ShieldCheck
} from "lucide-react";

/* === Import Swiper (For Slider) === */
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

/* === Helper Functions === */
const formatSalary = (min, max) => {
  if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()} บาท`;
  if (min) return `เริ่มต้น ${min.toLocaleString()} บาท`;
  if (max) return `สูงสุด ${max.toLocaleString()} บาท`;
  return 'ตามตกลง';
};

/* === Sub-Component: Ad Slideshow === */
const AdSlideshow = () => {
  const { ads, isLoadingAds } = usePublicAds('SMALL_BANNER');

  if (isLoadingAds || !ads || ads.length === 0) return null;

  const getImageUrl = (url) => (!url || url.startsWith('http') ? url : `${BACKEND_URL}${url}`);
  const loopSlides = ads.length > 1;

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <Star size={18} className="text-yellow-500 fill-yellow-500" />
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          งานแนะนำ
        </h2>
      </div>
      <div className="p-4">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          loop={loopSlides}
          className="h-48 md:h-56 rounded-xl overflow-hidden shadow-inner"
        >
          {ads.map((ad) => (
            <SwiperSlide key={ad.id}>
              <div className="w-full h-full">
                {ad.linkUrl ? (
                  <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                    <img
                      src={getImageUrl(ad.imageUrl)}
                      alt={ad.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </a>
                ) : (
                  <img
                    src={getImageUrl(ad.imageUrl)}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

/* === Main Component === */
const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch Real Data
  const { job, isLoading, error } = useJobDetail(jobId);
  const { isAuth, isJobSeeker, isFreelancer } = useAuth();
  const { profile, isLoading: isLoadingProfile, refreshProfile } = useUserProfile(isJobSeeker || isFreelancer);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Check application status
  useEffect(() => {
    if (profile && job && profile.applications) {
      const applied = profile.applications.some(app => app.jobId === job.id);
      setHasApplied(applied);
    }
  }, [profile, job]);

  const handleApplyClick = () => {
    if (!isAuth) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleApplySuccess = () => {
    setIsApplyModalOpen(false);
    setHasApplied(true);
    if (refreshProfile) {
      refreshProfile();
    }
  };

  if (isLoading || (isJobSeeker && isLoadingProfile)) {
    return <LoadingSpinner text="กำลังโหลดรายละเอียดงาน..." fullScreen={true} />;
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BriefcaseBusiness className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลงาน</h1>
          <p className="text-slate-500 mb-8">งานที่คุณค้นหาอาจถูกปิดรับสมัครหรือถูกลบไปแล้ว</p>
          <Link to="/" className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all hover:shadow-lg">
            <ArrowLeft size={20} /> กลับไปค้นหางานใหม่
          </Link>
        </div>
      </div>
    );
  }

  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  const companyLogoUrl = getImageUrl(job.company.logoUrl) ||
    `https://placehold.co/150x150/F1F5F9/94A3B8?text=${job.company.companyName.charAt(0)}`;

  return (
    <>
      <div className="bg-slate-50 min-h-screen font-sans pb-20">

        {/* === Header Section === */}
        <div className="relative bg-white border-b border-slate-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

          <div className="container mx-auto max-w-7xl px-4 py-8 md:py-10">
            {/* Breadcrumb */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-8 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <ArrowLeft size={16} />
              </div>
              กลับหน้าค้นหา
            </Link>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Logo */}
              <div className="shrink-0 relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-white p-1">
                  <img
                    src={companyLogoUrl}
                    alt={`${job.company.companyName} logo`}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
              </div>

              {/* Title & Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
                    {job.jobType.name}
                  </span>
                  <span className="text-slate-400 text-sm flex items-center gap-1">
                    <Clock size={14} /> โพสต์เมื่อ {new Date(job.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-2">
                  {job.title}
                </h1>

                <Link
                  to={`/company/${job.company.id}`}
                  className="text-lg text-slate-600 font-medium hover:text-blue-600 transition-colors inline-flex items-center gap-1 mb-6"
                >
                  <Building2 size={18} />
                  {job.company.companyName}
                </Link>

                {/* Key Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <CircleDollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase">เงินเดือน</p>
                      <p className="text-slate-900 font-bold text-sm md:text-base">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase">สถานที่ปฏิบัติงาน</p>
                      <p className="text-slate-900 font-bold text-sm md:text-base">{job.province.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase">สถานะ</p>
                      <p className="text-green-700 font-bold text-sm md:text-base">กำลังเปิดรับสมัคร</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop CTA */}
              <div className="hidden md:flex flex-col gap-3 shrink-0 w-48">
                <button className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                  <Share2 size={16} /> แชร์งานนี้
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* === Main Content === */}
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column (Content) */}
            <div className="lg:col-span-2 space-y-8">

              {/* Image Gallery */}
              {job.images && job.images.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ring-4 ring-white">
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={0}
                    slidesPerView={1}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop={job.images.length > 1}
                    className="w-full h-64 md:h-[400px] bg-slate-100"
                  >
                    {job.images.map((img) => (
                      <SwiperSlide key={img.id}>
                        <img
                          src={getImageUrl(img.url)}
                          alt={job.title}
                          className="w-full h-full object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}

              {/* Job Description */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText size={24} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                    รายละเอียดงาน
                  </h2>
                </div>

                <div
                  className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed marker:text-blue-500"
                  dangerouslySetInnerHTML={{
                    __html: job.description.replace(/\n/g, "<br />"),
                  }}
                />

                {/* Skills Section */}
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Star size={20} className="text-yellow-500 fill-yellow-500" /> ทักษะที่ต้องการ
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {job.requiredSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold border border-slate-200 shadow-sm hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all cursor-default"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

{/* ✅✅✅ วางโค้ดส่วนดาวน์โหลด ตรงนี้ครับ (ต่อจาก Skills เลย) */}
{job.documents && job.documents.length > 0 && (
  <div className="mt-10 pt-8 border-t border-slate-100">
    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
      <FileText size={20} className="text-blue-500" /> เอกสารที่เกี่ยวข้อง
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {job.documents.map((doc) => (
        <a
          key={doc.id}
          href={getImageUrl(doc.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
        >
          <div className="p-2.5 bg-red-50 text-red-500 rounded-lg group-hover:bg-white group-hover:text-red-600 transition-colors shadow-sm">
            <FileText size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-700 transition-colors">
              {doc.name}
            </p>
            <p className="text-xs text-slate-400 group-hover:text-blue-400">
              คลิกเพื่อดาวน์โหลด
            </p>
          </div>
          <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
        </a>
      ))}
    </div>
  </div>
)}
{/* ✅ จบส่วนที่วางเพิ่ม */}

              {/* Company Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                    <Building2 size={24} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                    เกี่ยวกับ {job.company.companyName}
                  </h2>
                </div>

                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {job.company.description}
                </p>

                {job.company.website && (
                  <div className="mt-6 pt-6 border-t border-dashed border-slate-200">
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-green-500 hover:text-green-600 transition-colors shadow-sm"
                    >
                      <ExternalLink size={18} /> เยี่ยมชมเว็บไซต์บริษัท
                    </a>
                  </div>
                )}
              </div>

              {/* Ad Section */}
              <AdSlideshow />

            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">

                {/* Apply Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">สนใจร่วมงาน?</h3>
                  <p className="text-slate-500 text-sm mb-6">สมัครงานง่ายๆ เพียงคลิกปุ่มด้านล่าง</p>

                  {(isJobSeeker || isFreelancer) && (
                    <button
                      onClick={handleApplyClick}
                      disabled={hasApplied}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transform transition-all duration-200 flex items-center justify-center gap-3 ${hasApplied
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200"
                          : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1 hover:shadow-blue-200 active:scale-95"
                        }`}
                    >
                      {hasApplied ? (
                        <>
                          <CheckCircle size={24} /> ส่งใบสมัครแล้ว
                        </>
                      ) : (
                        <>
                          <Send size={24} /> สมัครงานทันที
                        </>
                      )}
                    </button>
                  )}

                  {!isAuth && (
                    <button
                      onClick={handleApplyClick}
                      className="w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg bg-blue-600 text-white hover:bg-blue-700 transform transition-all duration-200 hover:-translate-y-1 hover:shadow-blue-200 flex items-center justify-center gap-3"
                    >
                      <User size={24} /> เข้าสู่ระบบเพื่อสมัคร
                    </button>
                  )}

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center text-sm text-slate-500">
                      <span>ประเภทการจ้าง</span>
                      <span className="font-semibold text-slate-900">{job.jobType.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-500 mt-3">
                      <span>เขตพื้นที่</span>
                      <span className="font-semibold text-slate-900">{job.district.name}</span>
                    </div>
                  </div>
                </div>

                {/* Safety Tips */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <ShieldCheck size={18} /> คำแนะนำความปลอดภัย
                  </h4>
                  <p className="text-sm text-blue-700/80 leading-relaxed">
                    อย่าโอนเงินมัดจำหรือค่าธรรมเนียมใดๆ ในการสมัครงาน หากพบเห็นความผิดปกติ โปรดแจ้งทีมงานทันที
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === Modal === */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`สมัครงาน: ${job.title}`}
      >
        <ApplicationForm
          jobId={job.id}
          resumes={profile?.resumes || []}
          onClose={() => setIsApplyModalOpen(false)}
          onSuccess={handleApplySuccess}
        />
      </Modal>
    </>
  );
};

export default JobDetailPage;