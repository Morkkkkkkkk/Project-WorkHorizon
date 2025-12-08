import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAdminCompanies } from '../hooks/useAdminCompanies.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { 
    ShieldCheck, ShieldAlert, CheckCircle, XCircle, Building2, 
    Search, Filter, ChevronDown, Check, ChevronLeft, ChevronRight 
} from 'lucide-react';

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

const AdminVerifyPage = () => {
    const { companies, isLoading, error, toggleVerification } = useAdminCompanies();

    // --- State for Filters & Pagination ---
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // --- 🧠 Filter Logic ---
    const filteredCompanies = useMemo(() => {
        let result = companies;

        // 1. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c => 
                c.companyName?.toLowerCase().includes(q) ||
                c.email?.toLowerCase().includes(q) ||
                c.contactPerson?.toLowerCase().includes(q)
            );
        }

        // 2. Filter Status
        if (filterStatus !== "ALL") {
            const isVerified = filterStatus === "VERIFIED";
            result = result.filter(c => c.isVerified === isVerified);
        }

        return result;
    }, [companies, searchQuery, filterStatus]);

    // --- 🧠 Pagination Logic ---
    const totalPages = Math.ceil(filteredCompanies.length / rowsPerPage);
    const paginatedCompanies = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredCompanies.slice(start, start + rowsPerPage);
    }, [filteredCompanies, currentPage, rowsPerPage]);

    // Reset Page on Filter Change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, rowsPerPage]);

    // --- Options for Dropdown ---
    const statusOptions = [
        { value: "ALL", label: "ทั้งหมด", icon: Filter },
        { value: "PENDING", label: "รออนุมัติ", icon: ShieldAlert },
        { value: "VERIFIED", label: "อนุมัติแล้ว", icon: CheckCircle },
    ];

    if (isLoading) {
        return <LoadingSpinner text="กำลังโหลดข้อมูลบริษัท..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="text-blue-600" size={28} />
                        ตรวจสอบและอนุมัติบริษัท
                    </h1>
                    <p className="text-slate-500 mt-1">จัดการสถานะการยืนยันตัวตนของบริษัทต่างๆ ในระบบ</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <ShieldAlert size={16} />
                    <span>รออนุมัติ: {companies.filter(c => !c.isVerified).length} บริษัท</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <ShieldAlert size={20} />
                    {error}
                </div>
            )}

            {/* Filters Toolbar (New & Beautiful) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-center z-20 relative">
                {/* Search */}
                <div className="relative w-full lg:w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อบริษัท, ผู้ติดต่อ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-slate-700"
                    />
                </div>

                {/* Dropdown Filter */}
                <div className="w-full lg:w-auto">
                    <ModernDropdown 
                        label="สถานะ"
                        icon={Filter}
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
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">บริษัท</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ผู้ติดต่อ</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">สถานะ</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {paginatedCompanies.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                        <Building2 size={48} className="mx-auto mb-3 opacity-20" />
                                        <p>ไม่พบข้อมูลบริษัทที่ตรงกับเงื่อนไข</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedCompanies.map(company => (
                                    <tr key={company.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3 border border-blue-200">
                                                    {company.companyName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{company.companyName}</div>
                                                    <div className="text-xs text-slate-500">{company.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700 font-medium">{company.contactPerson || '-'}</div>
                                            <div className="text-xs text-slate-500">{company.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {company.isVerified ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                                                    <CheckCircle size={14} className="fill-green-500 text-white" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                                                    <ShieldAlert size={14} className="fill-yellow-500 text-white" />
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => toggleVerification(company.id, !company.isVerified)}
                                                className={`
                                                    inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm
                                                    ${company.isVerified
                                                        ? 'bg-white text-red-600 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700'
                                                        : 'bg-blue-600 text-white border border-transparent hover:bg-blue-700 hover:shadow-md'
                                                    }
                                                `}
                                            >
                                                {company.isVerified ? (
                                                    <>
                                                        <XCircle size={14} />
                                                        ยกเลิก
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle size={14} />
                                                        อนุมัติ
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination (New) */}
                <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <span className="font-medium bg-slate-100 px-2 py-1 rounded-md text-slate-700">
                           ทั้งหมด {filteredCompanies.length} รายการ
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
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                    disabled={currentPage === 1} 
                                    className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                                    disabled={currentPage === totalPages || totalPages === 0} 
                                    className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVerifyPage;