/* ================================================================================
   WORKHORIZON HEADER COMPONENT
   ================================================================================
   
   📋 Purpose:
   - Main navigation component สำหรับทุกหน้าของแอปพลิเคชัน
   - แสดง Logo, Main Menu, Category Mega Menu, และ User Actions
   - รองรับทั้ง Desktop และ Mobile responsive design
   
   🎯 Features:
   1. Logo & Brand - Link กลับไปหน้าแรก
   2. Main Navigation - Links สำหรับหน้าหลักๆ (Jobs, Services)
   3. Mega Menu - Dropdown แสดงหมวดหมู่และหมวดหมู่ย่อยแบบ dynamic
   4. User Actions:
      - Notifications (ถ้า logged in)
      - Chat Dropdown (ถ้า logged in) - แสดงรายการคนที่เคยคุยด้วย + ลบได้
      - Saved Jobs (ถ้าเป็น Job Seeker/Freelancer)
      - Profile Dropdown (ถ้า logged in) - links ตามบทบาท
      - Login/Register Buttons (ถ้ายังไม่ได้ login)
   5. Mobile Menu - Hamburger menu สำหรับ mobile
   
   🔧 Technical:
   - ใช้ Auth Context สำหรับตรวจสอบสถานะการล็อกอิน
   - Fetch หมวดหมู่จาก useMainCategories hook
   - Fetch หมวดหมู่ย่อยแบบ dynamic เมื่อ hover (caching)
   - Click outside detection สำหรับปิด dropdowns
   
   💡 Usage:
   - Component นี้ถูก wrap ด้วย Layout.jsx และแสดงในทุกหน้าที่ต้องการ
   ================================================================================ */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Menu, X, ChevronDown, Bell, LogOut, User, Briefcase,
  LayoutGrid, Settings, FileText, Heart, MessageSquare,
  Shield, ChevronRight, Building2, Plus
} from 'lucide-react';
import { useMainCategories } from '../hooks/useMainCategories';
import { BACKEND_URL } from '../api/apiClient';
import { masterDataApi } from '../api/masterDataApi';
import ChatDropdown from './ChatDropdown'; // ✅ Import Chat Dropdown Component
import NotificationBell from './NotificationBell'; // ✅ Import NotificationBell

