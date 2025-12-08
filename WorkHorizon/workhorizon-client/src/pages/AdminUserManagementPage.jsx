import React, { useState, useMemo, useRef, useEffect } from "react";
import { useAdminUsers } from "../hooks/useAdminUsers.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Modal from "../components/Modal.jsx";
import UserForm from "../components/UserForm.jsx";
import { BACKEND_URL } from "../api/apiClient.js";
import { 
  Trash2, Pencil, UserPlus, Users, Search, Filter, 
  ChevronLeft, ChevronRight, CheckSquare, Square, 
  ChevronDown, Check, Briefcase, User
} from "lucide-react";
import Swal from 'sweetalert2';

// --- ✨ COMPONENT: Modern Dropdown (สวยกว่า <select> ปกติ) ---
const ModernDropdown = ({ label, icon: Icon, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ปิด Dropdown เมื่อคลิกข้างนอก
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
      {/* Button Trigger */}
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
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* Dropdown Menu */}
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

// --- MAIN PAGE ---
const AdminUserManagementPage = () => {
  const {
    users,
    isLoading,
    error,
    deleteUser,
    createUser,
    updateUser,
  } = useAdminUsers();

  const [isDeleting, setIsDeleting] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterVerification, setFilterVerification] = useState("ALL");

  // Pagination & Selection
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  // --- Logic: Filtering ---
  const filteredUsers = useMemo(() => {
    let result = users;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(user =>
        user.firstName?.toLowerCase().includes(q) ||
        user.lastName?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q)
      );
    }

    if (filterRole !== "ALL") {
      result = result.filter((user) => user.role === filterRole);
    }

    if (filterVerification !== "ALL") {
      if (filterVerification === "VERIFIED") {
        result = result.filter(user => user.role === "EMPLOYER" && user.company?.isVerified);
      } else if (filterVerification === "PENDING") {
        result = result.filter(user => user.role === "EMPLOYER" && !user.company?.isVerified);
      } else if (filterVerification === "NO_PROFILE") {
        result = result.filter(user => user.role === "EMPLOYER" && !user.company);
      }
    }

    return result;
  }, [users, searchQuery, filterRole, filterVerification]);

  // --- Logic: Pagination ---
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterVerification, rowsPerPage]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const ids = paginatedUsers.map(u => u.id);
      setSelectedIds(ids);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- CRUD Handlers ---
  const handleDelete = async (userId, email) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบผู้ใช้?',
      html: `หากต้องการลบผู้ใช้ <b>${email}</b> <br/>ให้พิมพ์คำว่า <b>"DELETE"</b> เพื่อยืนยัน`,
      input: 'text',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบผู้ใช้',
      cancelButtonText: 'ยกเลิก',
      preConfirm: (value) => {
        if (value !== 'DELETE') {
          Swal.showValidationMessage('กรุณาพิมพ์คำว่า "DELETE" ให้ถูกต้อง')
        }
      }
    });

    if (result.isConfirmed) {
      setIsDeleting(userId);
      try {
        await deleteUser(userId);
        Swal.fire('ลบสำเร็จ!', 'ผู้ใช้ถูกลบเรียบร้อยแล้ว', 'success');
        setSelectedIds(prev => prev.filter(id => id !== userId));
      } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด!', 'ลบไม่สำเร็จ: ' + err.message, 'error');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const openModal = (data = null) => setModalState({ isOpen: true, data });
  const closeModal = () => {
    setModalState({ isOpen: false, data: null });
    setActionError(null);
  };

  const handleSubmit = async (formData, userId) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      if (userId) await updateUser(userId, formData);
      else await createUser(formData);
      closeModal();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith("http")) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  // --- 📝 Option Configs for Modern Dropdown ---
  const roleOptions = [
    { value: "ALL", label: "ทุกบทบาท" },
    { value: "JOB_SEEKER", label: "ผู้หางาน", icon: User },
    { value: "EMPLOYER", label: "ผู้ประกอบการ", icon: Briefcase },
    { value: "FREELANCER", label: "ฟรีแลนซ์", icon: Users },
    { value: "SUPER_ADMIN", label: "แอดมิน", icon: CheckSquare },
  ];

  const verificationOptions = [
    { value: "ALL", label: "สถานะทั้งหมด" },
    { value: "VERIFIED", label: "บริษัท: อนุมัติแล้ว" },
    { value: "PENDING", label: "บริษัท: รออนุมัติ" },
    { value: "NO_PROFILE", label: "บริษัท: ไม่มีข้อมูล" },
  ];

  if (isLoading) return <LoadingSpinner text="กำลังโหลดข้อมูลผู้ใช้..." />;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-blue-600" size={28} />
            จัดการผู้ใช้งาน
          </h1>
          <p className="text-slate-500 mt-1">ดูและจัดการบัญชีผู้ใช้ทั้งหมดในระบบ</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all"
        >
          <UserPlus size={18} />
          <span>สร้างผู้ใช้ใหม่</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-center z-20 relative">
        {/* Search */}
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ อีเมล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-700"
          />
        </div>

        {/* ✨ Modern Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
           <ModernDropdown 
              label="บทบาท"
              icon={Users}
              value={filterRole}
              options={roleOptions}
              onChange={setFilterRole}
           />
           <ModernDropdown 
              label="การยืนยัน"
              icon={CheckSquare}
              value={filterVerification}
              options={verificationOptions}
              onChange={setFilterVerification}
           />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden z-10 relative">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-4 py-4 w-12 text-center">
                    <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        onChange={handleSelectAll}
                        checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.includes(u.id))}
                    />
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ผู้ใช้</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">บทบาท</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">สถานะการยืนยัน</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <Users size={48} className="mx-auto mb-3 opacity-20" />
                    <p>ไม่พบผู้ใช้งานที่ตรงกับเงื่อนไข</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const profileImageUrl = getImageUrl(user.profileImageUrl) ||
                    `https://placehold.co/100x100/E0E0E0/777?text=${user.firstName?.charAt(0) || "?"}`;
                  const isSelected = selectedIds.includes(user.id);

                  return (
                    <tr key={user.id} className={`transition-colors group ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/80'}`}>
                      <td className="px-4 py-4 text-center">
                        <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(user.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={profileImageUrl}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${user.role === "SUPER_ADMIN" ? "bg-red-50 text-red-700 border-red-100" : user.role === "EMPLOYER" ? "bg-blue-50 text-blue-700 border-blue-100" : user.role === "FREELANCER" ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-green-50 text-green-700 border-green-100"}`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {user.role === "EMPLOYER" ? (
                          user.company ? (
                            user.company.isVerified ? (
                              <span className="text-green-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> อนุมัติแล้ว
                              </span>
                            ) : (
                              <span className="text-yellow-600 font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span> รออนุมัติ
                              </span>
                            )
                          ) : <span className="text-slate-400 italic">ยังไม่สร้างโปรไฟล์</span>
                        ) : <span className="text-slate-300">-</span>}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        {user.role !== "SUPER_ADMIN" && (
                          <>
                            <button onClick={() => openModal(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="แก้ไขผู้ใช้"><Pencil size={18} /></button>
                            <button onClick={() => handleDelete(user.id, user.email)} disabled={isDeleting === user.id} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="ลบผู้ใช้">{isDeleting === user.id ? "..." : <Trash2 size={18} />}</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
                <span className="font-medium bg-slate-100 px-2 py-1 rounded-md text-slate-700">
                    {selectedIds.length} of {filteredUsers.length} selected
                </span>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    {/* ใช้ Native Select แต่แต่งให้เรียบขึ้นสำหรับจุดเล็กๆ */}
                    <div className="relative">
                        <select 
                            value={rowsPerPage} 
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            className="appearance-none border border-slate-200 rounded-lg pl-3 pr-8 py-1 bg-white hover:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer transition-all"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span>{currentPage} of {totalPages || 1}</span>
                    <div className="flex gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16} /></button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.data ? "แก้ไขข้อมูลผู้ใช้" : "สร้างผู้ใช้ใหม่"}
      >
        <UserForm
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

export default AdminUserManagementPage;