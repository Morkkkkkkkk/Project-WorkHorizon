import React, { useState } from 'react';
import { useAdminAds } from '../hooks/useAdminAds.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Modal from '../components/Modal.jsx';
import AdForm from '../components/AdForm.jsx';
import { adminApi } from '../api/adminApi.js';
import { Trash, Edit, Megaphone, RefreshCw, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { BACKEND_URL } from '../api/apiClient.js';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const AdminAdsPage = () => {
  const { ads, isLoading, error, refreshAds, createAd, updateAd, deleteAd } = useAdminAds();

  const [modalState, setModalState] = useState({ isOpen: false, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const openModal = (data = null) => setModalState({ isOpen: true, data });
  const closeModal = () => {
    setModalState({ isOpen: false, data: null });
    setActionError(null);
  };

  const handleSubmit = async (formData, adId) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      if (adId) {
        const textData = {
          title: formData.get('title'),
          linkUrl: formData.get('linkUrl'),
          isActive: formData.get('isActive') === 'true',
          adSize: formData.get('adSize'),
        };
        await updateAd(adId, textData);

        if (formData.has('adImage')) {
          const imageFormData = new FormData();
          imageFormData.append('adImage', formData.get('adImage'));
          await adminApi.updateAdImage(adId, imageFormData);
        }
        await refreshAds();

      } else {
        await createAd(formData);
      }
      closeModal();
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (adId, adTitle) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบโฆษณา?',
      html: `หากต้องการลบโฆษณา <b>"${adTitle}"</b> <br/>ให้พิมพ์คำว่า <b>"DELETE"</b> เพื่อยืนยัน`,
      input: 'text',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบโฆษณา',
      cancelButtonText: 'ยกเลิก',
      preConfirm: (value) => {
        if (value !== 'DELETE') {
          Swal.showValidationMessage('กรุณาพิมพ์คำว่า "DELETE" ให้ถูกต้อง')
        }
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteAd(adId);
        Swal.fire(
          'ลบสำเร็จ!',
          'โฆษณาถูกลบเรียบร้อยแล้ว',
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
    return <LoadingSpinner text="กำลังโหลดโฆษณา..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="text-blue-600" size={28} />
            จัดการโฆษณา
          </h1>
          <p className="text-slate-500 mt-1">จัดการแบนเนอร์และโฆษณาประชาสัมพันธ์ในระบบ</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refreshAds()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all"
          >
            <Megaphone size={18} />
            <span>สร้างโฆษณาใหม่</span>
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
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">รูปภาพ</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">รายละเอียด</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ประเภท</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {ads.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <ImageIcon size={48} className="mx-auto mb-3 opacity-20" />
                    <p>ยังไม่มีโฆษณาในระบบ</p>
                  </td>
                </tr>
              ) : (
                ads.map(ad => (
                  <tr key={ad.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="w-32 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={getImageUrl(ad.imageUrl)}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 mb-1">{ad.title}</div>
                      {ad.linkUrl && (
                        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          {ad.linkUrl}
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {ad.adSize === 'LARGE_SLIDE' ? 'สไลด์ใหญ่' : 'แบนเนอร์เล็ก'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${ad.isActive
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                        {ad.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openModal(ad)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="แก้ไข"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id, ad.title)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="ลบ"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.data ? "แก้ไขโฆษณา" : "สร้างโฆษณาใหม่"}
      >
        <AdForm
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

export default AdminAdsPage;