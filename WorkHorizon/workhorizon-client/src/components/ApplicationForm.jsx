import React, { useState } from 'react';
import { applicationApi } from '../api/applicationApi';

/**
 * Form สำหรับส่งใบสมัครงาน
 * @param {object} props
 * @param {string} props.jobId - ID ของงานที่กำลังสมัคร
 * @param {Array} props.resumes - รายการเรซูเม่ของผู้ใช้
 * @param {Function} props.onClose - ฟังก์ชันสำหรับปิด Modal
 * @param {Function} props.onSuccess - ฟังก์ชันที่จะเรียกเมื่อสมัครสำเร็จ
 */
const ApplicationForm = ({ jobId, resumes = [], onClose, onSuccess }) => {
  // 1. State ของ Form
  const [formData, setFormData] = useState({
    // (เลือกเรซูเม่ตัวแรกเป็นค่าเริ่มต้น)
    resumeId: resumes.length > 0 ? resumes[0].id : '', 
    coverLetter: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 2. Logic การเปลี่ยนข้อมูล
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Logic การ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resumeId) {
      setError("กรุณาเลือกเรซูเม่ที่จะใช้สมัคร");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 3.1 เรียก API
      await applicationApi.submitApplication({
        jobId: jobId,
        resumeId: formData.resumeId,
        coverLetter: formData.coverLetter,
      });
      
      // 3.2 สำเร็จ
      onSuccess(); // (บอกให้ JobDetailPage รู้ว่าสมัครแล้ว)
      onClose(); // (ปิด Modal)

    } catch (err) {
      setError(err.response?.data?.error || "สมัครงานล้มเหลว (คุณอาจสมัครงานนี้ไปแล้ว)");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. (Case พิเศษ) ถ้าผู้ใช้ไม่มีเรซูเม่
  if (resumes.length === 0) {
    return (
      <div className="text-center">
        <p className="text-red-600 font-semibold">คุณยังไม่มีเรซูเม่</p>
        <p className="text-gray-700 mt-2">
          กรุณาไปที่หน้า <a href="/profile" className="text-blue-600 underline">โปรไฟล์</a> 
          เพื่ออัปโหลดเรซูเม่ก่อนสมัครงาน
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          ปิด
        </button>
      </div>
    );
  }

  // 5. UI (Form หลัก)
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">เลือกเรซูเม่ *</label>
        <select
          name="resumeId"
          value={formData.resumeId}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
        >
          {resumes.map(resume => (
            <option key={resume.id} value={resume.id}>
              {resume.filename}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          จดหมายปะหน้า (Cover Letter) (ไม่บังคับ)
        </label>
        <textarea
          name="coverLetter"
          rows={4}
          value={formData.coverLetter}
          onChange={handleChange}
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
          placeholder="เขียนแนะนำตัวสั้นๆ..."
        />
      </div>

      {/* 6. ปุ่ม Submit */}
      <div className="flex justify-end pt-4 space-x-2 border-t mt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'กำลังสมัคร...' : 'ยืนยันการสมัคร'}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
