import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Form สำหรับ "สร้าง" หรือ "แก้ไข" ผู้ใช้ (โดย Admin)
 */
const UserForm = ({ onClose, onSubmit, initialData = null, isSubmitting }) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'JOB_SEEKER',
    password: '',
  });

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        email: initialData.email,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        phone: initialData.phone,
        role: initialData.role,
        password: '',
      });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditMode && !formData.password) {
      const { password, ...dataWithoutPassword } = formData;
      onSubmit(dataWithoutPassword, initialData.id);
    } else {
      onSubmit(formData, initialData?.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            ชื่อจริง <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            placeholder="ชื่อจริง"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            นามสกุล <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            placeholder="นามสกุล"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
          <Mail size={16} className="text-slate-400" />
          อีเมล <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="example@email.com"
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
            <Phone size={16} className="text-slate-400" />
            เบอร์โทร <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="0812345678"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
            <Shield size={16} className="text-slate-400" />
            บทบาท (Role) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
            >
              <option value="JOB_SEEKER">Job Seeker (ผู้หางาน)</option>
              <option value="EMPLOYER">Employer (ผู้ว่าจ้าง)</option>
              <option value="SUPER_ADMIN">Super Admin (ผู้ดูแลระบบ)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
          <Lock size={16} className="text-slate-400" />
          รหัสผ่าน <span className="text-red-500">*</span>
          {isEditMode && <span className="text-xs font-normal text-slate-500 ml-auto">(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</span>}
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required={!isEditMode}
          placeholder={isEditMode ? "••••••••" : "กำหนดรหัสผ่าน"}
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        {!isEditMode && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร
          </p>
        )}
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
          {isSubmitting ? 'กำลังบันทึก...' : (isEditMode ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้')}
        </button>
      </div>
    </form>
  );
};

export default UserForm;