import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { freelancerApi } from '../api/freelancerApi';
import { BACKEND_URL } from '../api/apiClient';
import LoadingSpinner from '../components/LoadingSpinner';
import { Star, Briefcase, Clock, MapPin, ExternalLink, ShieldCheck, Award, MessageSquare, DollarSign, TrendingUp } from 'lucide-react';

/**
 * PublicFreelancerPage - MODERNIZED UI with Reviews & Portfolio
 * ✅ หน้าโปรไฟล์สาธารณะของ Freelancer พร้อมระบบรีวิวและผลงาน
 */
const PublicFreelancerPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await freelancerApi.getPublicProfile(id);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading) return <LoadingSpinner text="กำลังโหลดข้อมูล..." />;
  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลฟรีแลนซ์</h2>
        <p className="text-slate-500">โปรไฟล์ที่คุณค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ</p>
      </div>
    </div>
  );

  const { freelancerProfile, stats, portfolio, reviews, skills } = data;
  const fp = freelancerProfile || {};

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
  };

  const profileImg = getImageUrl(fp.profileImageUrl) ||
    `https://placehold.co/200x200/E0E0E0/777?text=${data.firstName.charAt(0)}`;

  // ✅ คำนวณคะแนนเฉลี่ย (รองรับทั้งจาก stats และ reviews)
  const avgRating = stats?.averageRating || (reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0');
  const totalReviews = stats?.totalReviews || (reviews ? reviews.length : 0);

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* ✅ Hero Header Section - Premium Gradient Background */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* ✅ Profile Image - Modern Design with Verified Badge */}
            <div className="relative shrink-0">
              <img
                src={profileImg}
                alt="Profile"
                className="w-44 h-44 rounded-3xl object-cover shadow-2xl border-4 border-white/30 backdrop-blur-sm"
              />
              {/* Verified Badge */}
              <div className="absolute -bottom-3 -right-3 bg-white p-2.5 rounded-full shadow-xl">
                <ShieldCheck className="text-blue-600 w-9 h-9" title="Verified Freelancer" />
              </div>
            </div>

            {/* ✅ Profile Info */}
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">
                {data.firstName} {data.lastName}
              </h1>
              <p className="text-2xl md:text-3xl text-blue-100 font-bold mb-5">
                {fp.professionalTitle || "ฟรีแลนซ์มืออาชีพ"}
              </p>

              {/* ✅ Meta Info Pills - Icons */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-blue-100 mb-6">
                {fp.yearsOfExperience > 0 && (
                  <span className="flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-xl backdrop-blur-sm border border-white/20 font-bold">
                    <Clock size={20} /> {fp.yearsOfExperience} ปี ประสบการณ์
                  </span>
                )}
                <span className="flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-xl backdrop-blur-sm border border-white/20 font-bold">
                  <MapPin size={20} /> ประเทศไทย
                </span>
                {/* ✅ แสดง Rating & Reviews */}
                <span className="flex items-center gap-2 bg-yellow-500/20 px-5 py-2.5 rounded-xl backdrop-blur-sm border border-yellow-400/30 font-bold">
                  <Star size={20} className="text-yellow-300 fill-yellow-300" />
                  {avgRating} ({totalReviews} รีวิว)
                </span>
              </div>

              {/* ✅ Skills Tags - แสดงทักษะ */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {skills && skills.slice(0, 8).map(skill => (
                  <span key={skill.id} className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-bold border border-white/30 hover:bg-white/30 transition-colors">
                    {skill.name}
                  </span>
                ))}
                {skills && skills.length > 8 && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-bold border border-white/30">
                    +{skills.length - 8} อื่นๆ
                  </span>
                )}
              </div>
            </div>

            {/* ✅ Hourly Rate Card - Premium Design */}
            <div className="shrink-0 w-full md:w-auto">
              {fp.hourlyRate ? (
                <div className="bg-white text-slate-800 p-8 rounded-3xl shadow-2xl border-2 border-white/50 text-center min-w-[240px] transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-center gap-2 text-slate-500 mb-3">
                    <DollarSign size={20} />
                    <p className="text-sm font-extrabold uppercase tracking-wider">อัตราค่าจ้าง</p>
                  </div>
                  <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    ฿{fp.hourlyRate.toLocaleString()}
                  </div>
                  <span className="text-base text-slate-600 font-bold">ต่อชั่วโมง</span>

                  {fp.portfolioUrl && (
                    <a
                      href={fp.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 flex items-center justify-center gap-2 w-full px-5 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 font-bold text-sm transition-all shadow-sm"
                    >
                      <ExternalLink size={18} /> ชมผลงานภายนอก
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border-2 border-white/20 text-center min-w-[240px]">
                  <p className="text-white text-lg font-bold mb-4">💼 ติดต่อสอบถาม</p>
                  <p className="text-white/80 italic text-sm">ราคาตามตกลง</p>
                  {fp.portfolioUrl && (
                    <a
                      href={fp.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 w-full px-5 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 font-bold text-sm transition-all backdrop-blur-sm"
                    >
                      <ExternalLink size={18} /> ชมผลงานภายนอก
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ✅ Statistics Row - แสดงสถิติที่โดดเด่น */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center">
              <div className="text-3xl font-extrabold text-white mb-1">{stats?.completedJobs || 0}</div>
              <div className="text-blue-100 text-sm font-bold">งานที่เสร็จสิ้น</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center">
              <div className="text-3xl font-extrabold text-white mb-1">{totalReviews}</div>
              <div className="text-blue-100 text-sm font-bold">รีวิวทั้งหมด</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center">
              <div className="text-3xl font-extrabold text-yellow-300 mb-1">{avgRating}</div>
              <div className="text-blue-100 text-sm font-bold">คะแนนเฉลี่ย</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center">
              <div className="text-3xl font-extrabold text-white mb-1">{fp.yearsOfExperience || 0}</div>
              <div className="text-blue-100 text-sm font-bold">ปีประสบการณ์</div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Main Content - Three Column Layout */}
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ✅ LEFT Column - Main Information (Span 8) */}
          <div className="lg:col-span-8 space-y-8">

            {/* ✅ About Me Section - Modern Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
              <h3 className="text-3xl font-extrabold text-slate-900 mb-7 flex items-center gap-3 pb-5 border-b-2 border-slate-100">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg">
                  <MessageSquare size={24} />
                </div>
                เกี่ยวกับฉัน
              </h3>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg">
                {fp.bio || "ยังไม่มีข้อมูลแนะนำตัว"}
              </p>
            </div>

            {/* ✅ Completed Jobs Portfolio - Modern Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
              <h3 className="text-3xl font-extrabold text-slate-900 mb-7 flex items-center gap-3 pb-5 border-b-2 border-slate-100">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg">
                  <Briefcase size={24} />
                </div>
                ผลงานที่ผ่านมาบนระบบ
                <span className="ml-auto text-xl bg-green-50 text-green-700 px-4 py-2 rounded-full font-extrabold border-2 border-green-100">
                  {stats?.completedJobs || 0} งาน
                </span>
              </h3>

              {/* ✅ ส่วนนี้แสดงงานที่ Freelancer ทำเสร็จแล้วบนระบบ (ไม่เกี่ยวกับการจ่ายเงิน แค่แสดงผลงาน) */}
              <div className="space-y-5">
                {portfolio && portfolio.length > 0 ? portfolio.map(job => (
                  <div key={job.id} className="group bg-gradient-to-br from-slate-50 to-white p-7 rounded-2xl border-2 border-slate-100 hover:border-green-300 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-extrabold text-xl text-slate-800 group-hover:text-green-600 transition-colors mb-2">
                          {job.title}
                        </h4>
                        <p className="text-sm text-slate-500 flex items-center gap-2 font-medium">
                          <Briefcase size={16} className="text-green-500" />
                          จ้างโดย: <span className="font-bold text-slate-700">{job.company?.companyName || 'บริษัท'}</span>
                        </p>
                      </div>
                      {/* ✅ Award Badge */}
                      <div className="bg-green-50 p-3 rounded-xl">
                        <Award size={28} className="text-green-600" />
                      </div>
                    </div>

                    {/* ✅ Skills Used in this Job */}
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-bold mr-2">ทักษะที่ใช้:</span>
                        {job.requiredSkills.map(s => (
                          <span key={s.id} className="text-xs bg-white px-3 py-1.5 rounded-full text-slate-600 border border-slate-200 font-bold hover:border-green-300 transition-colors">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center p-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <Briefcase size={64} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-600 font-bold text-lg mb-2">ยังไม่มีประวัติงานที่ทำสำเร็จ</p>
                    <p className="text-slate-500 text-sm">เมื่อฟรีแลนซ์ทำงานเสร็จสิ้นจะแสดงที่นี่</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ✅ RIGHT Sidebar - Reviews Section (Span 4) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sticky top-24">
              {/* ✅ Reviews Header with Star Rating */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-slate-100">
                <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                  <Star className="text-yellow-500 fill-yellow-500" size={28} />
                  รีวิว
                </h3>
                <div className="text-right">
                  <div className="text-4xl font-extrabold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    {avgRating}
                  </div>
                  <div className="flex text-yellow-400 justify-end mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < Math.round(avgRating) ? "currentColor" : "none"}
                        className={i < Math.round(avgRating) ? "" : "text-slate-200"}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 font-bold mt-1">{totalReviews} รีวิว</p>
                </div>
              </div>

              {/* ✅ Reviews List - แสดงความคิดเห็นจากลูกค้า */}
              <div className="space-y-6 max-h-[700px] overflow-y-auto custom-scroll pr-2">
                {reviews && reviews.length > 0 ? reviews.map((review, idx) => (
                  <div key={idx} className="pb-6 border-b border-slate-100 last:border-0 group hover:bg-slate-50 p-4 rounded-xl transition-colors">
                    {/* ✅ Reviewer Info with Avatar */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={getImageUrl(review.reviewerImage) || `https://placehold.co/50x50/E0E0E0/777?text=${review.reviewerName?.charAt(0) || 'U'}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 group-hover:border-blue-200 transition-colors shadow-sm"
                        alt="Reviewer"
                      />
                      <div className="flex-1">
                        <p className="font-extrabold text-base text-slate-800">{review.reviewerName || 'ผู้ใช้'}</p>
                        {/* ✅ Star Rating Display */}
                        <div className="flex text-yellow-400 mt-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              fill={i < review.rating ? "currentColor" : "none"}
                              className={i < review.rating ? "" : "text-slate-200"}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ✅ Job Title Badge */}
                    <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full mb-3 font-extrabold border border-blue-100">
                      <Briefcase size={12} />
                      {review.jobTitle || 'งานฟรีแลนซ์'}
                    </div>

                    {/* ✅ Review Comment */}
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      "{review.comment || 'ทำงานได้ดีมาก แนะนำเลยครับ'}"
                    </p>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <Star size={64} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-600 font-bold text-lg mb-2">ยังไม่มีรีวิว</p>
                    <p className="text-slate-500 text-sm">เมื่อมีลูกค้ารีวิวจะแสดงที่นี่</p>
                  </div>
                )}
              </div>

              {/* ✅ Trust Badge */}
              {totalReviews > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-100">
                    <ShieldCheck size={16} />
                    รีวิวจากลูกค้าจริง
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ✅ Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default PublicFreelancerPage;