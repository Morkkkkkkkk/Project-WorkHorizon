import React from 'react';
import { useAdminStats } from '../hooks/useAdminStats.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Link } from 'react-router-dom';
import { Users, Briefcase, Building, ShieldAlert, UserPlus, FileText, ArrowUpRight, RefreshCw } from 'lucide-react';

// --- การ์ดสถิติ (Modern Premium Style) ---
const StatCard = ({ title, value, icon, link, linkText, color, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
    {/* Background Decoration */}
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>

    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>

        {/* Optional Trend Indicator (Mockup) */}
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
            <ArrowUpRight size={12} />
            <span>{trend}</span>
          </div>
        )}

        {link && (
          <Link to={link} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 mt-4 group/link">
            {linkText}
            <ArrowUpRight size={14} className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        )}
      </div>

      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg shadow-${color.split('-')[1]}-500/30`}>
        {icon}
      </div>
    </div>
  </div>
);

// --- หน้า Admin Dashboard ---
const AdminDashboardPage = () => {
  const { stats, isLoading, error, refreshStats } = useAdminStats();

  if (isLoading) {
    return <LoadingSpinner text="กำลังโหลดข้อมูล Dashboard..." />;
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <ShieldAlert size={48} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={() => refreshStats()} className="btn-primary">ลองใหม่อีกครั้ง</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            ภาพรวมระบบ
          </h1>
          <p className="text-slate-500 mt-1">ข้อมูลสถิติและการดำเนินงานล่าสุดของ WorkHorizon</p>
        </div>
        <button
          onClick={() => refreshStats()}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
        >
          <RefreshCw size={18} />
          <span>อัปเดตข้อมูล</span>
        </button>
      </div>

      {/* 1. KPI Stats (Main) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="ผู้ใช้งานทั้งหมด"
          value={stats.totalUsers.toLocaleString()}
          icon={<Users size={24} />}
          link="/admin/users"
          linkText="จัดการผู้ใช้"
          color="from-blue-500 to-blue-600"
          trend="+12% จากเดือนก่อน"
        />
        <StatCard
          title="บริษัทในระบบ"
          value={stats.totalCompanies.toLocaleString()}
          icon={<Building size={24} />}
          link="/admin/verify"
          linkText="ตรวจสอบบริษัท"
          color="from-indigo-500 to-indigo-600"
          trend="+5% จากเดือนก่อน"
        />
        <StatCard
          title="งานที่ลงประกาศ"
          value={stats.totalJobs.toLocaleString()}
          icon={<Briefcase size={24} />}
          link="/admin/jobs"
          linkText="จัดการประกาศงาน"
          color="from-purple-500 to-purple-600"
          trend="+8% จากเดือนก่อน"
        />
      </div>

      {/* 2. Action & Recent Stats */}
      <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4 flex items-center gap-2">
        <ShieldAlert className="text-orange-500" size={24} />
        รายการที่ต้องดำเนินการ
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="บริษัทรอการอนุมัติ"
          value={stats.pendingVerification.toLocaleString()}
          icon={<ShieldAlert size={24} />}
          link="/admin/verify"
          linkText="ไปหน้าอนุมัติทันที"
          color="from-orange-500 to-orange-600"
        />
        <StatCard
          title="ผู้ใช้ใหม่ (7 วันล่าสุด)"
          value={stats.newUsers.toLocaleString()}
          icon={<UserPlus size={24} />}
          color="from-teal-500 to-teal-600"
        />
        <StatCard
          title="ใบสมัครงานใหม่ (7 วันล่าสุด)"
          value={stats.newApplications.toLocaleString()}
          icon={<FileText size={24} />}
          color="from-pink-500 to-pink-600"
        />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
