import React, { useState, useEffect } from 'react';
import { AVAILABLE_ICONS } from '../constants/categoryIcons';
import { toast } from 'react-toastify';

const MasterDataForm = ({ onClose, onSubmit, initialData = null, isSubmitting, provinces = [], mainCategories = [], modelName }) => {
  const isEditMode = !!initialData;
  const [name, setName] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [iconCode, setIconCode] = useState(''); // State สำหรับ iconCode
  const [mainCategoryId, setMainCategoryId] = useState('');

  useEffect(() => {
    if (isEditMode) {
      setName(initialData.name || '');

      if (modelName === 'subCategory') {
        setIconCode(initialData.iconCode || '')
        setMainCategoryId(initialData.mainCategoryId || '');
      }

      if (modelName === 'district') {
        setProvinceId(initialData.provinceId || '');
      }
    } else {
      // Reset for 'create' mode
      setName('');
      setProvinceId('');
      setIconCode('');
      setMainCategoryId('');
    }
  }, [initialData, isEditMode, modelName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;


    if (modelName === 'district' && !provinceId) {
      toast.warning('กรุณาเลือกจังหวัด');
      return;
    }

    const payload = modelName === 'district' ? { name, provinceId } : { name };

    if (modelName === 'subCategory') {
      if (!mainCategoryId) {
        toast.warning('กรุณาเลือกหมวดหมู่หลัก (Main Category)');
        return;
      }
      payload.mainCategoryId = mainCategoryId;
      payload.iconCode = iconCode || null;
    }

    onSubmit(payload, initialData?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-text">Name *</label>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="form-input"
        />
      </div>

      {modelName === 'subCategory' && (
        <div>
          <label className="label-text">หมวดหมู่หลัก (Main Category) *</label>
          <select
            value={mainCategoryId}
            onChange={(e) => setMainCategoryId(e.target.value)}
            required
            className="form-input"
          >
            <option value="">-- เลือกหมวดหมู่หลัก --</option>
            {mainCategories.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* 5. (NEW UI) Dropdown เลือก Icon สำหรับ Category */}
      {modelName === 'subCategory' && (
        <div>
          <label className="label-text">Icon Code (สำหรับแสดงผล)</label>
          <select
            value={iconCode}
            onChange={(e) => setIconCode(e.target.value)}
            className="form-input"
          >
            <option value="">-- เลือกไอคอน (ไม่บังคับ) --</option>
            {AVAILABLE_ICONS.map(icon => (
              <option key={icon.code} value={icon.code}>{icon.name}</option>
            ))}
          </select>
        </div>
      )}

      {modelName === 'district' && (
        <div>
          <label className="label-text">Province *</label>
          <select
            value={provinceId}
            onChange={(e) => setProvinceId(e.target.value)}
            required
            className="form-input"
          >
            <option value="">-- เลือกจังหวัด --</option>
            {provinces.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-end pt-4 space-x-2 border-t">
        <button type="button" onClick={onClose} className="btn-secondary">
          ยกเลิก
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </form>
  );
};

export default MasterDataForm;
