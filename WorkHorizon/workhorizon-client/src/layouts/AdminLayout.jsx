import React, { useState } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutGrid, Megaphone, ShieldCheck, Users, Package, Database,
  LogOut, Briefcase, ChevronLeft, ChevronRight, Wallet,
  Mail, MessageSquare, CreditCard, Palette, Star, Image,
  Search, Bell, Globe, Menu
} from "lucide-react";
import { BACKEND_URL } from "../api/apiClient.js";

// --- 🌍 1. สร้าง Dictionary คำแปล (TH/EN) ---
const TRANSLATIONS = {
  TH: {
    dashboard: "ภาพรวมระบบ",
    verify: "ตรวจสอบและอนุมัติ",
    users: "จัดการผู้ใช้งาน",
    jobs: "จัดการประกาศงาน",
    ads: "จัดการโฆษณา",
    withdrawals: "รายการถอนเงิน",
    masterData: "ข้อมูลระบบ (Master)",
    mainCategories: "หมวดหมู่หลัก",
    featured: "หน้าแรก (Featured)",
    contacts: "กล่องข้อความ",
    disputes: "ข้อพิพาท / แจ้งปัญหา",
    payments: "ตรวจสอบสลิปโอนเงิน",
    themes: "จัดการธีมเทศกาล",
    
    // Group Titles
    groupMain: "ระบบงานหลัก",
    groupFinance: "การเงิน & ปัญหา",
    groupContent: "จัดการเนื้อหา",
    
    // Others
    adminPanel: "แผงควบคุมผู้ดูแล",
    online: "ออนไลน์",
    signOut: "ออกจากระบบ",
    searchPlaceholder: "ค้นหาเมนู หรือ ข้อมูล...",
    lang: "ภาษา",
    notifications: "การแจ้งเตือน"
  },
  EN: {
    dashboard: "Dashboard",
    verify: "Verification",
    users: "User Management",
    jobs: "Job Management",
    ads: "Advertisement",
    withdrawals: "Withdrawals",
    masterData: "Master Data",
    mainCategories: "Main Categories",
    featured: "Featured Content",
    contacts: "Inbox / Contacts",
    disputes: "Disputes / Issues",
    payments: "Payment Check",
    themes: "Seasonal Themes",

    // Group Titles
    groupMain: "Main System",
    groupFinance: "Finance & Issues",
    groupContent: "Content Manager",

    // Others
    adminPanel: "Admin Panel",
    online: "Online",
    signOut: "Sign Out",
    searchPlaceholder: "Search menu or data...",
    lang: "Language",
    notifications: "Notifications"
  }
};

// --- Components: Menu Item ---
const AdminNavLink = ({ to, icon, label, collapsed }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `
      flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
      ${isActive
        ? "bg-blue-600 text-white shadow-md"
        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
      }
      ${collapsed ? "justify-center" : ""}
      `
    }
    title={collapsed ? label : ""}
  >
    {({ isActive }) => (
      <>
        <span className={`transition-transform duration-200 ${isActive ? "" : "group-hover:scale-105"}`}>
          {icon}
        </span>
        {!collapsed && (
          <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
            {label}
          </span>
        )}
      </>
    )}
  </NavLink>
);

