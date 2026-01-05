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

// --- (Component ย่อยสำหรับ Nav Link - Modern Dark Theme) ---
const AdminNavLink = ({ to, icon, label, collapsed }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `
      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden
      ${isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }
      ${collapsed ? "justify-center" : ""}
    `
    }
    title={collapsed ? label : ""}
  >
    {/* Active Indicator (Glow effect) */}
    {({ isActive }) => (
      <>
        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />}
        <span className={`relative z-10 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
          {icon}
        </span>
        {!collapsed && <span className="relative z-10 font-medium">{label}</span>}
      </>
    )}
  </NavLink>
);

// --- (Layout หลัก - Admin Dashboard) ---
const AdminLayout = () => {
  const { user, logout } = useAuth();

  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith("http")) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  const getProfileInitial = () => user?.firstName?.charAt(0) || "?";
  const profileImageUrl = getImageUrl(user?.profileImageUrl);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    // UI Update: ใช้ Font 'Noto Sans Thai' และพื้นหลังสีเทาอ่อนสำหรับ Content Area
    <div className="flex min-h-screen bg-slate-50 font-sans" style={{ fontFamily: "'Noto Sans Thai', sans-serif" }}>

      {/* 1. Sidebar (Dark Theme for Professional Admin Look) */}
      <aside
        className={`
          ${isCollapsed ? "w-20" : "w-72"}
          flex-shrink-0 
          bg-slate-900 
          text-slate-300
          flex flex-col 
          relative 
          transition-all 
          duration-300
          shadow-2xl
          z-20
        `}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="
            absolute -right-3 top-8 
            w-6 h-6 
            bg-slate-800 
            text-slate-400
            border border-slate-700 
            rounded-full 
            flex items-center justify-center 
            shadow-md
            hover:bg-blue-600 hover:text-white hover:border-blue-600
            transition-all
            z-30
          "
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Section */}
        <div className={`p-6 mb-2 ${isCollapsed ? "px-4" : ""}`}>
          <Link
            to="/"
            className={`
                flex items-center gap-3 
                text-white font-extrabold 
                text-2xl 
                tracking-tight 
                hover:opacity-90 transition
                ${isCollapsed ? "justify-center" : ""}
            `}
          >
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/20">
              <Briefcase className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            {!isCollapsed && (
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                WorkHorizon
              </span>
            )}
          </Link>
        </div>

        {/* MENU LIST */}
        <div className="flex flex-col gap-6 overflow-y-auto flex-1 px-4 pb-24 custom-scroll">
          {/* --- SECTION: ระบบงาน --- */}
          <div>
            <p
              className={`
                text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-3 px-2
                transition-all duration-300
                ${isCollapsed ? "opacity-0 h-0 overflow-hidden" : ""}
              `}
            >
              ระบบงานหลัก
            </p>

            <div className="flex flex-col gap-1">
              <AdminNavLink
                to="/admin/dashboard"
                label="แผงควบคุม"
                icon={<LayoutGrid size={20} />}
                collapsed={isCollapsed}
              />
              <AdminNavLink
                to="/admin/verify"
                label="อนุมัติบริษัท"
                icon={<ShieldCheck size={20} />}
                collapsed={isCollapsed}
              />
              <AdminNavLink
                to="/admin/withdrawals"
                label="รายการถอนเงิน"
                icon={<Wallet size={20} />}
                collapsed={isCollapsed}
              />
              <AdminNavLink
                to="/admin/users"
                label="จัดการผู้ใช้"
                icon={<Users size={20} />}
                collapsed={isCollapsed}
              />
              <AdminNavLink
                to="/admin/jobs"
                label="จัดการงาน"
                icon={<Package size={20} />}
                collapsed={isCollapsed}
              />
            </div>
          </div>

          {/* --- SECTION: เนื้อหาเว็บไซต์ --- */}
          <div>
            <p
              className={`
                text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-3 px-2
                transition-all duration-300
                ${isCollapsed ? "opacity-0 h-0 overflow-hidden" : ""}
              `}
            >
              จัดการเนื้อหา
            </p>

            <div className="flex flex-col gap-1">
              <AdminNavLink
                to="/admin/ads"
                label="จัดการโฆษณา"
                icon={<Megaphone size={20} />}
                collapsed={isCollapsed}
              />
              <AdminNavLink
                to="/admin/main-categories"
                label="หมวดหมู่หลัก"
                icon={<Image size={20} />}
                collapsed={isCollapsed}
              />
              <AdminNavLink
                to="/admin/master-data"
                label="ข้อมูลย่อย"
                icon={<Database size={20} />}
                collapsed={isCollapsed}
              />
              <AdminNavLink
                to="/admin/featured"
                label="หน้าแรก (Home)"
                icon={<Star size={20} />}
                collapsed={isCollapsed}
              />
            </div>
          </div>
        </div>

        {/* --- USER PROFILE SECTION (Bottom) --- */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div
            className={`
                flex items-center gap-3
                p-2 
                rounded-xl 
                transition-all
                ${isCollapsed ? "justify-center" : "bg-slate-800/50 hover:bg-slate-800"}
                `}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-slate-700">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getProfileInitial()
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>

            {!isCollapsed && (
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-blue-400 font-medium">ผู้ดูแลระบบสูงสุด</p>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Content Area (ขวา) */}
      <main className="flex-1 p-8 overflow-y-auto h-screen custom-scroll">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
