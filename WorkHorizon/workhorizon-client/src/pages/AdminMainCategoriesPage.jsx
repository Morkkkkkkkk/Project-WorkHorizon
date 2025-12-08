import React, { useState } from 'react';
import { useAdminMainCategories } from '../hooks/useAdminMainCategories.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import MainCategoryForm from '../components/MainCategoryForm.jsx';
import { adminApi } from '../api/adminApi.js';
import { Trash, Edit, Layers, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { BACKEND_URL } from '../api/apiClient.js';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const AdminMainCategoriesPage = () => {
  const { categories, isLoading, error, refreshCategories, createCategory, updateCategory, deleteCategory } = useAdminMainCategories();

  const [modalState, setModalState] = useState({ isOpen: false, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const openModal = (data = null) => setModalState({ isOpen: true, data });
  const closeModal = () => {
    setModalState({ isOpen: false, data: null });
    setActionError(null);
  };

  const handleSubmit = async (formData, catId) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      if (catId) {
        // (โหมดแก้ไข)
        // 1. อัปเดตชื่อ (Text)
        const textData = { name: formData.get('name') };
        await updateCategory(catId, textData);

        // 2. ถ้ามีการแนบรูปใหม่ (อัปเดตรูป)
        if (formData.has('image')) {
          const imageFormData = new FormData();
          imageFormData.append('image', formData.get('image'));
          // (เรียก API อัปเดตรูป)
          await adminApi.mainCategory.updateImage(catId, imageFormData);
        }
        await refreshCategories();
        toast.success("อัปเดตหมวดหมู่สำเร็จ");

      } else {
        // (โหมดสร้างใหม่)
        await createCategory(formData);
        toast.success("สร้างหมวดหมู่สำเร็จ");
      }
      closeModal();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || "เกิดข้อผิดพลาด");
      toast.error("เกิดข้อผิดพลาด: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (catId, catName) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบหมวดหมู่?',
      html: `หากต้องการลบหมวดหมู่ <b>"${catName}"</b> <br/>ให้พิมพ์คำว่า <b>"DELETE"</b> เพื่อยืนยัน`,
      input: 'text',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบหมวดหมู่',
      cancelButtonText: 'ยกเลิก',
      preConfirm: (value) => {
        if (value !== 'DELETE') {
          Swal.showValidationMessage('กรุณาพิมพ์คำว่า "DELETE" ให้ถูกต้อง')
        }
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteCategory(catId);
        Swal.fire(
          'ลบสำเร็จ!',
          'หมวดหมู่ถูกลบเรียบร้อยแล้ว',
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

  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  if (isLoading) {
    return <LoadingSpinner text="กำลังโหลดหมวดหมู่หลัก..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="text-blue-600" size={28} />
            จัดการหมวดหมู่หลัก (Home)
          </h1>
          <p className="text-slate-500 mt-1">จัดการหมวดหมู่หลักที่แสดงบนหน้าแรก</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refreshCategories()}
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
            <span>สร้างหมวดหมู่ใหม่</span>
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{error}</div>}

      {/* Grid Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group">
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              {cat.imageUrl ? (
                <img
                  src={getImageUrl(cat.imageUrl)}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon size={48} className="opacity-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4 gap-2">
                <button
                  onClick={() => openModal(cat)}
                  className="p-2 bg-white/90 text-blue-600 rounded-lg hover:bg-white transition-colors shadow-lg backdrop-blur-sm"
                  title="แก้ไข"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-2 bg-white/90 text-red-600 rounded-lg hover:bg-white transition-colors shadow-lg backdrop-blur-sm"
                  title="ลบ"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
              <p className="text-xs text-slate-400 mt-1">ID: {cat.id}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.data ? "แก้ไขหมวดหมู่หลัก" : "สร้างหมวดหมู่หลัก"}
      >
        <MainCategoryForm
          onClose={closeModal}
          onSubmit={(formData) => handleSubmit(formData, modalState.data?.id)}
          initialData={modalState.data}
          isSubmitting={isSubmitting}
        />
        {actionError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mt-4 text-sm">{actionError}</div>}
      </Modal>
    </div>
  );
};

export default AdminMainCategoriesPage;