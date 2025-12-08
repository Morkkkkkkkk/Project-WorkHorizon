import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // (เพิ่ม)
import { conversationApi } from '../api/conversationApi.js'; // (เพิ่ม)
import { MessageCircle } from 'lucide-react'; // (เพิ่ม)
import { toast } from 'react-toastify';

// (Helper)
const statusConfig = {
  PENDING: { text: "รอดำเนินการ", color: "bg-gray-100 text-gray-800" },
  REVIEWED: { text: "ตรวจสอบแล้ว", color: "bg-blue-100 text-blue-800" },
  SHORTLISTED: { text: "เข้ารอบ", color: "bg-green-100 text-green-800" },
  REJECTED: { text: "ปฏิเสธ", color: "bg-red-100 text-red-800" },
  HIRED: { text: "จ้างแล้ว", color: "bg-purple-100 text-purple-800" }
};

/**
 * @param {object} props
 * @param {object} props.application - ข้อมูลใบสมัคร
 */
const ApplicationStatusRow = ({ application }) => {
  const { job } = application; // (Backend ต้อง include { job: true })
  const statusDisplay = statusConfig[application.status] || statusConfig.PENDING;
  const navigate = useNavigate();

  if (!job) {
    // (ป้องกันกรณี Job ถูกลบไปแล้ว)
    return (
      <tr className="bg-white">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={4}>
          (งานนี้ถูกลบออกจากระบบแล้ว)
        </td>
      </tr>
    );
  }

  // (เพิ่ม) Logic การคลิกปุ่มแชท
  const handleChatClick = async (e) => {
    e.preventDefault(); // (ป้องกัน Link ทำงาน)
    try {
      // 1. (เรียก API เพื่อ "หา" หรือ "สร้าง" ห้องแชท)
      const { data } = await conversationApi.getConversationByApp(application.id);

      // 2. (ไปที่หน้าแชท)
      navigate(`/chat/${data.conversationId}`);
    } catch (err) {
      toast.error("ยังไม่สามารถเริ่มแชทได้: " + (err.response?.data?.error || err.message));
    }
  };

  // (เพิ่ม) เช็กว่าแชทได้หรือยัง
  const canChat = application.status === 'SHORTLISTED' || application.status === 'HIRED';

  return (
    <tr className="bg-white hover:bg-gray-50">

      {/* 1. ชื่องาน/บริษัท (Link ไปยังหน้ารายละเอียดงาน) */}
      <td className="px-6 py-4 whitespace-nowrap">

        {/*  แยก Link ออกจากกันเพื่อป้องกันการซ้อนกันของ <a> tags */}
        <Link to={`/jobs/${job.id}`} className="hover:underline">
          <div className="text-sm font-medium text-gray-900">{job.title}</div>
        </Link>

        {/* Company Link */}
        <Link
          to={`/company/${job.company.id}`}
          className="text-sm text-gray-500 hover:underline"
        >
          {job.company.companyName}
        </Link>
      </td>

      {/* 2. สถานะ */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`status-badge ${statusDisplay.color}`} // (ใช้ CSS ใหม่)
        >
          {statusDisplay.text}
        </span>
      </td>

      {/* 3. วันที่สมัคร */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(application.appliedAt).toLocaleDateString("th-TH", { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>

      {/* 4. ปุ่ม (ดูรายละเอียด) */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {/* (ถ้าเข้ารอบแล้ว -> ให้แชท) */}
        {canChat ? (
          <button
            onClick={handleChatClick}
            className="btn-primary-outline text-sm" // (ใช้ CSS ใหม่)
          >
            <MessageCircle size={14} className="mr-1" />
            ติดต่อ (แชท)
          </button>
        ) : (
          <Link
            to={`/jobs/${job.id}`}
            className="text-blue-600 hover:text-blue-900"
          >
            ดูรายละเอียดงาน
          </Link>
        )}
      </td>
    </tr>
  );
};

export default ApplicationStatusRow;
