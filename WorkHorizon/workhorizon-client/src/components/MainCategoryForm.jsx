import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../api/apiClient.js';
import { Image as ImageIcon, Type } from 'lucide-react';

/**
 * Form สำหรับ "สร้าง" หรือ "แก้ไข" หมวดหมู่หลัก (Main Category)
 */
const MainCategoryForm = ({ onClose, onSubmit, initialData = null, isSubmitting }) => {
  const isEditMode = !!initialData;

  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  useEffect(() => {
    if (isEditMode) {
      setName(initialData.name);
      if (initialData.imageUrl) {
        setPreview(getImageUrl(initialData.imageUrl));
      }
    }
  }, [initialData, isEditMode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);

    if (image) {
      formData.append('image', image);
    }

    onSubmit(formData, initialData?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Preview Image */}
      <div className="w-full h-48 bg-slate-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 overflow-hidden relative group">
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            <ImageIcon size={32} className="mb-2" />
            <span className="text-sm font-medium">ตัวอย่างรูปภาพ</span>
          </div>
        )}
        <label className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center cursor-pointer transition-all">
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <span className="bg-white/90 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            {isEditMode ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ'}
          </span>
        </label>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
          <Type size={16} className="text-slate-400" />
          ชื่อหมวดหมู่หลัก <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="เช่น การตลาด, ไอที..."
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="flex justify-end pt-6 space-x-3 border-t border-slate-100 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition-colors"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'กำลังบันทึก...' : (isEditMode ? 'บันทึก' : 'สร้าง')}
        </button>
      </div>
    </form>
  );
};

export default MainCategoryForm;