import React, { useState } from "react";
import { disputeApi } from "../api/disputeApi";

export default function CreateDisputeModal({ workId, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !description) return alert("กรุณากรอกข้อมูลให้ครบ");

    setLoading(true);
    try {
      await disputeApi.create({ workId, reason, description });
      alert("แจ้งปัญหาเรียบร้อย เจ้าหน้าที่จะรีบตรวจสอบครับ");
      onSuccess(); // Callback เพื่อรีเฟรชหน้าหลัก
      onClose();   // ปิด Modal
    } catch (error) {
      alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-red-600">แจ้งปัญหา / ข้อพิพาท</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">หัวข้อปัญหา</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded p-2"
              required
            >
              <option value="">-- เลือกหัวข้อ --</option>
              <option value="ติดต่อไม่ได้">ติดต่อคู่สัญญาไม่ได้</option>
              <option value="งานไม่ตรงปก">งานไม่ตรงตามที่ตกลง</option>
              <option value="ส่งงานล่าช้า">ส่งงานล่าช้ากว่ากำหนด</option>
              <option value="ไม่จ่ายเงิน">ไม่ได้รับค่าจ้างตามตกลง</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดเพิ่มเติม</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded p-2 h-24 resize-none"
              placeholder="อธิบายปัญหาที่เกิดขึ้นอย่างละเอียด..."
              required
            ></textarea>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "กำลังส่ง..." : "แจ้งปัญหา"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}