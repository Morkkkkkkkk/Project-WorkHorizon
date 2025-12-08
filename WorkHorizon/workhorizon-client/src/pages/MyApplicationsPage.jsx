import React from 'react';
import { Link } from 'react-router-dom';
import { useMyApplications } from '../hooks/useMyApplications';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ApplicationStatusRow from '../components/ApplicationStatusRow.jsx';

/* === MODERNIZED UIimport Icons === */
import { FileText, Briefcase, Send, TrendingUp, Search } from 'lucide-react';

const MyApplicationsPage = () => {
  const { applications, isLoading, error } = useMyApplications();

  if (isLoading) {
    return <LoadingSpinner text="กำลังโหลดใบสมัครของคุณ..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
          <h1 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-slate-600">ไม่สามารถโหลดข้อมูลได้</p>
        </div>
      </div>
    );
  }

  /* === Calculate Statistics === */
  const totalApplications = applications.length;
  const pendingCount = applications.filter(app => app.status === 'PENDING').length;
  const interviewCount = applications.filter(app => app.status === 'SHORTLISTED').length;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">

      {/* === MODERNIZED: Hero Header with Gradient === */}
      <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-3xl shadow-2xl p-8 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Send className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2">
                ใบสมัครของฉัน
              </h1>
              <p className="text-green-100 text-lg">ติดตามสถานะการสมัครงานของคุณ</p>
            </div>
          </div>
        </div>
      </div>

      {/* === MODERNIZED: Statistics Cards === */}
      {applications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Applications */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">ทั้งหมด</p>
                <h3 className="text-4xl font-extrabold text-slate-900">{totalApplications}</h3>
                <p className="text-sm text-slate-500 mt-2">ใบสมัครทั้งหมด</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="text-blue-600 w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">รอพิจารณา</p>
                <h3 className="text-4xl font-extrabold text-yellow-600">{pendingCount}</h3>
                <p className="text-sm text-slate-500 mt-2">กำลังรอตรวจสอบ</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-xl">
                <TrendingUp className="text-yellow-600 w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Interview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">นัดสัมภาษณ์</p>
                <h3 className="text-4xl font-extrabold text-green-600">{interviewCount}</h3>
                <p className="text-sm text-slate-500 mt-2">ได้รับการติดต่อ</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <Briefcase className="text-green-600 w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODERNIZED: Applications Table === */}
      {applications.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText size={20} className="text-green-600" />
              รายการใบสมัครทั้งหมด
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    ตำแหน่งงาน
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    บริษัท
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    วันที่สมัคร
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {applications.map(app => (
                  <ApplicationStatusRow key={app.id} application={app} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* === MODERNIZED: Empty State === */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="p-6 bg-slate-50 rounded-full mb-6">
              <Send size={64} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              คุณยังไม่ได้สมัครงาน
            </h3>
            <p className="text-slate-500 mb-8 text-lg leading-relaxed">
              เริ่มต้นค้นหางานที่ใช่สำหรับคุณและส่งใบสมัครได้เลยวันนี้
            </p>
            <Link
              to="/"
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-600/20 transition-all hover:scale-105"
            >
              <Search size={22} /> ค้นหางาน
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyApplicationsPage;