// --- Main Layout ---
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // ✅ State สำหรับภาษา (Default = TH)
  const [lang, setLang] = useState('TH'); 
  const t = (key) => TRANSLATIONS[lang][key] || key; // ฟังก์ชันแปลภาษา

  const location = useLocation();

  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith("http")) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  // ✅ เปลี่ยนจาก return text เป็น return KEY ของ Dictionary
  const getPageKey = () => {
    const path = location.pathname.split("/")[2];
    switch (path) {
      case "dashboard": return "dashboard";
      case "verify": return "verify";
      case "users": return "users";
      case "jobs": return "jobs";
      case "ads": return "ads";
      case "withdrawals": return "withdrawals";
      case "master-data": return "masterData";
      case "main-categories": return "mainCategories";
      case "featured": return "featured";
      case "contacts": return "contacts";
      case "disputes": return "disputes";
      case "payments": return "payments";
      case "themes": return "themes";
      default: return "adminPanel";
    }
  };

  const toggleLang = () => setLang(prev => prev === 'TH' ? 'EN' : 'TH');

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-800">

      {/* ---------------- Sidebar (Fixed) ---------------- */}
      <aside
        className={`
          ${isCollapsed ? "w-20" : "w-64"}
          h-screen sticky top-0 flex flex-col flex-shrink-0
          bg-[#111827] text-white border-r border-slate-800
          transition-all duration-300 ease-in-out z-30 shadow-xl
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-slate-800/50 shrink-0 relative bg-[#0f1623]">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
              <Briefcase className="text-white w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">WorkHorizon</span>
            )}
          </Link>
          
          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 w-6 h-6 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center shadow-sm hover:text-blue-600 hover:border-blue-300 transition-colors z-50"
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          
          {/* Group 1 */}
          <div>
            {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('groupMain')}</p>}
            <div className="space-y-1">
              <AdminNavLink to="/admin/dashboard" label={t('dashboard')} icon={<LayoutGrid size={18} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/users" label={t('users')} icon={<Users size={18} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/jobs" label={t('jobs')} icon={<Package size={18} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/verify" label={t('verify')} icon={<ShieldCheck size={18} />} collapsed={isCollapsed} />
            </div>
          </div>

          {/* Group 2 */}
          <div>
            {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('groupFinance')}</p>}
            <div className="space-y-1">
              <AdminNavLink to="/admin/withdrawals" label={t('withdrawals')} icon={<Wallet size={18} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/payments" label={t('payments')} icon={<CreditCard size={18} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/disputes" label={t('disputes')} icon={<MessageSquare size={18} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/contacts" label={t('contacts')} icon={<Mail size={18} />} collapsed={isCollapsed} />
            </div>
          </div>

          {/* Group 3 */}
          <div>
            {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('groupContent')}</p>}
            <div className="space-y-1">
              <AdminNavLink to="/admin/ads" label={t('ads')} icon={<Megaphone size={18} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/themes" label={t('themes')} icon={<Palette size={18} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/main-categories" label={t('mainCategories')} icon={<Image size={18} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/featured" label={t('featured')} icon={<Star size={18} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/master-data" label={t('masterData')} icon={<Database size={18} />} collapsed={isCollapsed} />
            </div>
          </div>
        </div>

        {/* Footer & Logout */}
        <div className="p-3 border-t border-slate-800 bg-[#0f1623] shrink-0">
          <div className={`flex flex-col gap-3 ${isCollapsed ? "items-center" : ""}`}>
            <button
              onClick={logout}
              className={`
                flex items-center justify-center gap-2 rounded-lg py-2 transition-colors
                ${isCollapsed 
                  ? "w-8 h-8 text-red-400 hover:bg-red-500/10" 
                  : "w-full bg-slate-800/50 text-slate-300 hover:bg-red-600 hover:text-white text-xs font-medium border border-slate-700/50 hover:border-red-500"
                }
              `}
              title={t('signOut')}
            >
              <LogOut size={16} />
              {!isCollapsed && <span>{t('signOut')}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* ✅ 2. Beautiful Top Header Bar */}
        <header className="h-16 px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between shrink-0 sticky top-0 z-20 transition-all">
          
          {/* Left: Title & Breadcrumb */}
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
              {t(getPageKey())}
            </h1>
            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-medium">
              <span>Admin</span>
              <ChevronRight size={10} />
              <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{t(getPageKey())}</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 md:gap-5">

            {/* Language Switcher */}
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all border border-transparent hover:border-slate-200"
              title="Switch Language"
            >
              <Globe size={16} className={lang === 'EN' ? 'text-blue-600' : 'text-slate-500'} />
              <span>{lang}</span>
            </button>

            {/* Notification Bell */}
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Dropdown (Simplified) */}
            <div className="flex items-center gap-3 pl-2 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{user?.firstName}</p>
                <p className="text-[10px] text-slate-400">Super Admin</p>
              </div>
              <div className="relative">
                <img 
                  src={getImageUrl(user?.profileImageUrl) || "https://placehold.co/100"} 
                  alt="Profile" 
                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm group-hover:shadow-md transition-all group-hover:ring-2 group-hover:ring-blue-500/20"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
            </div>

          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC] relative">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none -z-0"></div>
          
          <div className="max-w-7xl mx-auto relative z-10 animate-fade-in-up">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;