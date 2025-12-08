import React, { useState } from 'react';
import { useAdminFeatured } from '../hooks/useAdminFeatured.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import FeaturedForm from '../components/FeaturedForm.jsx';
import { Trash, Edit, Package, Briefcase, LayoutGrid, RefreshCw, Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const AdminFeaturedPage = () => {
  const {
    sections,
    mainCategories,
    isLoading,
    error,
    refreshSections,
    createSection,
    updateSection,
    deleteSection
  } = useAdminFeatured();

  const [modalState, setModalState] = useState({ isOpen: false, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const openModal = (data = null) => {
    // เตรียมข้อมูลเริ่มต้นให้ครบถ้วน (กัน Error)
    const initialData = data ? {
      ...data,
      contentType: data.contentType || 'JOB', // ค่า Default
      mainCategoryId: data.mainCategoryId || ''
    } : null;

    setModalState({ isOpen: true, data: initialData });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, data: null });
    setActionError(null);
  };

  const handleSubmit = async (payload, sectionId) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      if (sectionId) {
        await updateSection(sectionId, payload);
      } else {
        await createSection(payload);
      }
      closeModal();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sectionId, sectionTitle) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ Section?',
      html: `หากต้องการลบ Section <b>"${sectionTitle}"</b> <br/>ให้พิมพ์คำว่า <b>"DELETE"</b> เพื่อยืนยัน`,
      input: 'text',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบ Section',
      cancelButtonText: 'ยกเลิก',
      preConfirm: (value) => {
        if (value !== 'DELETE') {
          Swal.showValidationMessage('กรุณาพิมพ์คำว่า "DELETE" ให้ถูกต้อง')
        }
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteSection(sectionId);
        Swal.fire(
          'ลบสำเร็จ!',
          'Section ถูกลบเรียบร้อยแล้ว',
          'success'
        );
      } catch (err) {
        Swal.fire(
          'เกิดข้อผิดพลาด!',
          'ลบไม่สำเร็จ: ' + (err.response?.data?.error || err.message),
          'error'
        );
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="กำลังโหลด Featured Sections..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutGrid className="text-blue-600" size={28} />
            จัดการ Section หน้า Home
          </h1>
          <p className="text-slate-500 mt-1">กำหนดส่วนแสดงผลพิเศษบนหน้าแรกของเว็บไซต์</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refreshSections()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all"
          >
            <Layers size={18} />
            <span>สร้าง Section ใหม่</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          {error}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ลำดับ</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">หัวข้อ (Title)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ประเภทเนื้อหา</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">หมวดหมู่ที่ดึงข้อมูล</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sections.map(sec => (
                <tr key={sec.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                      {sec.sortOrder}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{sec.title}</td>

                  {/* แสดง Badge ประเภท */}
                  <td className="px-6 py-4">
                    {sec.contentType === 'SERVICE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100">
                        <Package size={14} /> งานบริการ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        <Briefcase size={14} /> ประกาศงาน
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {sec.mainCategory.name}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(sec)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="แก้ไข"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(sec.id, sec.title)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="ลบ"
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.data ? "แก้ไข Section" : "สร้าง Section ใหม่"}
      >
        <FeaturedForm
          onClose={closeModal}
          onSubmit={handleSubmit}
          initialData={modalState.data}
          isSubmitting={isSubmitting}
          mainCategories={mainCategories} // (ส่งหมวดหมู่ไปให้ Form)
        />
        {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mt-4 text-sm">{actionError}</div>}
      </Modal>
    </div>
  );
};

export default AdminFeaturedPage;