import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { GraduationCap, Book, Building2, Calendar, Save, X } from 'lucide-react';

/**
 * Form สำหรับ "เพิ่ม/แก้ไข" ประวัติการศึกษา - Modernized UI
 * @param {object} props
 * @param {Function} props.onClose - ฟังก์ชันปิด Modal
 * @param {Function} props.onSuccess - ฟังก์ชันที่จะเรียกเมื่อสำเร็จ
 * @param {object} props.initialData - (ข้อมูลเดิม ถ้ามี = แก้ไข, ถ้าไม่มี = เพิ่มใหม่)
 */
const EducationForm = ({ onClose, onSuccess, initialData }) => {
  const isEditMode = Boolean(initialData);

  // 1. State ของ Form
  const [formData, setFormData] = useState({
    institute: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 2. กรอกข้อมูลเดิม (ถ้ามี)
  useEffect(() => {
    if (initialData) {
      setFormData({
        institute: initialData.institute || '',
        degree: initialData.degree || '',
        fieldOfStudy: initialData.fieldOfStudy || '',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
      });
    }
  }, [initialData]);

  // 3. Logic การเปลี่ยนแปลงข้อมูล
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 4. Logic การ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        institute: formData.institute,
        degree: formData.degree,
        fieldOfStudy: formData.fieldOfStudy,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
      };

      if (isEditMode) {
        await userApi.updateEducation(initialData.id, payload);
      } else {
        await userApi.addEducation(payload);
      }

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
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Error Alert - Modern Style */}
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {/* Institute Field - เพิ่ม icon */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">สถาบันการศึกษา *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building2 size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            name="institute"
            value={formData.institute}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
            placeholder="เช่น มหาวิทยาลัยเกษตรศาสตร์, จุฬาลงกรณ์มหาวิทยาลัย"
          />
        </div>
      </div>

      {/* Degree and Field - แบ่งเป็น 2 คอลัมน์ พร้อม icon */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">วุฒิการศึกษา *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GraduationCap size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
              placeholder="เช่น ปริญญาตรี, ปริญญาโท"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">สาขาวิชา *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Book size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
              placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
            />
          </div>
        </div>
      </div>

      {/* Date Range - แบ่งเป็น 2 คอลัมน์ พร้อม icon */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">เริ่มต้น *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-slate-400" />
            </div>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">สำเร็จการศึกษา</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={18} className="text-slate-400" />
            </div>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">เว้นว่างถ้ายังศึกษาอยู่</p>
        </div>
      </div>

      {/* Action Buttons - Modern Style */}
      <div className="flex justify-end pt-4 space-x-3 border-t border-slate-100 mt-6">
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
              <Save size={18} /> {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มการศึกษา'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EducationForm;
