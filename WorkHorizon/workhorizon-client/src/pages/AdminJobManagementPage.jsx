import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAdminJobs } from '../hooks/useAdminJobs.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import JobForm from '../components/JobForm.jsx';
import { Link } from 'react-router-dom';
import { 
  Trash, Edit, Package, RefreshCw, ExternalLink, 
  Search, Filter, ChevronDown, Check, ChevronLeft, ChevronRight,
  Briefcase
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- ✨ COMPONENT: Modern Dropdown (Reusable) ---
const ModernDropdown = ({ label, icon: Icon, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative min-w-[200px]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-200 bg-white
          ${isOpen 
            ? "border-blue-500 ring-2 ring-blue-100 shadow-md" 
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
      >
        <div className="flex items-center gap-2 text-slate-700">
          {Icon && <Icon size={18} className="text-slate-400" />}
          <span className="font-medium text-sm">
            {selectedOption ? selectedOption.label : label}
          </span>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl animate-in fade-in zoom-in-95 duration-100 origin-top-left overflow-hidden">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors
                  ${value === option.value 
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {option.icon && <option.icon size={16} className={value === option.value ? "text-blue-500" : "text-slate-400"} />}
                  <span>{option.label}</span>
                </div>
                {value === option.value && <Check size={16} className="text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminJobManagementPage = () => {
  const {
    data,
    isLoading,
    error,
    refreshJobs,
    deleteJob,
    updateJob,
    handlePageChange
  } = useAdminJobs();

  const [isDeleting, setIsDeleting] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  // --- Filters State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [rowsPerPage, setRowsPerPage] = useState(10); // State for UI only (unless hook supports it)

  // --- 🧠 Filter Logic (Client-side filtering on the current page data) ---
  const filteredJobs = useMemo(() => {
    if (!data?.jobs) return [];
    
    let result = data.jobs;

    // 1. Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(job => 
        job.title?.toLowerCase().includes(q) ||
        job.company?.companyName?.toLowerCase().includes(q)
      );
    }

    // 2. Filter Status
    if (filterStatus !== "ALL") {
      result = result.filter(job => job.status === filterStatus);
    }

    return result;
  }, [data?.jobs, searchQuery, filterStatus]);

  // --- Options for Dropdown ---
  const statusOptions = [
    { value: "ALL", label: "สถานะทั้งหมด", icon: Filter },
    { value: "PUBLISHED", label: "เผยแพร่แล้ว", icon: Check },
    { value: "DRAFT", label: "แบบร่าง", icon: Edit },
    { value: "CLOSED", label: "ปิดรับสมัคร", icon: Package },
  ];

  const openModal = useCallback((job) => {
    const initialData = {
      ...job,
      mainCategory: job.mainCategory,
      subCategory: job.subCategory,
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

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, data: null });
    setActionError(null);
  }, []);

  const handleDelete = useCallback(async (jobId, jobTitle) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบประกาศงาน?',
      html: `หากต้องการลบงาน <b>"${jobTitle}"</b> <br/>ให้พิมพ์คำว่า <b>"DELETE"</b> เพื่อยืนยัน`,
      input: 'text',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบประกาศงาน',
      cancelButtonText: 'ยกเลิก',
      preConfirm: (value) => {
        if (value !== 'DELETE') {
          Swal.showValidationMessage('กรุณาพิมพ์คำว่า "DELETE" ให้ถูกต้อง')
        }
      }
    });

    if (result.isConfirmed) {
      setIsDeleting(jobId);
      try {
        await deleteJob(jobId);
        Swal.fire('ลบสำเร็จ!', 'ประกาศงานถูกลบเรียบร้อยแล้ว', 'success');
      } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด!', 'ลบไม่สำเร็จ: ' + err.message, 'error');
      } finally {
        setIsDeleting(null);
      }
    }
  }, [deleteJob]);

  const handleSubmit = useCallback(async (formData, jobId) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await updateJob(jobId, formData);
      closeModal();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  }, [updateJob, closeModal]);

  if (isLoading && !data?.jobs?.length) {
    return <LoadingSpinner text="กำลังโหลดงานทั้งหมด..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="text-blue-600" size={28} />
            จัดการประกาศงาน
          </h1>
          <p className="text-slate-500 mt-1">ตรวจสอบและแก้ไขประกาศงานทั้งหมดในระบบ</p>
        </div>
        <button
          onClick={() => refreshJobs(data.currentPage)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
        >
          <RefreshCw size={18} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{error}</div>}

      {/* Filters Toolbar (New & Beautiful) */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-center z-20 relative">
        {/* Search */}
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="ค้นหาตำแหน่งงาน, บริษัท..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-700"
          />
        </div>

        {/* Dropdown Filter */}
        <div className="w-full lg:w-auto">
            <ModernDropdown 
                label="สถานะ"
                icon={Package}
                value={filterStatus}
                options={statusOptions}
                onChange={setFilterStatus}
            />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden z-10 relative">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ตำแหน่งงาน</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">บริษัท</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">โพสต์เมื่อ</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredJobs.length === 0 ? (
                 <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <Package size={48} className="mx-auto mb-3 opacity-20" />
                    <p>ไม่พบประกาศงานที่ตรงกับเงื่อนไข</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <Link to={`/jobs/${job.id}`} className="font-bold text-slate-800 hover:text-blue-600 transition-colors flex items-center gap-1" target="_blank">
                        {job.title}
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {job.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{job.company?.companyName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                        job.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-100' :
                        job.status === 'DRAFT' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {job.status === 'PUBLISHED' ? 'เผยแพร่' : job.status === 'DRAFT' ? 'แบบร่าง' : job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(job.createdAt).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openModal(job)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="แก้ไข"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id, job.title)}
                        disabled={isDeleting === job.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="ลบ"
                      >
                        {isDeleting === job.id ? '...' : <Trash size={18} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination (Styled like others) */}
        {data.totalPages > 0 && (
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <span className="font-medium bg-slate-100 px-2 py-1 rounded-md text-slate-700">
                        หน้า {data.currentPage} จาก {data.totalPages}
                    </span>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span>Rows per page:</span>
                        <div className="relative">
                            <select 
                                value={rowsPerPage} 
                                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                className="appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-1 bg-white hover:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer transition-all"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <button 
                                onClick={() => handlePageChange(data.currentPage - 1)} 
                                disabled={data.currentPage === 1} 
                                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button 
                                onClick={() => handlePageChange(data.currentPage + 1)} 
                                disabled={data.currentPage === data.totalPages} 
                                className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title="แก้ไขประกาศงาน (Admin)"
      >
        <JobForm
          onClose={closeModal}
          onSubmit={handleSubmit}
          initialData={modalState.data}
          isSubmitting={isSubmitting}
        />
        {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mt-4 text-sm">{actionError}</div>}
      </Modal>
    </div>
  );
};

export default AdminJobManagementPage;