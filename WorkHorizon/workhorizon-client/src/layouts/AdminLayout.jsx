import React, { useState } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutGrid,
  Megaphone,
  ShieldCheck,
  Users,
  Package,
  Database,
  LogOut,
  Briefcase,
  User,
  Image,
  Star,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Menu,
  Bell,
  Search
} from "lucide-react";
import { BACKEND_URL } from "../api/apiClient.js";

// --- Components (UI ย่อย) ---

// 1. Menu Item (ปรับให้ดู Premium มี Glow Effect ตอน Active)
const AdminNavLink = ({ to, icon, label, collapsed }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `
      relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden
      ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
          : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
      }
      ${collapsed ? "justify-center px-2" : ""}
      `
    }
    title={collapsed ? label : ""}
  >
    {({ isActive }) => (
      <>
        {/* Active Background Animation */}
        {isActive && (
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Icon */}
        <span className={`relative z-10 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
          {icon}
        </span>

        {/* Label */}
        {!collapsed && (
          <span className="relative z-10 font-medium tracking-wide">
            {label}
          </span>
        )}

        {/* Active Dot Indicator (จุดเล็กๆ ด้านขวา) */}
        {!collapsed && isActive && (
          <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
        )}
      </>
    )}
  </NavLink>
);

// --- Main Layout ---

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Helper: Get Image URL
  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith("http")) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  const getProfileInitial = () => user?.firstName?.charAt(0) || "?";
  const profileImageUrl = getImageUrl(user?.profileImageUrl);

  // Helper: Get Page Title from Path (สำหรับแสดงบน Header)
  const getPageTitle = () => {
    const path = location.pathname.split("/")[2]; // e.g. /admin/dashboard -> dashboard
    switch (path) {
      case "dashboard": return "ภาพรวมระบบ (Dashboard)";
      case "verify": return "ตรวจสอบและอนุมัติ";
      case "users": return "จัดการผู้ใช้งาน";
      case "jobs": return "จัดการประกาศงาน";
      case "ads": return "จัดการโฆษณา";
      case "withdrawals": return "รายการถอนเงิน";
      default: return "Admin Panel";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4F8] font-sans text-slate-800">
      
      {/* ---------------- Sidebar (Dark Theme Premium) ---------------- */}
      <aside
        className={`
          ${isCollapsed ? "w-[90px]" : "w-72"}
          flex-shrink-0 bg-[#0B1120] text-slate-300 flex flex-col relative transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] shadow-2xl z-20
        `}
      >
        {/* Toggle Button (ปุ่มย่อ/ขยาย ลอยอยู่ขอบ) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 w-7 h-7 bg-white text-slate-600 border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all duration-300 z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Section */}
        <div className={`h-24 flex items-center ${isCollapsed ? "justify-center px-0" : "px-8"}`}>
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <Briefcase className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-tight">WorkHorizon</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Admin Panel</span>
              </div>
            )}
          </Link>
        </div>

        {/* Menu Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 custom-scrollbar">
          
          {/* Group 1: Main System */}
          <div>
            {!isCollapsed && (
              <p className="px-4 mb-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                ระบบงานหลัก
              </p>
            )}
            <div className="space-y-1.5">
              <AdminNavLink to="/admin/dashboard" label="Dashboard" icon={<LayoutGrid size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/verify" label="อนุมัติบริษัท" icon={<ShieldCheck size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/withdrawals" label="การเงิน/ถอนเงิน" icon={<Wallet size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/users" label="ผู้ใช้งาน" icon={<Users size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/jobs" label="ประกาศงาน" icon={<Package size={20} />} collapsed={isCollapsed} />
            </div>
          </div>

          {/* Group 2: Content Management */}
          <div>
            {!isCollapsed && (
              <p className="px-4 mb-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                จัดการเนื้อหา
              </p>
            )}
            <div className="space-y-1.5">
              <AdminNavLink to="/admin/ads" label="โฆษณา" icon={<Megaphone size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/main-categories" label="หมวดหมู่หลัก" icon={<Image size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/master-data" label="ข้อมูลระบบ (Master)" icon={<Database size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/featured" label="หน้าแรก (Featured)" icon={<Star size={20} />} collapsed={isCollapsed} />
            </div>
          </div>
        </div>

        {/* Profile Footer */}
        <div className="p-4 border-t border-slate-800/50 bg-[#0f1629]">
          <div className={`flex items-center gap-3 p-2 rounded-xl transition-all ${isCollapsed ? "justify-center" : "bg-slate-800/50"}`}>
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg">
               <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-slate-900">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold bg-slate-700">
                      {getProfileInitial()}
                    </div>
                  )}
               </div>
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-xs text-slate-400">Online</p>
                </div>
              </div>
            )}

            {!isCollapsed && (
              <button 
                onClick={logout} 
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>


      {/* ---------------- Main Content Area ---------------- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Header Bar (Glassmorphism) */}
        <header className="h-20 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10">
          
          {/* Title & Breadcrumb */}
          <div className="flex flex-col">
             <h1 className="text-xl font-bold text-slate-800 tracking-tight">{getPageTitle()}</h1>
             <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span>Admin</span>
                <ChevronRight size={10} />
                <span className="text-blue-600 font-medium">{location.pathname.split("/").pop()}</span>
             </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
             
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F0F4F8] relative">
           {/* Background Decoration (Blob) */}
           <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none -z-0"></div>

           <div className="max-w-7xl mx-auto relative z-10 animate-fade-in-up">
              <Outlet />
           </div>
        </div>
        
      </main>
    </div>
  );
};

export default AdminLayout;