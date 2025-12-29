import React, { useState, useEffect } from 'react';
import SearchableCombobox from './SearchableCombobox';
import { masterDataApi } from '../api/masterDataApi';
import { Save, X } from 'lucide-react'; // อย่าลืม import icons

const MasterDataForm = ({ initialData, type, onSubmit, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    province: null, // สำหรับ districts เท่านั้น
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        province: initialData.province || null,
      });
    } else {
      setFormData({ name: '', province: null });
    }
  }, [initialData, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // จัดเตรียม Payload
    const payload = { name: formData.name };
    if (type === 'districts' && formData.province) {
      payload.provinceId = formData.province.id;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* กรณีเป็น Districts ต้องเลือกจังหวัดก่อน */}
      {type === 'districts' && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            จังหวัด <span className="text-red-500">*</span>
          </label>
          <SearchableCombobox
            placeholder="ค้นหาและเลือกจังหวัด..."
            fetchFunction={masterDataApi.getProvinces}
            value={formData.province}
            onChange={(val) => setFormData({ ...formData, province: val })}
            allowCreate={false}
          />
          <p className="text-xs text-slate-500">เลือกจังหวัดที่อำเภอนี้สังกัดอยู่</p>
        </div>
      )}

      {/* ช่องกรอกชื่อ */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          ชื่อข้อมูล <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="block w-full px-4 py-3 rounded-xl border border-slate-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 placeholder-slate-400"
          placeholder={`ตัวอย่าง: ${type === 'jobTypes' ? 'Programmer' : type === 'skills' ? 'React.js' : 'ชื่อข้อมูล...'}`}
          required
          autoFocus
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center px-4 py-2.5 border border-slate-300 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-all"
          disabled={isLoading}
        >
          <X size={18} className="mr-2" />
          ยกเลิก
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm shadow-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              บันทึกข้อมูล
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MasterDataForm;
