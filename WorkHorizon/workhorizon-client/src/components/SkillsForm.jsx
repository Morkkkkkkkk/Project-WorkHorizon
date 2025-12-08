import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import apiClient from '../api/apiClient'; // (สำหรับดึง Master Data)
import SearchableMultiCombobox from './SearchableMultiCombobox';
import { ShieldCheck, Save, X, Info } from 'lucide-react';

/**
 * Form สำหรับ "แก้ไข" ทักษะ - Modernized UI
 * @param {object} props
 * @param {Function} props.onClose - ฟังก์ชันปิด Modal
 * @param {Function} props.onSuccess - ฟังก์ชันที่จะเรียกเมื่อสำเร็จ (เพื่อ Refresh)
 * @param {Array} props.initialData - (Array ของ Skill objects ที่ผู้ใช้มี)
 */
const SkillsForm = ({ onClose, onSuccess, initialData = [] }) => {
  // 1. State สำหรับทักษะที่ "เลือก" 
  const [selectedSkills, setSelectedSkills] = useState([]);

  // 2. State ของ Form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ตั้งค่าเริ่มต้นจากข้อมูลที่ส่งเข้ามา
  useEffect(() => {
    if (initialData) {
      setSelectedSkills(initialData);
    }
  }, [initialData]);

  // 3. ฟังก์ชันสำหรับดึงทักษะ (ส่งให้ Combobox)
  const fetchSkills = async (query) => {
    try {
      const res = await apiClient.get(`/data/skills?q=${query || ''}`);
      return res.data;
    } catch (err) {
      return [];
    }
  };

  // 4. เมื่อมีการเลือก/เพิ่มทักษะ
  const handleSkillsChange = (newSkills) => {
    setSelectedSkills(newSkills);
  };

  // 5. Logic การ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // เตรียมข้อมูลส่ง Backend (ส่งเฉพาะ Name)
      const payload = selectedSkills.map(s => ({ name: s.name }));

      await userApi.updateSkills(payload);

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 h-[450px] flex flex-col">

      {/* Error Alert - Modern Style */}
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {/* Header Section - เพิ่ม icon และคำอธิบาย */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="p-2 bg-blue-600 text-white rounded-lg">
          <ShieldCheck size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 mb-1">จัดการทักษะของคุณ</h3>
          <p className="text-sm text-slate-600">เลือกทักษะจากรายการ หรือเพิ่มทักษะใหม่ ทักษะเหล่านี้จะปรากฏในโปรไฟล์สาธารณะของคุณ</p>
        </div>
      </div>

      {/* Skills Selector - เพิ่ม label ที่สวยขึ้น */}
      <div className="flex-grow">
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
          <ShieldCheck size={16} className="text-slate-400" />
          ระบุทักษะของคุณ
        </label>

        {/* Combobox Component */}
        <SearchableMultiCombobox
          placeholder="พิมพ์ทักษะ (เช่น Graphic Design, ตัดต่อวิดีโอ, React)..."
          fetchFunction={fetchSkills}
          value={selectedSkills}
          onChange={handleSkillsChange}
        />

        {/* Help Text - ปรับให้ดูโดดเด่นกว่าเดิม */}
        <div className="flex items-start gap-2 mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            💡 คุณสามารถเลือกจากรายการ หรือพิมพ์ทักษะใหม่แล้วกด <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">Enter</kbd> เพื่อเพิ่มได้ทันที
          </p>
        </div>
      </div>

      {/* Action Buttons - Modern Style พร้อม icons */}
      <div className="flex justify-end pt-4 space-x-3 border-t border-slate-100 mt-auto">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 font-medium transition-all flex items-center gap-2"
        >
          <X size={18} /> ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save size={18} /> บันทึกทักษะ
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default SkillsForm;
