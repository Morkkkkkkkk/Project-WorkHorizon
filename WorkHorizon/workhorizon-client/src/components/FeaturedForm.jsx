import React, { useState, useEffect } from 'react';
import { Type, Layers, ListOrdered, Briefcase, Wrench } from 'lucide-react';
import { toast } from 'react-toastify';

const FeaturedForm = ({ onClose, onSubmit, initialData = null, isSubmitting, mainCategories = [] }) => {
  const isEditMode = !!initialData;
  const [title, setTitle] = useState('');
  const [mainCategoryId, setMainCategoryId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [contentType, setContentType] = useState('JOB');

  useEffect(() => {
    if (isEditMode) {
      setTitle(initialData.title || '');
      setMainCategoryId(initialData.mainCategoryId || '');
      setSortOrder(initialData.sortOrder || 0);
      setContentType(initialData.contentType || 'JOB');
    } else {
      setTitle('');
      setMainCategoryId('');
      setSortOrder(0);
    }
  }, [initialData, isEditMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !mainCategoryId) {
      toast.warning("กรุณากรอกหัวข้อ และ เลือกหมวดหมู่หลัก");
      return;
    }

    const payload = { title, mainCategoryId, sortOrder: Number(sortOrder), contentType };
    onSubmit(payload, initialData?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
          <Type size={16} className="text-slate-400" />
          หัวข้อที่จะแสดง (Title) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          placeholder="เช่น งานยอดนิยม..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
            <Layers size={16} className="text-slate-400" />
            ประเภทเนื้อหา <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="JOB">งานประกาศ (Jobs)</option>
              <option value="SERVICE">งานบริการ (Services)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              {contentType === 'JOB' ? <Briefcase size={16} /> : <Wrench size={16} />}
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
            <ListOrdered size={16} className="text-slate-400" />
            ลำดับ (Sort Order)
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
          <Layers size={16} className="text-slate-400" />
          หมวดหมู่หลัก <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={mainCategoryId}
            onChange={(e) => setMainCategoryId(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
          >
            <option value="">-- เลือกหมวดหมู่ --</option>
            {mainCategories.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
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
          {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </form>
  );
};

export default FeaturedForm;