const Header = () => {
  // ============================================================================
  // 🔌 HOOKS & CONTEXT
  // ============================================================================

  // เรียกใช้ Auth Context เพื่อดึงข้อมูลผู้ใช้และสถานะการล็อกอิน
  const { user, logout, isAuth, isJobSeeker, isEmployer, isFreelancer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // เรียกใช้ hook สำหรับดึงหมวดหมู่หลัก
  const { mainCategories, isLoadingMainCats } = useMainCategories();

  // ============================================================================
  // 📊 STATE MANAGEMENT
  // ============================================================================

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile dropdown state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Mega menu (categories) state
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  // Active category ใน Mega Menu (เมื่อ hover)
  const [activeCategory, setActiveCategory] = useState(null);

  // Cache สำหรับ subcategories ที่ดึงมาแล้ว (เพื่อลด API calls)
  const [subCategoriesCache, setSubCategoriesCache] = useState({});

  // Loading state สำหรับ subcategories
  const [isLoadingSubCats, setIsLoadingSubCats] = useState(false);

  // ✅ NEW: Chat dropdown state
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);

  // ============================================================================
  // 📎 REFS
  // ============================================================================

  // Ref สำหรับ Profile Dropdown (ใช้ detect click outside)
  const profileRef = useRef(null);

  // Ref สำหรับ Mega Menu (ใช้ detect mouse leave)
  const megaMenuRef = useRef(null);

  // Timeout ref สำหรับ delay การปิด Mega Menu
  const megaMenuTimeoutRef = useRef(null);

  // ✅ NEW: Ref สำหรับ Chat Dropdown
  const chatRef = useRef(null);

  // ============================================================================
  // 🎬 EFFECTS
  // ============================================================================

  // Effect: ปิด dropdowns เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      // ปิด Profile Dropdown ถ้าคลิกข้างนอก
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }

      // ✅ NEW: ปิด Chat Dropdown ถ้าคลิกข้างนอก
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsChatDropdownOpen(false);
      }

      // Note: Mega menu ใช้ mouse leave แทนการคลิก
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Effect: ปิด Mobile Menu เมื่อเปลี่ยนหน้า (route change)
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
    setIsChatDropdownOpen(false); // ✅ NEW: ปิด Chat dropdown ด้วย
  }, [location]);

  // Effect: Fetch Subcategories เมื่อ hover ที่ main category
  useEffect(() => {
    const fetchSubCats = async () => {
      // ถ้าไม่มี active category หรือมีใน cache แล้ว ไม่ต้อง fetch
      if (!activeCategory || subCategoriesCache[activeCategory.id]) {
        setIsLoadingSubCats(false);
        return;
      }

      setIsLoadingSubCats(true);
      try {
        // เรียก API เพื่อดึง subcategories
        const subs = await masterDataApi.getSubCategories(activeCategory.id);

        // บันทึกลง cache
        setSubCategoriesCache(prev => ({
          ...prev,
          [activeCategory.id]: subs || []
        }));
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
        // กรณี error ให้เก็บ empty array เพื่อไม่ให้ retry อีก
        setSubCategoriesCache(prev => ({
          ...prev,
          [activeCategory.id]: []
        }));
      } finally {
        setIsLoadingSubCats(false);
      }
    };

    fetchSubCats();
  }, [activeCategory, subCategoriesCache]);

  // ============================================================================
  // 🎯 EVENT HANDLERS
  // ============================================================================

  /**
   * จัดการการ Logout
   * - เรียก logout() จาก AuthContext
   * - Navigate กลับไปหน้าแรก
   * - Reload หน้าเพื่อ clear state
   */
  const handleLogout = () => {
    logout();
    navigate('/');
    window.location.reload();
  };

  /**
   * สร้าง URL สำหรับรูปภาพ
   * - ถ้าเป็น URL เต็มแล้วก็ return เลย
   * - ถ้าเป็น relative path ให้เติม BACKEND_URL
   */
  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  // Profile image URL พร้อม fallback
  const userProfileImg = getImageUrl(user?.profileImageUrl) ||
    `https://placehold.co/100x100/FF9800/FFFFFF?text=${user?.firstName?.charAt(0) || 'U'}`;

  /**
   * เปิด Mega Menu (เมื่อ mouse enter)
   * - Clear timeout ที่อาจจะกำลังจะปิด menu
   * - เปิด menu
   */
  const handleMegaMenuEnter = () => {
    clearTimeout(megaMenuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  /**
   * ปิด Mega Menu (เมื่อ mouse leave)
   * - ใช้ timeout เพื่อ delay การปิด (UX ที่ดีกว่า)
   * - Reset active category เมื่อปิด
   */
  const handleMegaMenuLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
      setActiveCategory(null);
    }, 200); // 200ms delay
  };

  // ============================================================================
  // 🎨 RENDER
  // ============================================================================

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 font-sans" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">

          {/* ================================================================
              1️⃣ LOGO & BRAND
              ================================================================ */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                <Briefcase size={24} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 group-hover:from-orange-600 group-hover:to-red-600 transition-all">
                WorkHorizon
              </span>
            </Link>

            {/* ================================================================
                2️⃣ DESKTOP NAVIGATION (CENTER)
                ================================================================ */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* ──────────────── Mega Menu Trigger ──────────────── */}
              <div
                className="relative"
                onMouseEnter={handleMegaMenuEnter}
                onMouseLeave={handleMegaMenuLeave}
                ref={megaMenuRef}
              >
                <button
                  className={`
                    flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold transition-all
                    ${isMegaMenuOpen ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-orange-600'}
                  `}
                >
                  <LayoutGrid size={18} />
                  หมวดหมู่ทั้งหมด
                  <ChevronDown size={14} className={`transition-transform ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* ──────────────── Mega Menu Content ──────────────── */}
                {isMegaMenuOpen && (
                  <div
                    className="absolute top-full left-0 w-[800px] bg-white rounded-2xl shadow-2xl border border-slate-100 mt-2 p-6 grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ left: '-100px' }} // ปรับตำแหน่งให้อยู่ตรงกลาง
                  >
                    {/* ── Left Sidebar: Main Categories ── */}
                    <div className="col-span-4 space-y-1 border-r border-slate-100 pr-4 max-h-[500px] overflow-y-auto custom-scroll">
                      {isLoadingMainCats ? (
                        <div className="p-4 text-center text-slate-400">กำลังโหลด...</div>
                      ) : (
                        mainCategories.map((cat) => (
                          <div
                            key={cat.id}
                            onMouseEnter={() => setActiveCategory(cat)}
                            className={`
                              flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
                              ${activeCategory?.id === cat.id ? 'bg-orange-50 text-orange-700 shadow-sm' : 'hover:bg-slate-50 text-slate-600'}
                            `}
                          >
                            <div className={`
                              w-8 h-8 rounded-lg flex items-center justify-center
                              ${activeCategory?.id === cat.id ? 'bg-white text-orange-600' : 'bg-slate-100 text-slate-500'}
                            `}>
                              {/* Placeholder Icon (สามารถแทนด้วยรูปได้ถ้า backend ส่งมา) */}
                              <LayoutGrid size={16} />
                            </div>
                            <span className="font-bold text-sm">{cat.name}</span>
                            {activeCategory?.id === cat.id && <ChevronRight size={14} className="ml-auto text-orange-400" />}
                          </div>
                        ))
                      )}
                      {/* Link "ดูหมวดหมู่ทั้งหมด" */}
                      <Link to="/categories" className="flex items-center gap-2 p-3 text-orange-600 font-bold text-sm hover:underline mt-2 sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-100">
                        ดูหมวดหมู่ทั้งหมด <ChevronRight size={14} />
                      </Link>
                    </div>

                    {/* ── Right Panel: Subcategories ── */}
                    <div className="col-span-8 bg-slate-50/50 rounded-xl p-6">
                      {activeCategory ? (
                        <div>
                          {/* หัวข้อหมวดหมู่ที่เลือก */}
                          <div className="flex items-center gap-3 mb-6">
                            <h3 className="text-lg font-extrabold text-slate-800">{activeCategory.name}</h3>
                            <Link
                              to={`/jobs/search?mainCategoryId=${activeCategory.id}`}
                              className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full hover:bg-orange-200 transition-colors"
                            >
                              ดูงานทั้งหมด
                            </Link>
                          </div>

                          {/* รายการ Subcategories */}
                          {isLoadingSubCats ? (
                            <div className="text-center py-10 text-slate-400">กำลังโหลดหมวดหมู่ย่อย...</div>
                          ) : (
                            subCategoriesCache[activeCategory.id] && subCategoriesCache[activeCategory.id].length > 0 ? (
                              <div className="grid grid-cols-2 gap-3">
                                {subCategoriesCache[activeCategory.id].map(sub => (
                                  <Link
                                    key={sub.id}
                                    to={`/jobs/search?mainCategoryId=${activeCategory.id}&subCategoryId=${sub.id}`}
                                    className="flex items-center gap-2 text-slate-600 hover:text-orange-600 hover:translate-x-1 transition-all text-sm font-medium"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-10 text-slate-400">
                                <LayoutGrid size={40} className="mx-auto mb-2 opacity-20" />
                                <p>ไม่มีหมวดหมู่ย่อย</p>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                          <LayoutGrid size={48} className="mb-4 text-orange-200" />
                          <p className="font-medium text-slate-500">เลือกหมวดหมู่ด้านซ้าย</p>
                          <p className="text-sm">เพื่อดูรายละเอียดและหมวดหมู่ย่อย</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ──────────────── Other Nav Links ──────────────── */}
              <Link to="/jobs/search" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-orange-600 hover:bg-slate-50 rounded-full transition-all">
                หางานประจำ
              </Link>
              <Link to="/services/search" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-orange-600 hover:bg-slate-50 rounded-full transition-all">
                หาฟรีแลนซ์
              </Link>
            </nav>
          </div>

          {/* ================================================================
              3️⃣ RIGHT SIDE ACTIONS (AUTH & PROFILE)
              ================================================================ */}
          <div className="flex items-center gap-3">
            {isAuth ? (
              <>
                {/* ──────────────── Notifications ──────────────── */}
                <NotificationBell />

                {/* ──────────────── ✅ NEW: Chat Dropdown ──────────────── */}
                <div className="relative" ref={chatRef}>
                  <button
                    onClick={() => setIsChatDropdownOpen(!isChatDropdownOpen)}
                    className="p-2.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all relative"
                  >
                    <MessageSquare size={20} />
                  </button>

                  {/* Chat Dropdown Component */}
                  <ChatDropdown
                    isOpen={isChatDropdownOpen}
                    onClose={() => setIsChatDropdownOpen(false)}
                    dropdownRef={chatRef}
                  />
                </div>

                {/* ──────────────── Saved Jobs ──────────────── */}
                {(isJobSeeker || isFreelancer) && (
                  <Link to="/my-saved-jobs" className="p-2.5 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                    <Heart size={20} />
                  </Link>
                )}

                {/* ──────────────── Profile Dropdown ──────────────── */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all ml-2"
                  >
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-bold text-slate-800 leading-tight">{user?.firstName}</p>
                      <p className="text-xs text-slate-500 font-medium">{user?.role}</p>
                    </div>
                    <img
                      src={userProfileImg}
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <ChevronDown size={14} className="text-slate-400 mr-2" />
                  </button>

                  {/* ──────────────── Dropdown Menu ──────────────── */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Header */}
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
                        <p className="font-bold text-slate-800">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        {/* ✅ Profile (ทุกคน) */}
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl transition-all">
                          <User size={18} /> โปรไฟล์ของฉัน
                        </Link>

                        {/* ✅ JOB SEEKER Links */}
                        {isJobSeeker && (
                          <>
                            <Link to="/my-applications" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl transition-all">
                              <FileText size={18} /> งานที่สมัครไว้
                            </Link>
                            <Link to="/my-saved-jobs" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl transition-all">
                              <Heart size={18} /> งานที่บันทึกไว้
                            </Link>
                            <Link to="/my-hires" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl transition-all">
                              <Briefcase size={18} /> งานที่จ้าง (My Hires)
                            </Link>
                          </>
                        )}

                        {/* ✅ EMPLOYER Links */}
                        {isEmployer && (
                          <>
                            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl transition-all">
                              <LayoutGrid size={18} /> แดชบอร์ดผู้ประกอบการ
                            </Link>
                            <Link to="/company/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl transition-all">
                              <Building2 size={18} /> โปรไฟล์บริษัท
                            </Link>
                            <Link to="/company/create-job" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl transition-all">
                              <Plus size={18} /> ลงประกาศงาน
                            </Link>
                          </>
                        )}

                        {/* ✅ FREELANCER Links */}
                        {isFreelancer && (
                          <>
                            <Link to="/freelancer/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl transition-all">
                              <User size={18} /> โปรไฟล์ฟรีแลนซ์
                            </Link>
                            <Link to="/freelancer/services" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl transition-all">
                              <Briefcase size={18} /> บริการของฉัน
                            </Link>
                            <Link to="/freelancer/works" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl transition-all">
                              <FileText size={18} /> งานที่รับทำ
                            </Link>
                          </>
                        )}

                        {/* ✅ ADMIN Link */}
                        {isAdmin && (
                          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all">
                            <Shield size={18} /> ผู้ดูแลระบบ
                          </Link>
                        )}
                      </div>

                      {/* Logout Button */}
                      <div className="p-2 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <LogOut size={18} /> ออกจากระบบ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ──────────────── Login/Register Buttons (Not Logged In) ──────────────── */
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-orange-600 transition-all">
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="px-5 py-2.5 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-full shadow-lg shadow-orange-600/30 transition-all transform hover:-translate-y-0.5">
                  สมัครสมาชิก
                </Link>
              </div>
            )}

            {/* ──────────────── Mobile Menu Button ──────────────── */}
            <button
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================
          4️⃣ MOBILE MENU OVERLAY
          ================================================================ */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white pt-24 px-6 pb-6 overflow-y-auto animate-in slide-in-from-top-10 duration-200">
          <div className="flex flex-col gap-4">
            <Link to="/jobs/search" className="p-4 bg-slate-50 rounded-xl font-bold text-slate-700 flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <Briefcase size={20} className="text-orange-600" /> หางานประจำ
            </Link>
            <Link to="/services/search" className="p-4 bg-slate-50 rounded-xl font-bold text-slate-700 flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <User size={20} className="text-orange-600" /> หาฟรีแลนซ์
            </Link>
            <Link to="/categories" className="p-4 bg-slate-50 rounded-xl font-bold text-slate-700 flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <LayoutGrid size={20} className="text-orange-600" /> หมวดหมู่ทั้งหมด
            </Link>
            <div className="border-t border-slate-100 my-2"></div>
            {!isAuth && (
              <>
                <Link to="/login" className="w-full py-3 text-center font-bold text-slate-600 border border-slate-200 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="w-full py-3 text-center font-bold text-white bg-orange-600 rounded-xl shadow-lg" onClick={() => setIsMobileMenuOpen(false)}>
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;