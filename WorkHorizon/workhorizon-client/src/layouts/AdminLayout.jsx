import React, { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
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
} from "lucide-react";
import { BACKEND_URL } from "../api/apiClient.js";

// --- Custom CSS for scrollbar hiding & smooth visuals ---
const customStyles = `
  .custom-scroll::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.2);
    border-radius: 10px;
  }
  .custom-scroll:hover::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.4);
  }
`;

// --- (Component ย่อยสำหรับ Nav Link - Premium Style) ---
const AdminNavLink = ({ to, icon, label, collapsed }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `
      relative flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-300 group overflow-hidden
      ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_20px_-5px_rgba(79,70,229,0.4)]"
          : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
      }
      ${collapsed ? "justify-center" : ""}
      `
    }
    title={collapsed ? label : ""}
  >
    {({ isActive }) => (
      <>
        {/* Active Indicator Glow Effect */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none opacity-50" />
        )}
        
        {/* Icon with smooth scale animation */}
        <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110 group-hover:text-white'}`}>
          {icon}
        </span>

        {/* Label */}
        {!collapsed && (
          <span className={`relative z-10 font-medium tracking-wide transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
            {label}
          </span>
        )}

        {/* Active Dot Indicator (Right side) */}
        {!collapsed && isActive && (
          <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse" />
        )}
      </>
    )}
  </NavLink>
);

// --- (Layout หลัก - Admin Dashboard Premium) ---
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith("http")) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  const getProfileInitial = () => user?.firstName?.charAt(0) || "?";
  const profileImageUrl = getImageUrl(user?.profileImageUrl);

  return (
    <div className="flex min-h-screen bg-[#F0F4F8] font-sans selection:bg-blue-500 selection:text-white" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <style>{customStyles}</style>

      {/* 1. Sidebar (Premium Dark Glass) */}
      <aside
        className={`
          ${isCollapsed ? "w-[88px]" : "w-72"}
          flex-shrink-0 
          bg-[#0B1120] 
          text-slate-300
          flex flex-col 
          relative 
          transition-all 
          duration-500
          ease-[cubic-bezier(0.25,0.8,0.25,1)]
          shadow-2xl
          z-50
          border-r border-slate-800/50
        `}
      >
        {/* Background Gradient Mesh (Optional Visual Depth) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#0B1120] to-[#050914] pointer-events-none -z-10" />

        {/* Toggle Button (Floating) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="
            absolute -right-3.5 top-9 
            w-7 h-7 
            bg-slate-800 
            text-slate-400
            border border-slate-700 
            rounded-full 
            flex items-center justify-center 
            shadow-[0_0_15px_rgba(0,0,0,0.3)]
            hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:scale-110
            transition-all duration-300
            z-50
            group
          "
        >
          {isCollapsed ? <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />}
        </button>

        {/* Logo Section */}
        <div className={`p-6 mb-2 ${isCollapsed ? "px-4 flex justify-center" : ""}`}>
          <Link
            to="/"
            className="flex items-center gap-3.5 group"
          >
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-[15px] opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-300">
                  <Briefcase className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  WorkHorizon
                </span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">Admin Panel</span>
              </div>
            )}
          </Link>
        </div>

        {/* MENU LIST */}
        <div className="flex flex-col gap-8 overflow-y-auto flex-1 px-4 pb-24 custom-scroll">
          
          {/* --- SECTION 1 --- */}
          <div>
            {!isCollapsed && (
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-4 px-2 select-none">
                ระบบงานหลัก
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <AdminNavLink to="/admin/dashboard" label="แผงควบคุม" icon={<LayoutGrid size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/verify" label="อนุมัติบริษัท" icon={<ShieldCheck size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/withdrawals" label="รายการถอนเงิน" icon={<Wallet size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/users" label="จัดการผู้ใช้" icon={<Users size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/jobs" label="จัดการงาน" icon={<Package size={20} />} collapsed={isCollapsed} />
            </div>
          </div>

          {/* --- SECTION 2 --- */}
          <div>
            {!isCollapsed && (
                <div className="flex items-center gap-2 mb-4 px-2">
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest select-none">
                        จัดการเนื้อหา
                    </p>
                    <div className="h-[1px] flex-1 bg-slate-800/50"></div>
                </div>
            )}
            <div className="flex flex-col gap-1.5">
              <AdminNavLink to="/admin/ads" label="จัดการโฆษณา" icon={<Megaphone size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/main-categories" label="หมวดหมู่หลัก" icon={<Image size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/master-data" label="ข้อมูลย่อย" icon={<Database size={20} />} collapsed={isCollapsed} />
              <AdminNavLink to="/admin/featured" label="หน้าแรก (Home)" icon={<Star size={20} />} collapsed={isCollapsed} />
            </div>
          </div>
        </div>

        {/* --- USER PROFILE SECTION (Glassmorphism) --- */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050914] via-[#0B1120] to-transparent">
          <div
            className={`
              flex items-center gap-3.5
              p-2.5 
              rounded-2xl 
              transition-all duration-300
              border border-white/5
              backdrop-blur-md
              ${isCollapsed ? "justify-center bg-white/5" : "bg-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-lg hover:shadow-black/20"}
            `}
          >
            {/* Avatar with Status Ring */}
            <div className="relative flex-shrink-0 group">
              <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-purple-500">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                    {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <span className="text-white font-bold text-sm">{getProfileInitial()}</span>
                    )}
                  </div>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0B1120] rounded-full shadow-sm animate-pulse"></div>
            </div>

            {!isCollapsed && (
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-slate-100 truncate leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-blue-400 font-medium truncate mt-0.5">Admin Superuser</p>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 hover:scale-105 transition-all duration-200"
                title="ออกจากระบบ"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Content Area (ขวา) */}
      <main className="flex-1 relative overflow-hidden h-screen bg-[#F0F4F8]">
          {/* Decorative background blob */}
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none -z-0"></div>
          
          <div className="h-full overflow-y-auto custom-scroll p-6 md:p-8 lg:p-10 relative z-10">
            <div className="max-w-7xl mx-auto animate-fade-in-up">
                <Outlet />
            </div>
          </div>
      </main>
    </div>
  );
};

export default AdminLayout;