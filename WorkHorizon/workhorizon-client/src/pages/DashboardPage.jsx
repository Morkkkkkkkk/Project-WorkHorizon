import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployerJobs } from '../hooks/useEmployerJobs';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import EmployerJobRow from '../components/EmployerJobRow.jsx';
import Modal from '../components/Modal.jsx';
import JobForm from '../components/JobForm.jsx';
import { jobApi } from '../api/jobApi.js';

/* === MODERNIZED UI - Import Icons === */
import { Briefcase, Plus, TrendingUp, Users, FileText, Calendar } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { jobs, isLoading, error, refreshJobs } = useEmployerJobs();

  /* === Modal State === */
  const [modalState, setModalState] = useState({
    isOpen: false,
    data: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  /* === Callbacks === */
  const handleEdit = useCallback((job) => {
    const initialData = {
      ...job,
      category: job.category,
      jobType: job.jobType,
      province: job.province,
      district: job.district,
      skills: job.requiredSkills || [],
      categoryId: undefined,
      jobTypeId: undefined,
      provinceId: undefined,
      districtId: undefined,
      requiredSkills: undefined,
    };
    setModalState({ isOpen: true, data: initialData });
  }, []);

  const handleCreate = useCallback(() => setModalState({ isOpen: true, data: null }), []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, data: null });
    setActionError(null);
  }, []);

  const handleSubmit = useCallback(async (formData, secondArg) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      if (modalState.data?.id) {
        // Update mode
        await jobApi.updateJob(modalState.data.id, formData);
      } else {
        // Create mode
        const newJob = await jobApi.createJob(formData);

        // Check for files (secondArg should be files array if present)
        const files = Array.isArray(secondArg) ? secondArg : [];
        if (files.length > 0) {
          const imageFormData = new FormData();
          for (let i = 0; i < files.length; i++) {
            imageFormData.append('jobImages', files[i]);
          }
          await jobApi.uploadJobImages(newJob.id, imageFormData);
        }
      }
      closeModal();
      refreshJobs();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  }, [closeModal, refreshJobs, modalState.data]);

  if (isLoading) {
    return <LoadingSpinner text="กำลังโหลดงานของคุณ..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200">
          <h1 className="text-2xl font-bold text-red-600 mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-slate-600">ไม่สามารถโหลดข้อมูลงานได้</p>
        </div>
      </div>
    );
  }

  /* === Calculate Statistics === */
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'PUBLISHED').length;
  const totalApplicants = jobs.reduce((sum, job) => sum + (job._count?.applications || 0), 0);

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">

        {/* === MODERNIZED: Hero Header with Gradient === */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-2xl p-8 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-white mb-2">
                  จัดการประกาศงาน
                </h1>
                <p className="text-blue-100 text-lg">ยินดีต้อนรับ, {user?.firstName || 'คุณ'}</p>
              </div>
            </div>

            {/* Create Job Button */}
            <button
              onClick={handleCreate}
              className="flex items-center gap-3 px-6 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 shadow-xl transition-all hover:scale-105"
            >
              <Plus size={22} /> สร้างงานใหม่
            </button>
          </div>
        </div>

        {/* === MODERNIZED: Statistics Cards === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Jobs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">งานทั้งหมด</p>
                <h3 className="text-4xl font-extrabold text-slate-900">{totalJobs}</h3>
                <p className="text-sm text-slate-500 mt-2">ประกาศทั้งหมด</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="text-blue-600 w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">งานที่เปิดอยู่</p>
                <h3 className="text-4xl font-extrabold text-green-600">{activeJobs}</h3>
                <p className="text-sm text-slate-500 mt-2">กำลังรับสมัคร</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <TrendingUp className="text-green-600 w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Total Applicants */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">ผู้สมัครทั้งหมด</p>
                <h3 className="text-4xl font-extrabold text-purple-600">{totalApplicants}</h3>
                <p className="text-sm text-slate-500 mt-2">จากทุกประกาศ</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Users className="text-purple-600 w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* === MODERNIZED: Jobs Table === */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              รายการประกาศงานของคุณ
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
                    สถานะ
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    ผู้สมัคร
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                    โพสต์เมื่อ
                  </th>
                  <th scope="col" className="relative px-6 py-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {jobs.length > 0 ? (
                  jobs.map(job => (
                    <EmployerJobRow
                      key={job.id}
                      job={job}
                      onEdit={handleEdit}
                      onDeleteSuccess={refreshJobs}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-slate-50 rounded-full mb-4">
                          <Briefcase size={48} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">
                          คุณยังไม่มีประกาศงาน
                        </h3>
                        <p className="text-slate-500 mb-6">
                          เริ่มต้นโพสต์งานและค้นหาผู้สมัครที่ใช่สำหรับคุณ
                        </p>
                        <button
                          onClick={handleCreate}
                          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                        >
                          <Plus size={20} /> สร้างงานแรกของคุณ
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* === Modal for Create/Edit Job === */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.data ? "แก้ไขประกาศงาน" : "สร้างประกาศงานใหม่"}
      >
        <JobForm
          onClose={closeModal}
          onSubmit={handleSubmit}
          initialData={modalState.data}
          isSubmitting={isSubmitting}
        />
        {actionError && <div className="alert-danger mt-4">{actionError}</div>}
      </Modal>
    </>
  );
};

export default DashboardPage;
