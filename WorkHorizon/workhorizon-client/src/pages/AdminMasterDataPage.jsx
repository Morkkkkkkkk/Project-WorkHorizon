import React, { useState, useEffect, useMemo } from 'react';
// import AdminLayout from '../layouts/AdminLayout'; // ❌ DELETE THIS IMPORT
import { useAdminMasterData } from '../hooks/useAdminMasterData';
import MasterDataForm from '../components/MasterDataForm';
import Modal from '../components/Modal';
// import Pagination from '../components/Pagination'; // You might need this if not defining locally
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Briefcase, 
  MapPin, 
  Navigation, 
  Award, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  Database,
  AlertCircle,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- Sub-Component: Pagination ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center gap-2 mt-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-white border border-slate-200 disabled:opacity-50"
            >
                Prev
            </button>
            <span className="px-3 py-1 text-slate-600">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-white border border-slate-200 disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
};

const AdminMasterDataPage = () => {
  // Config for Tabs
  const [activeTab, setActiveTab] = useState('jobTypes'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Hook
  const {
    data, 
    isLoading,
    error,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
  } = useAdminMasterData(); 

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Map Tab ID to API Model Name (Singular)
  const tabToModelMap = {
    jobTypes: 'jobType',
    skills: 'skill',
    provinces: 'province',
    districts: 'district',
    subCategories: 'subCategory', // Added based on your config
    industries: 'industry'        // Added based on your config
  };

  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
  }, [activeTab]);

  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id, name) => {
    const result = await Swal.fire({
        title: 'ยืนยันการลบ?',
        text: `คุณต้องการลบ "${name}" หรือไม่?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'ลบ',
        cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      const modelName = tabToModelMap[activeTab]; 
      try {
          await deleteItem(modelName, id);
          Swal.fire('ลบสำเร็จ!', 'ข้อมูลถูกลบแล้ว', 'success');
      } catch (err) {
          Swal.fire('เกิดข้อผิดพลาด', err.message, 'error');
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    const modelName = tabToModelMap[activeTab];
    let success = false;
    
    try {
        if (modalMode === 'create') {
        success = await createItem(modelName, formData);
        } else {
        success = await updateItem(modelName, selectedItem.id, formData);
        }

        if (success) {
        setIsModalOpen(false);
        Swal.fire('บันทึกสำเร็จ', '', 'success');
        }
    } catch (err) {
        // Error handling is usually done inside the hook or api call, 
        // but if it propagates here:
        console.error(err);
    }
  };

  // ✅ 3. Correctly access data array
  // Ensure we check if data exists and access the correct key
  const currentList = (data && data[activeTab]) ? data[activeTab] : [];

  // ✅ 4. Filter safely
  const filteredData = Array.isArray(currentList) 
    ? currentList.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Pagination Logic
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const tabs = [
    { id: 'jobTypes', label: 'ประเภทงาน', icon: Briefcase, color: 'text-blue-600' },
    { id: 'subCategories', label: 'สายงานย่อย', icon: Layers, color: 'text-indigo-600' }, // New
    { id: 'skills', label: 'ทักษะ', icon: Award, color: 'text-purple-600' },
    { id: 'industries', label: 'อุตสาหกรรม', icon: Database, color: 'text-amber-600' }, // New
    { id: 'provinces', label: 'จังหวัด', icon: MapPin, color: 'text-green-600' },
    { id: 'districts', label: 'อำเภอ/เขต', icon: Navigation, color: 'text-orange-600' },
  ];

  if (error) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100 m-6">
        <AlertCircle className="mx-auto w-12 h-12 mb-4" />
        <h3 className="text-lg font-bold">เกิดข้อผิดพลาด</h3>
        <p>{error}</p>
        <button onClick={() => fetchData()} className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg">
            ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  // ❌ REMOVED <AdminLayout> wrapper here because App.jsx handles it via Outlet
  return (
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Database className="text-blue-600" />
                    จัดการข้อมูลหลัก (Master Data)
                </h1>
                <p className="text-slate-500">จัดการข้อมูลพื้นฐานของระบบ</p>
            </div>
        </div>

        {/* --- 1. Tab Navigation --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : tab.color} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- 2. Action Bar (Search & Add) --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search Input */}
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder={`ค้นหา${tabs.find(t => t.id === activeTab)?.label}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={handleCreateClick}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200 font-medium"
          >
            <Plus size={20} />
            <span>เพิ่มข้อมูลใหม่</span>
          </button>
        </div>

        {/* --- 3. Data Table --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex justify-center items-center">
              <LoadingSpinner />
            </div>
          ) : paginatedData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ลำดับ</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-full">ชื่อข้อมูล</th>
                    {/* แสดงคอลัมน์จังหวัด เฉพาะเมื่ออยู่ที่ Tab Districts */}
                    {activeTab === 'districts' && (
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">จังหวัด</th>
                    )}
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {paginatedData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                          {item.name}
                        </div>
                      </td>
                      {activeTab === 'districts' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                {item.province?.name || '-'}
                             </span>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditClick(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="แก้ไข">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteClick(item.id, item.name)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="ลบ">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // --- Empty State ---
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Database className="text-slate-300" size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">ไม่พบข้อมูล</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                ยังไม่มีข้อมูลในหมวดหมู่นี้ หรือข้อมูลที่คุณค้นหาไม่ตรงกับรายการใดๆ
              </p>
              <button onClick={handleCreateClick} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
                <Plus size={16} className="mr-2" /> เพิ่มข้อมูลแรก
              </button>
            </div>
          )}
        </div>

        {/* --- 4. Pagination --- */}
        {!isLoading && totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}

        {/* --- 5. Modal --- */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'create' ? `เพิ่มข้อมูลใหม่` : `แก้ไขข้อมูล`}
        >
          <MasterDataForm
            initialData={selectedItem}
            type={activeTab} // ส่ง tab ปัจจุบัน (พหูพจน์) ไปให้ Form
            onSubmit={handleFormSubmit}
            onClose={() => setIsModalOpen(false)}
            isLoading={isLoading}
            // Pass necessary props for dropdowns inside form
            provinces={data?.provinces || []}
            mainCategories={data?.mainCategories || []}
          />
        </Modal>
      </div>
  );
};

export default AdminMasterDataPage;