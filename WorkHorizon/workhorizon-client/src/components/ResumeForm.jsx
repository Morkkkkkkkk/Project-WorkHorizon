import React, { useState } from 'react';
import { userApi } from '../api/userApi';
import { FileText, Upload, Save, X, AlertCircle } from 'lucide-react';

/**
 * Form สำหรับอัปโหลดเรซูเม่ - Modernized UI
 * @param {object} props
 * @param {Function} props.onClose - ฟังก์ชันปิด Modal
 * @param {Function} props.onSuccess - ฟังก์ชันที่จะเรียกเมื่อสำเร็จ
 */
const ResumeForm = ({ onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // 1. Logic เมื่อเลือกไฟล์
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ตรวจสอบขนาดไฟล์ (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)");
        return;
      }

      // ตรวจสอบนามสกุลไฟล์
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError("รองรับเฉพาะไฟล์ PDF หรือ Word เท่านั้น");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  // 2. Logic การ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("กรุณาเลือกไฟล์เรซูเม่");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      // ✅ FIX: เปลี่ยนชื่อ field จาก 'resume' เป็น 'resumeFile' ให้ตรงกับ Backend middleware
      formData.append('resumeFile', selectedFile);

      await userApi.uploadResume(formData);

      onSuccess();
      onClose();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Error Alert - Modern Style */}
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File Upload Section - Modern Drag & Drop Style */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">เลือกไฟล์เรซูเม่ของคุณ</label>

        <div className="relative">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            id="resume-upload"
          />

          {/* Upload Area - Modern Design */}
          <label
            htmlFor="resume-upload"
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer bg-slate-50"
          >
            <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-4">
              {selectedFile ? (
                <FileText size={32} />
              ) : (
                <Upload size={32} />
              )}
            </div>

            {selectedFile ? (
              <div className="text-center">
                <p className="font-bold text-slate-800 mb-1">{selectedFile.name}</p>
                <p className="text-sm text-slate-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedFile(null);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2 font-medium"
                >
                  เปลี่ยนไฟล์
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="font-bold text-slate-800 mb-1">คลิกเพื่อเลือกไฟล์หรือลากไฟล์มาวาง</p>
                <p className="text-sm text-slate-500">
                  รองรับไฟล์ PDF, DOC, DOCX (สูงสุด 5MB)
                </p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Info Box - เพิ่มคำแนะนำ */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-slate-700">
          <p className="font-bold text-slate-800 mb-1">💡 คำแนะนำ:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>ใช้ไฟล์ PDF เพื่อความเข้ากันได้ที่ดีที่สุด</li>
            <li>ตรวจสอบว่าไฟล์ไม่มีการป้องกันด้วยรหัสผ่าน</li>
            <li>เรซูเม่ควรมีข้อมูลติดต่อและประสบการณ์ที่ชัดเจน</li>
          </ul>
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
          disabled={!selectedFile || isSubmitting}
          className="px-5 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              กำลังอัปโหลด...
            </>
          ) : (
            <>
              <Save size={18} /> อัปโหลดเรซูเม่
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ResumeForm;
