import React from 'react';
import { useAdminStats } from '../hooks/useAdminStats.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { Link } from 'react-router-dom';
import { 
  Users, Briefcase, Building, ShieldAlert, UserPlus, FileText, 
  ArrowUpRight, RefreshCw, BarChart3, Clock, CheckCircle2 
} from 'lucide-react';
import { BACKEND_URL } from '../api/apiClient';

// ✅ Import Recharts
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

// --- Components ย่อย ---
const StatCard = ({ title, value, icon, link, linkText, color, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
            <ArrowUpRight size={12} /> <span>{trend}</span>
          </div>
        )}
        {link && (
          <Link to={link} className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 mt-4 group/link">
            {linkText} <ArrowUpRight size={14} className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

// สีสำหรับกราฟ
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboardPage = () => {
  const { stats, isLoading, error, refreshStats } = useAdminStats();

  if (isLoading) return <LoadingSpinner text="กำลังโหลดข้อมูล Dashboard..." />;
  if (error || !stats) return <div className="text-center p-10 text-red-500">เกิดข้อผิดพลาด: {error}</div>;

  // เตรียมข้อมูลกราฟ (ถ้า Backend ส่งมา)
  const roleData = stats.charts?.userRoles || [];
  const jobData = stats.charts?.jobStatus || [];
  const recentJobs = stats.recentJobs || [];

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">ภาพรวมระบบ</h1>
          <p className="text-slate-500 mt-1">ข้อมูลสถิติและการดำเนินงานล่าสุดของ WorkHorizon</p>
        </div>
        <button onClick={() => refreshStats()} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm">
          <RefreshCw size={18} /> <span>อัปเดตข้อมูล</span>
        </button>
      </div>

      {/* 1. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="ผู้ใช้งานทั้งหมด" value={stats.totalUsers.toLocaleString()} icon={<Users size={24} />} link="/admin/users" linkText="จัดการผู้ใช้" color="from-blue-500 to-blue-600" trend="+12%" />
        <StatCard title="บริษัทในระบบ" value={stats.totalCompanies.toLocaleString()} icon={<Building size={24} />} link="/admin/verify" linkText="ตรวจสอบบริษัท" color="from-indigo-500 to-indigo-600" trend="+5%" />
        <StatCard title="งานที่ลงประกาศ" value={stats.totalJobs.toLocaleString()} icon={<Briefcase size={24} />} link="/admin/jobs" linkText="จัดการงาน" color="from-purple-500 to-purple-600" trend="+8%" />
      </div>

      {/* 2. Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center justify-between">
           <div><p className="text-sm text-orange-600 font-bold">รออนุมัติ</p><h4 className="text-2xl font-bold text-orange-800">{stats.pendingVerification}</h4></div>
           <ShieldAlert className="text-orange-400" size={32} />
        </div>
        <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl flex items-center justify-between">
           <div><p className="text-sm text-teal-600 font-bold">ผู้ใช้ใหม่ (7 วัน)</p><h4 className="text-2xl font-bold text-teal-800">{stats.newUsers}</h4></div>
           <UserPlus className="text-teal-400" size={32} />
        </div>
        <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl flex items-center justify-between">
           <div><p className="text-sm text-pink-600 font-bold">ใบสมัครใหม่ (7 วัน)</p><h4 className="text-2xl font-bold text-pink-800">{stats.newApplications}</h4></div>
           <FileText className="text-pink-400" size={32} />
        </div>
      </div>

      {/* 3. Charts Section (เพิ่มความ Professional) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* กราฟสัดส่วนผู้ใช้ */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users size={20} className="text-blue-500" /> สัดส่วนผู้ใช้งานตามบทบาท
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  fill="#8884d8" paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* กราฟสถานะงาน */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-purple-500" /> สถานะงานในระบบ
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity Table (รายการล่าสุด) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-slate-400" /> ประกาศงานล่าสุด
          </h3>
          <Link to="/admin/jobs" className="text-sm text-blue-600 hover:text-blue-700 font-medium">ดูทั้งหมด</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">ชื่องาน</th>
                <th className="px-6 py-4">บริษัท</th>
                <th className="px-6 py-4">ประเภท</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4">วันที่ลง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentJobs.length > 0 ? recentJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{job.title}</td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                       {job.company.logoUrl && <img src={`${BACKEND_URL}${job.company.logoUrl}`} className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-slate-600">{job.company.companyName}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 text-xs font-semibold">
                      {job.jobType.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 
                      job.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {job.status === 'PUBLISHED' && <CheckCircle2 size={12} />}
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(job.createdAt).toLocaleDateString('th-TH')}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">ยังไม่มีข้อมูลงานในระบบ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;