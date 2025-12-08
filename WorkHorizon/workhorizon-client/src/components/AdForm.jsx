import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../api/apiClient.js';
import { Image as ImageIcon, Link, Type, CheckCircle, LayoutTemplate } from 'lucide-react';

const AdForm = ({ onClose, onSubmit, initialData = null, isSubmitting }) => {
  const isEditMode = !!initialData;

  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [adImage, setAdImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [adSize, setAdSize] = useState('LARGE_SLIDE');

  useEffect(() => {
    if (isEditMode) {
      setTitle(initialData.title);
      setLinkUrl(initialData.linkUrl || '');
      setIsActive(initialData.isActive);
      setPreview(getImageUrl(initialData.imageUrl));
      setAdSize(initialData.adSize || 'LARGE_SLIDE');
    }
  }, [initialData, isEditMode]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const getImageUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
    return `${BACKEND_URL}${relativeUrl}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('linkUrl', linkUrl);
    formData.append('isActive', String(isActive));
    formData.append('adSize', adSize);

    if (adImage) {
      formData.append('adImage', adImage);
    }

    onSubmit(formData, initialData?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Preview Image */}
      <div className="w-full h-48 bg-slate-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 overflow-hidden relative group">
        {preview ? (
          <img src={preview} alt="Ad Preview" className="h-full w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center text-slate-400">
            <ImageIcon size={32} className="mb-2" />
            <span className="text-sm font-medium">ตัวอย่างรูปภาพ</span>
          </div>
        )}
        <label className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center cursor-pointer transition-all">
          <input
            type="file"
            name="adImage"
            onChange={handleFileChange}
            required={!isEditMode}
            accept="image/*"
            className="hidden"
          />
          <span className="bg-white/90 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            {isEditMode ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปภาพ'}
          </span>
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
            <Type size={16} className="text-slate-400" />
            หัวข้อโฆษณา <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="เช่น โปรโมชั่นพิเศษ..."
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
              <LayoutTemplate size={16} className="text-slate-400" />
              ประเภทโฆษณา <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="adSize"
                value={adSize}
                onChange={(e) => setAdSize(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
              >
                <option value="LARGE_SLIDE">สไลด์ใหญ่ (หน้า Home)</option>
                <option value="SMALL_BANNER">แบนเนอร์เล็ก (ด้านข้าง)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
              <Link size={16} className="text-slate-400" />
              ลิงก์ (URL)
            </label>
            <input
              type="url"
              name="linkUrl"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                name="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
            <span className="ml-3 text-sm font-medium text-slate-700 flex items-center gap-2">
              {isActive ? <span className="text-blue-600 font-bold flex items-center gap-1"><CheckCircle size={14} /> แสดงโฆษณานี้</span> : 'ซ่อนโฆษณา'}
            </span>
          </label>
        </div>
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
          {isSubmitting ? 'กำลังบันทึก...' : (isEditMode ? 'บันทึกการแก้ไข' : 'สร้างโฆษณา')}
        </button>
      </div>
    </form>
  );
};

export default AdForm;