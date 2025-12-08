import React, { useState, useEffect } from 'react';
import { serviceApi } from '../api/serviceApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Image as ImageIcon, DollarSign, FileText, Tag, Upload, ExternalLink, Briefcase } from 'lucide-react';
import { BACKEND_URL } from '../api/apiClient';
import { useMainCategories } from '../hooks/useMainCategories';
import { toast } from 'react-toastify';

/**
 * FreelancerServicesPage - Modernized UI
 * หน้าจัดการงานบริการของ Freelancer เอง
 */
const FreelancerServicesPage = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // ถ้ามีค่า = โหมดแก้ไข

  const { mainCategories } = useMainCategories();

  // Form State
  const [formData, setFormData] = useState({ title: '', description: '', price: '', mainCategoryId: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // เพิ่มพรีวิวรูป

  const fetchServices = async () => {
    try {
      const data = await serviceApi.getMyServices();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenModal = (service = null) => {
    setEditingService(service);
    if (service) {
      setFormData({
        title: service.title,
        description: service.description,
        price: service.price,
        mainCategoryId: service.mainCategoryId || ''
      });
      // ตั้งค่าพรีวิวจากรูปเดิม
      if (service.coverImage) {
        setImagePreview(getImageUrl(service.coverImage));
      }
    } else {
      setFormData({ title: '', description: '', price: '', mainCategoryId: '' });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // สร้างพรีวิว
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // เช็คว่าเลือกหมวดหมู่หรือยัง?
    if (!formData.mainCategoryId || formData.mainCategoryId === "") {
      toast.warning("กรุณาเลือกหมวดหมู่ก่อนบันทึก");
      return;
    }

    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('price', formData.price);
    fd.append('mainCategoryId', formData.mainCategoryId);
    fd.append('isActive', 'true');

    if (imageFile) fd.append('coverImage', imageFile);

    try {
      if (editingService) {
        await serviceApi.update(editingService.id, fd);
        toast.success('อัปเดตงานบริการเรียบร้อยแล้ว');
      } else {
        await serviceApi.create(fd);
        toast.success('สร้างงานบริการเรียบร้อยแล้ว');
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      toast.error('บันทึกไม่สำเร็จ');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ต้องการลบงานนี้ใช่ไหม?')) return;
    try {
      await serviceApi.delete(id);
      fetchServices();
      toast.success('ลบงานบริการเรียบร้อยแล้ว');
    } catch (err) {
      toast.error('ลบไม่สำเร็จ');
    }
  };

  const getImageUrl = (url) => url ? (url.startsWith('http') ? url : `${BACKEND_URL}${url}`) : null;

  if (isLoading) return <LoadingSpinner text="กำลังโหลดงานของคุณ..." />;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header Section - Premium Style */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 text-white rounded-xl">
                <Briefcase size={28} />
              </div>
              งานบริการของฉัน
            </h1>
            <p className="text-slate-500 ml-14">โพสต์งานที่คุณรับทำ เช่น รับทำการบ้าน, เขียนรายงาน, ออกแบบกราฟิก</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} /> โพสต์งานใหม่
          </button>
        </div>
      </div>

      {/* Services Grid - Modern Cards */}
      {services.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="p-4 bg-slate-200 text-slate-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">ยังไม่มีงานบริการ</h3>
          <p className="text-slate-500 mb-4">เริ่มต้นโพสต์งานแรกของคุณเพื่อให้ลูกค้าสามารถจ้างงานได้</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} /> โพสต์งานใหม่
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
              {/* Image Container - Modern Style */}
              <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-50">
                {service.coverImage ? (
                  <img src={getImageUrl(service.coverImage)} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-300">
                    <ImageIcon size={48} />
                  </div>
                )}
                {/* View Link Overlay */}
                <a
                  href={`/services/${service.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-blue-600 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110"
                  title="ดูหน้าสาธารณะ"
                >
                  <ExternalLink size={18} />
                </a>
              </div>

              {/* Content Body */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 leading-snug">{service.title}</h3>

                {/* Price Badge - Modern Style */}
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-bold text-sm w-fit mb-3">
                  <DollarSign size={16} />
                  ฿{service.price?.toLocaleString() || '0'}
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">{service.description}</p>

                {/* Category Badge */}
                {service.mainCategory && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full w-fit mb-4">
                    <Tag size={12} />
                    {service.mainCategory.name}
                  </div>
                )}

                {/* Action Buttons - Modern Style */}
                <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenModal(service)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 font-bold transition-all"
                  >
                    <Edit size={16} /> แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 font-bold transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form - Modern Style */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? "แก้ไขงานบริการ" : "โพสต์งานใหม่"}>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Service Title */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">ชื่องานบริการ *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                required
                placeholder="เช่น รับทำการบ้านวิชา Math, ออกแบบโลโก้"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          {/* Category & Price - Grid 2 Columns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">หมวดหมู่ *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag size={18} className="text-slate-400" />
                </div>
                <select
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 appearance-none"
                  required
                  value={formData.mainCategoryId}
                  onChange={e => setFormData({ ...formData, mainCategoryId: e.target.value })}
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {mainCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">ราคาเริ่มต้น (บาท) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={18} className="text-slate-400" />
                </div>
                <input
                  type="number"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                  required
                  placeholder="100"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">รายละเอียด *</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText size={18} className="text-slate-400" />
              </div>
              <textarea
                rows={4}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400 resize-none"
                required
                placeholder="อธิบายสิ่งที่คุณทำให้ลูกค้า..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Image Upload with Preview */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">รูปปก (ถ้ามี)</label>

            {imagePreview && (
              <div className="mb-3 relative">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border-2 border-slate-200" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="service-image"
              />
              <label
                htmlFor="service-image"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer text-slate-600 hover:text-blue-600 font-medium"
              >
                <Upload size={18} />
                {imageFile ? imageFile.name : 'คลิกเพื่อเลือกรูปภาพ'}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">
              {editingService ? 'บันทึกการแก้ไข' : 'โพสต์งาน'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FreelancerServicesPage;