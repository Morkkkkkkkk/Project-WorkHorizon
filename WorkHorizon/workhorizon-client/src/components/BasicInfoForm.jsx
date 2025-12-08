import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { User, Phone, FileText, Save, X } from 'lucide-react';

/**
 * Form สำหรับ "แก้ไข" ข้อมูลส่วนตัว
 * @param {object} props
 * @param {Function} props.onClose - ฟังก์ชันปิด Modal
 * @param {Function} props.onSuccess - ฟังก์ชันที่จะเรียกเมื่อสำเร็จ (เพื่อ Refresh)
 * @param {object} props.initialData - (ข้อมูลเดิมของผู้ใช้)
 */
const BasicInfoForm = ({ onClose, onSuccess, initialData }) => {
  // 1. State ของ Form (ข้อมูลพื้นฐาน)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    profileImageUrl: '', // (เราจะทำ Upload รูปทีหลัง)
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 2. (Effect) กรอกข้อมูลเดิมลง Form
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        phone: initialData.phone || '',
        bio: initialData.bio || '',
        profileImageUrl: initialData.profileImageUrl || '',
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
      // 4.1 เรียก API updateProfile
      await userApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        profileImageUrl: formData.profileImageUrl, // (ส่ง URL เดิมไปก่อน)
      });

      // 4.2 สำเร็จ
      onSuccess(); // (บอกให้ ProfilePage refresh)
      onClose(); // (ปิด Modal)

    } catch (err) {
      setError(err.response?.data?.error || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">ชื่อจริง *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
              placeholder="ชื่อจริง"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">นามสกุล *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-slate-400" />
            </div>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
              placeholder="นามสกุล"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">เบอร์โทรศัพท์ *</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone size={18} className="text-slate-400" />
          </div>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400"
            placeholder="08x-xxx-xxxx"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">Bio (คำอธิบายตัวตน)</label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <FileText size={18} className="text-slate-400" />
          </div>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-800 placeholder:text-slate-400 resize-none"
            placeholder="เขียนแนะนำตัวเองสั้นๆ..."
          />
        </div>
      </div>

      {/* Buttons */}
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
              <Save size={18} /> บันทึกการแก้ไข
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default BasicInfoForm;
