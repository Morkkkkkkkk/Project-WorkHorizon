import React, { useState, useMemo } from 'react';
import { useAdminMasterData } from '../hooks/useAdminMasterData.js'; // Assumed existing hook
import LoadingSpinner from '../components/LoadingSpinner.jsx'; // Assumed existing component
import Modal from '../components/Modal.jsx'; // Assumed existing component
import MasterDataForm from '../components/MasterDataForm.jsx'; // Assumed existing component
import { 
  Trash2, Edit2, Database, Plus, Search, MapPin, 
  Briefcase, Layers, Award, ChevronLeft, ChevronRight, 
  Filter, ArrowUpDown, MoreHorizontal 
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- Sub-Component: Pagination Controls ---
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-white">
      <div className="text-sm text-slate-500">
        แสดง {((currentPage - 1) * itemsPerPage) + 1} ถึง {Math.min(currentPage * itemsPerPage, totalItems)} จาก {totalItems} รายการ
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-slate-700">
          หน้า {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

// --- Sub-Component: Data Table View ---
const DataTableView = ({ title, modelName, data, onEdit, onDelete, icon: Icon, colorClass }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(null);
  const itemsPerPage = 10;

  // Reset page when switching models or searching
  React.useEffect(() => {
    setCurrentPage(1);
  }, [modelName, searchTerm]);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      html: `คุณต้องการลบ <b>"${name}"</b> ใช่หรือไม่?<br/><span class="text-sm text-gray-500">การกระทำนี้ไม่สามารถย้อนกลับได้</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก',
      focusCancel: true
    });

    if (result.isConfirmed) {
      setIsDeleting(id);
      try {
        await onDelete(modelName, id);
        Swal.fire({
          icon: 'success',
          title: 'ลบสำเร็จ',
          text: 'ข้อมูลถูกลบเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.error || err.message, 'error');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Filter & Pagination Logic
  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-fade-in">
      {/* Header Toolbar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${colorClass} bg-opacity-10 ring-1 ring-inset ring-black/5`}>
            <Icon size={22} className={colorClass.split(' ')[1]} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500">จัดการข้อมูลทั้งหมด {data.length} รายการ</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="ค้นหา..."
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => onEdit(modelName, null)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-blue-200 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">เพิ่มข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-slate-50/30">
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <div className="p-4 bg-slate-100 rounded-full mb-3">
              <Search size={32} className="opacity-40" />
            </div>
            <p className="font-medium">ไม่พบข้อมูลที่ค้นหา</p>
            <p className="text-sm mt-1 text-slate-400">ลองใช้คำค้นหาอื่น หรือเพิ่มข้อมูลใหม่</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">
                  #
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:text-slate-700">
                  ชื่อข้อมูล <ArrowUpDown size={12} />
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {currentData.map((item, index) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-blue-50/30 transition-colors duration-150 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                    {((currentPage - 1) * itemsPerPage) + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-700">{item.name}</div>
                    {item.code && <div className="text-xs text-slate-400 mt-0.5">Code: {item.code}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ใช้งาน
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(modelName, item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="แก้ไข"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        disabled={isDeleting === item.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                        title="ลบ"
                      >
                        {isDeleting === item.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Pagination */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

// --- Main Page Component ---
const AdminMasterDataPage = () => {
  const { data, isLoading, error, createItem, updateItem, deleteItem } = useAdminMasterData();
  
  // State
  const [activeTab, setActiveTab] = useState('jobType');
  const [modalState, setModalState] = useState({ isOpen: false, modelName: null, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Configuration for Tabs/Menu
  const masterDataConfig = [
    { id: "jobType", title: "ประเภทงาน", subtitle: "Job Types", icon: Briefcase, color: "text-blue-600 bg-blue-100" },
    { id: "subCategory", title: "สายงานย่อย", subtitle: "Sub Categories", icon: Layers, color: "text-indigo-600 bg-indigo-100" },
    { id: "skill", title: "ทักษะ", subtitle: "Skills", icon: Award, color: "text-emerald-600 bg-emerald-100" },
    { id: "industry", title: "อุตสาหกรรม", subtitle: "Industries", icon: Database, color: "text-amber-600 bg-amber-100" },
    { id: "province", title: "จังหวัด", subtitle: "Provinces", icon: MapPin, color: "text-pink-600 bg-pink-100" },
    { id: "district", title: "อำเภอ/เขต", subtitle: "Districts", icon: MapPin, color: "text-violet-600 bg-violet-100" },
  ];

  const activeConfig = masterDataConfig.find(c => c.id === activeTab);
  const activeData = data ? data[activeTab + (activeTab.endsWith('y') ? 'ies' : 's')] : []; 
  // Note: Handling pluralization 'y' -> 'ies' or adding 's' is a rough heuristic based on your initial code structure.
  // Adjust key access (e.g., data.jobTypes) as per your exact API response structure.
  
  // Helper to get correct data array safely
  const getItems = (key) => {
    if (!data) return [];
    // Map 'subCategory' to 'subCategories', 'skill' to 'skills', etc.
    const pluralMap = {
      subCategory: 'subCategories',
      skill: 'skills',
      jobType: 'jobTypes',
      industry: 'industries',
      province: 'provinces',
      district: 'districts'
    };
    return data[pluralMap[key]] || [];
  };

  const openModal = (modelName, data = null) => setModalState({ isOpen: true, modelName, data });
  const closeModal = () => { setModalState({ isOpen: false, modelName: null, data: null }); setActionError(null); };

  const handleSubmit = async (payload, id) => {
    const { modelName } = modalState;
    setIsSubmitting(true);
    setActionError(null);
    try {
      if (id) await updateItem(modelName, id, payload);
      else await createItem(modelName, payload);
      
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        showConfirmButton: false,
        timer: 1000
      });
      closeModal();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner text="กำลังโหลดฐานข้อมูล..." />;
  if (error) return (
    <div className="min-h-[500px] flex items-center justify-center p-4">
      <div className="text-center max-w-md p-8 bg-red-50 rounded-3xl border border-red-100">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Database size={32} />
        </div>
        <h1 className="text-xl font-bold text-red-800 mb-2">ไม่สามารถโหลดข้อมูลได้</h1>
        <p className="text-red-600 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
              <Database size={24} />
            </div>
            Master Data Management
          </h1>
          <p className="text-slate-500 mt-2 text-lg max-w-2xl">
            จัดการข้อมูลพื้นฐาน (Master Data Management) ทั้งหมดของระบบได้ในที่เดียว เพื่อความเป็นระเบียบและง่ายต่อการใช้งาน
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)] min-h-[600px]">
          
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-72 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">หมวดหมู่ข้อมูล</h3>
            </div>
            <div className="p-2 space-y-1 overflow-y-auto flex-1 custom-scroll">
              {masterDataConfig.map((item) => {
                const isActive = activeTab === item.id;
                const count = getItems(item.id).length;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        isActive ? 'bg-white text-blue-600 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'
                      }`}>
                        <item.icon size={18} />
                      </div>
                      <div className="text-left">
                        <div className={`font-semibold text-sm ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>
                          {item.title}
                        </div>
                        <div className={`text-xs ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isActive ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <DataTableView
              key={activeTab} // Force re-render when tab changes to reset states
              title={activeConfig.title}
              modelName={activeConfig.id}
              items={getItems(activeConfig.id)} // Pass specific items
              data={getItems(activeConfig.id)} // Pass specific items
              onEdit={openModal}
              onDelete={deleteItem}
              icon={activeConfig.icon}
              colorClass={activeConfig.color}
            />
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <Modal 
        isOpen={modalState.isOpen} 
        onClose={closeModal} 
        title={
          <div className="flex items-center gap-2">
            {modalState.data ? <Edit2 size={20} className="text-blue-600"/> : <Plus size={20} className="text-blue-600"/>}
            <span>{modalState.data ? `แก้ไข ${activeConfig?.title}` : `เพิ่ม ${activeConfig?.title} ใหม่`}</span>
          </div>
        }
      >
        <div className="px-1">
          <MasterDataForm
            onClose={closeModal}
            onSubmit={handleSubmit}
            initialData={modalState.data}
            isSubmitting={isSubmitting}
            provinces={data?.provinces || []}
            mainCategories={data?.mainCategories || []}
            modelName={modalState.modelName}
          />
          {actionError && (
            <div className="mx-6 mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-start gap-3">
              <div className="mt-0.5"><Filter size={16} className="rotate-180" /></div>
              <div className="text-sm">{actionError}</div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AdminMasterDataPage;