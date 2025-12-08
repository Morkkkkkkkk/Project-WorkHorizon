// src/pages/HomePage.jsx
/* === MODERNIZED UI UPDATE === */
// ✅ ปรับปรุงหน้าแรกให้ดูสวยงาม เป็นระบบหางาน/ขายงานอย่างชัดเจน
// ✅ จัดเรียง Banner, Categories ให้เป็นระเบียบมากขึ้น
// ✅ เปลี่ยนธีมเป็นสีส้ม (Orange Theme)

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../api/apiClient.js";
import { CATEGORY_ICONS } from "../constants/categoryIcons.js";
import { CheckCheck, Zap, Star, ChevronRight, Search, TrendingUp, Shield, Briefcase, Users } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination as SwiperPagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade"; // ✅ Add Fade Effect CSS
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { usePublicAds } from "../hooks/usePublicAds.js";
import { useMainCategories } from "../hooks/useMainCategories.js";
import { useFeaturedSections } from "../hooks/useFeaturedSections.js";
import FeaturedSectionRow from "../components/FeaturedSectionRow.jsx";
import { useMySavedJobs } from "../hooks/useMySavedJobs.js";
import { userApi } from "../api/userApi.js";

const sizeClasses = {
  LARGE_SLIDE: "w-full h-[350px] md:h-[450px]", // ✅ เพิ่มความสูงเล็กน้อย
  SMALL_BANNER: "w-[300px] h-[250px]",
};

/* === MODERNIZED: Hero Search Form === */
// ✅ ปรับปรุงฟอร์มค้นหาให้โดดเด่นและใช้งานง่ายขึ้น
const HeroSearchForm = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [jobType, setJobType] = useState("jobs"); // "jobs" or "services"

  const handleSubmit = (e) => {
    e.preventDefault();
    const searchPath = jobType === "jobs" ? "/jobs/search" : "/services/search";
    if (query.trim()) {
      navigate(`${searchPath}?q=${query}`);
    } else {
      navigate(searchPath);
    }
  };

  return (
    <div className="max-w-3xl mx-auto relative z-10">
      {/* ✅ Job Type Toggle */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => setJobType("jobs")}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${jobType === "jobs"
            ? "bg-white text-orange-600 shadow-lg shadow-white/30 scale-105"
            : "bg-white/10 text-white hover:bg-white/20"
            }`}
        >
          <Briefcase size={18} className="inline mr-2" />
          งานประจำ
        </button>
        <button
          type="button"
          onClick={() => setJobType("services")}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${jobType === "services"
            ? "bg-white text-orange-600 shadow-lg shadow-white/30 scale-105"
            : "bg-white/10 text-white hover:bg-white/20"
            }`}
        >
          <Users size={18} className="inline mr-2" />
          งานฟรีแลนซ์
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10"
      >
        {/* ✅ เพิ่ม shadow และ animation ให้โดดเด่น */}
        <div className="flex items-center p-2 bg-white rounded-2xl shadow-2xl shadow-orange-900/30 border-2 border-slate-100 transform hover:-translate-y-2 transition-all duration-300">
          <div className="pl-6 text-slate-400">
            <Search size={28} />
          </div>
          <input
            type="text"
            placeholder={jobType === "jobs" ? "ค้นหางานประจำที่คุณสนใจ..." : "ค้นหางานฟรีแลนซ์หรือบริการ..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow px-4 py-5 text-lg border-none focus:ring-0 outline-none text-slate-900 placeholder-slate-400 bg-transparent font-medium"
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-600/40 hover:shadow-xl hover:shadow-orange-600/50"
          >
            <Search size={20} />
            ค้นหาเลย
          </button>
        </div>
      </form>
    </div>
  );
};

/* === MODERNIZED: Hero Section === */
// ✅ ปรับปรุง Hero ให้ดูทันสมัยและมีพลัง (Orange Theme)
const HeroSection = () => (
  <section className="relative bg-gradient-to-br from-slate-900 via-orange-900 to-red-900 text-white py-36 overflow-hidden">
    {/* ✅ Background Animation Shapes */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
    </div>

    <div className="container mx-auto px-4 text-center relative z-10">
      {/* ✅ Badge แสดงความน่าเชื่อถือ */}
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-orange-100 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Star size={16} className="text-yellow-400 fill-yellow-400" />
        <span>แพลตฟอร์มหางาน & จ้างงานอันดับ 1 ในไทย</span>
      </div>

      {/* ✅ หัวข้อใหญ่ โดดเด่น */}
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
        เชื่อมต่อโอกาสการทำงาน <br />
        กับ <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-300 to-yellow-300">WorkHorizon</span>
      </h1>

      {/* ✅ คำอธิบายชัดเจนขึ้น */}
      <p className="text-slate-300 text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
        แพลตฟอร์มรวมงานประจำ งานฟรีแลนซ์ และบริการมืออาชีพ <br className="hidden md:block" />
        <span className="text-orange-300 font-bold">ค้นหาง่าย สมัครเร็ว ปลอดภัย 100%</span>
      </p>

      <HeroSearchForm />

      {/* ✅ Feature Pills ด้านล่าง */}
      <div className="mt-14 flex flex-wrap justify-center gap-6 text-slate-300 text-sm font-bold">
        <span className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-full backdrop-blur-sm border border-white/10">
          <CheckCheck size={18} className="text-green-400" /> ฟรีไม่มีค่าใช้จ่าย
        </span>
        <span className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-full backdrop-blur-sm border border-white/10">
          <Shield size={18} className="text-blue-400" /> ปลอดภัย 100%
        </span>
        <span className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-full backdrop-blur-sm border border-white/10">
          <Briefcase size={18} className="text-purple-400" /> งานใหม่ทุกวัน
        </span>
        <span className="flex items-center gap-2 bg-white/5 px-5 py-3 rounded-full backdrop-blur-sm border border-white/10">
          <Users size={18} className="text-orange-400" /> ฟรีแลนซ์มืออาชีพ
        </span>
      </div>
    </div>
  </section>
);

/* === MODERNIZED: Popular Categories === */
// ✅ ปรับปรุงหมวดหมู่ให้ดูเป็นระเบียบและน่าคลิกมากขึ้น
const PopularCategories = () => {
  const { mainCategories, isLoadingMainCats } = useMainCategories();
  if (isLoadingMainCats) return <LoadingSpinner text="กำลังโหลดหมวดหมู่..." />;

  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith("http")) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };


  return (
    <div className="container mx-auto px-4 py-24">
      {/* ✅ หัวข้อหมวดหมู่ที่ชัดเจน */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 text-orange-600 text-sm font-bold mb-4">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          หมวดหมู่ยอดนิยม
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          เลือกหมวดหมู่ที่คุณสนใจ
        </h2>
        <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
          ค้นหางานและบริการตามความเชี่ยวชาญของคุณ
        </p>
      </div>

      {/* ✅ Grid หมวดหมู่ (Premium Design) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-14">
        {mainCategories.slice(0, 6).map((cat) => (
          <Link
            key={cat.id}
            to={`/jobs/search?mainCategoryId=${cat.id}`}
            className="group relative flex flex-col gap-4 p-4 rounded-3xl bg-white border border-slate-100 hover:border-orange-200 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 transition-all duration-500 cursor-pointer items-center text-center overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Image Container with Glow */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-50 shadow-inner group-hover:ring-4 ring-orange-100 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                src={getImageUrl(cat.imageUrl)}
                alt={cat.name}
                className="w-full h-full object-cover transform group-hover:scale-110 rotate-0 group-hover:rotate-2 transition-transform duration-700 ease-out"
              />
            </div>

            {/* Text & Icon */}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <span className="text-base font-bold text-slate-800 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
                {cat.name}
              </span>
              <span className="text-xs text-slate-400 font-medium group-hover:text-orange-400 transition-colors delay-75">
                ดูตำแหน่งงาน
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ✅ ปุ่มดูเพิ่มเติม (Modern Pill) */}
      <div className="text-center">
        <Link
          to="/categories"
          className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-white text-slate-600 font-bold border border-slate-200 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 shadow-sm hover:shadow-lg"
        >
          <span>ดูหมวดหมู่ทั้งหมด</span>
          <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
};

/* === Ad Slideshow === */
// ✅ Slider โฆษณาที่สวยงามขึ้น
const AdSlideshow = ({ size, heightClass, navigation = true }) => {
  const { ads, isLoadingAds } = usePublicAds(size);
  if (isLoadingAds || ads.length === 0) return null;

  const getImageUrl = (url) =>
    !url || url.startsWith("http") ? url : `${BACKEND_URL}${url}`;
  const loopSlides = ads.length > 1;

  function getRandomDelay(min = 2500, max = 4500) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const randomDelay = getRandomDelay(2500, 4500);

  function shuffleArray(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  const randomizedAds = shuffleArray(ads);

  return (
    <div className={`container mx-auto ${size === "LARGE_SLIDE" ? "px-4" : "px-0"}`}>
      {/* ✅ ปรับปรุง Container ให้ดูสวยหรูขึ้น */}
      <div className={`relative rounded-3xl p-2 ${size === "LARGE_SLIDE" ? "bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl shadow-orange-500/20" : ""}`}>
        <Swiper
          modules={[Autoplay, SwiperPagination, Navigation, EffectFade]}
          effect="fade" // ✅ ใช้ Fade Effect
          fadeEffect={{ crossFade: true }}
          spaceBetween={0} // Fade effect works best with 0 space
          centeredSlides={true}
          autoplay={{ delay: randomDelay, disableOnInteraction: false }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            renderBullet: function (index, className) {
              return '<span class="' + className + '"></span>';
            }
          }}
          navigation={navigation}
          loop={loopSlides}
          speed={1000} // ✅ Smooth transition speed
          className={`${sizeClasses[size]} ${heightClass} rounded-2xl overflow-hidden`}
        >
          {randomizedAds.map((ad) => (
            <SwiperSlide key={ad.id} className="bg-white">
              {ad.linkUrl ? (
                <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 flex items-end justify-center pb-8">
                    <span className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium border border-white/30 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      เยี่ยมชมเว็บไซต์
                    </span>
                  </div>

                  {/* Badge "Sponsored" */}
                  <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white text-[10px] uppercase font-bold tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                    {/* Sponsored*/}
                  </div>

                  <img
                    src={getImageUrl(ad.imageUrl)}
                    alt={ad.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2000ms] ease-out"
                  />
                </a>
              ) : (
                <div className="relative w-full h-full">
                  {/* Badge "Sponsored" */}
                  <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white text-[10px] uppercase font-bold tracking-widest opacity-60">
                    {/* Sponsored*/}
                  </div>
                  <img
                    src={getImageUrl(ad.imageUrl)}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

/* === MODERNIZED: Value Props === */
// ✅ ส่วนแสดงคุณค่าของแพลตฟอร์ม
const ValueProps = () => (
  <section className="bg-gradient-to-b from-white to-slate-50 py-28 border-t border-slate-100">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-600 text-sm font-bold mb-4">
          <CheckCheck size={14} />
          ทำไมต้องเลือกเรา
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
          WorkHorizon คือตัวเลือกที่ดีที่สุด
        </h2>
        <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto">
          แพลตฟอร์มที่เข้าใจทั้งผู้หางานและนายจ้างมากที่สุด
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
        {/* ✅ Card 1: สมัครง่าย */}
        <div className="group p-10 rounded-3xl bg-white hover:bg-orange-50 border-2 border-slate-100 hover:border-orange-200 hover:shadow-2xl transition-all duration-300 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <CheckCheck size={36} />
          </div>
          <h3 className="font-extrabold text-2xl text-slate-900 mb-4">
            สมัครงานง่ายมาก
          </h3>
          <p className="text-slate-600 leading-relaxed text-base">
            สมัครด้วยคลิกเดียว ระบบจดจำโปรไฟล์และติดตามสถานะได้ทันที ไม่ต้องกรอกข้อมูลซ้ำ ประหยัดเวลา
          </p>
        </div>

        {/* ✅ Card 2: ค้นหาเร็ว */}
        <div className="group p-10 rounded-3xl bg-white hover:bg-amber-50 border-2 border-slate-100 hover:border-amber-200 hover:shadow-2xl transition-all duration-300 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-yellow-600 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Zap size={36} />
          </div>
          <h3 className="font-extrabold text-2xl text-slate-900 mb-4">
            ค้นหางานเร็วทันใจ
          </h3>
          <p className="text-slate-600 leading-relaxed text-base">
            ระบบค้นหาที่ชาญฉลาด พร้อมตัวกรองละเอียด ช่วยให้คุณเจองานที่ใช่ในเวลาไม่กี่วินาที
          </p>
        </div>

        {/* ✅ Card 3: ปลอดภัย */}
        <div className="group p-10 rounded-3xl bg-white hover:bg-green-50 border-2 border-slate-100 hover:border-green-200 hover:shadow-2xl transition-all duration-300 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Shield size={36} />
          </div>
          <h3 className="font-extrabold text-2xl text-slate-900 mb-4">
            โปร่งใสและปลอดภัย
          </h3>
          <p className="text-slate-600 leading-relaxed text-base">
            บริษัททุกแห่งผ่านการตรวจสอบตัวตน เพื่อความมั่นใจและความปลอดภัยสูงสุดของผู้สมัคร
          </p>
        </div>
      </div>
    </div>
  </section>
);

/* === MAIN: Home Page === */
const HomePage = () => {
  const { mainCategories, isLoading: isLoadingCats, isLoadingMainCats } = useMainCategories();
  const { sections, isLoadingSections } = useFeaturedSections();

  // ✅ Fetch Saved Jobs for "Heart" status
  const { savedJobs, refreshSavedJobs } = useMySavedJobs();
  const savedJobIds = savedJobs.map(item => item.job?.id).filter(Boolean);

  const handleSaveToggle = async (jobId, currentSavedState) => {
    try {
      if (currentSavedState) {
        await userApi.deleteSavedJob(jobId);
      } else {
        await userApi.addSavedJob(jobId);
      }
      refreshSavedJobs();
    } catch (error) {
      console.error("Failed to toggle save", error);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
      {/* ✅ Hero Section - ส่วนหัวหลัก */}
      <HeroSection />

      {/* ✅ Ad Slideshow (ใหญ่) - ติดใต้ Hero */}
      <div className="container mx-auto px-4 -mt-20 relative z-20">
        <AdSlideshow size="LARGE_SLIDE" navigation />
      </div>

      {/* ✅ หมวดหมู่ยอดนิยม */}
      <PopularCategories />

      {/* ✅ Featured Sections (งาน/บริการแนะนำจาก Admin) */}
      <div className="container mx-auto px-4 py-12">
        {isLoadingSections ? (
          <LoadingSpinner text="กำลังโหลด..." />
        ) : (
          sections.map((section) => (
            <FeaturedSectionRow
              key={section.id}
              section={section}
              savedJobIds={savedJobIds}
              onSaveToggle={handleSaveToggle}
            />
          ))
        )}
      </div>

      {/* ✅ Value Props - จุดเด่นของเรา */}
      <ValueProps />

      {/* ✅ Ads Section (เล็ก) - โฆษณาเพิ่มเติม */}
      <div className="container mx-auto px-4 py-24 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            พันธมิตรของเรา
          </h2>
          <p className="text-slate-600 text-lg">บริษัทและแบรนด์ที่ไว้วางใจ</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          <AdSlideshow size="SMALL_BANNER" navigation={false} />
          <AdSlideshow size="SMALL_BANNER" navigation={false} />
          <AdSlideshow size="SMALL_BANNER" navigation={false} />
          <AdSlideshow size="SMALL_BANNER" navigation={false} />
          <AdSlideshow size="SMALL_BANNER" navigation={false} />
          <AdSlideshow size="SMALL_BANNER" navigation={false} />
          <AdSlideshow size="SMALL_BANNER" navigation={false} />
          <AdSlideshow size="SMALL_BANNER" navigation={false} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
