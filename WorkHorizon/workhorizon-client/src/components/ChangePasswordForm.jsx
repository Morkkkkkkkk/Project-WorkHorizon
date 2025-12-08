import React, { useState } from 'react';
import { userApi } from '../api/userApi';

/**
 * Form สำหรับเปลี่ยนรหัสผ่าน
 * @param {object} props
 * @param {Function} props.onClose - ฟังก์ชันปิด Modal
 * @param {Function} props.onSuccess - ฟังก์ชันที่จะเรียกเมื่อสำเร็จ
 */
const ChangePasswordForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. เช็กว่ารหัสใหม่ตรงกัน
    if (formData.newPassword !== formData.confirmPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setIsSubmitting(true);
    try {
      // 2. เรียก API
      await userApi.changePassword(formData.oldPassword, formData.newPassword);
      setSuccess("เปลี่ยนรหัสผ่านสำเร็จ!");
      // 3. ปิด Modal หลังผ่านไป 2 วิ
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {error && <div className="alert-danger">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div>
        <label className="label-text">รหัสผ่านเดิม *</label>
        <input
          type="password"
          name="oldPassword"
          value={formData.oldPassword}
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>
      <div>
        <label className="label-text">รหัสผ่านใหม่ *</label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>
      <div>
        <label className="label-text">ยืนยันรหัสผ่านใหม่ *</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>

      <div className="flex justify-end pt-4 space-x-2 border-t">
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isSubmitting || success}
          className="btn-primary"
        >
          {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;