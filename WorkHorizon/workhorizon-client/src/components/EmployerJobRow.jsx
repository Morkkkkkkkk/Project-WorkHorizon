import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { jobApi } from '../api/jobApi';
import { toast } from 'react-toastify';

// --- SVG Icons ---
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.634l3.14-5.234A3.75 3.75 0 017.5 4.5h9c1.652 0 3.09.892 3.824 2.25l3.14 5.234a1.012 1.012 0 010 .634l-3.14 5.234A3.75 3.75 0 0116.5 19.5h-9a3.75 3.75 0 01-2.324-1.03l-3.14-5.234z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconPencil = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.474a2.25 2.25 0 01-2.244 2.027H8.084a2.25 2.25 0 01-2.244-2.027L5.054 5.79m10.906 0c.055-.42.048-.847.048-1.274a3 3 0 00-3-3H9a3 3 0 00-3 3c0 .427.005.854.048 1.274M5.054 5.79l.942-3.007a2.25 2.25 0 012.11-.159L12 4.5l3.895-1.866a2.25 2.25 0 012.11.159l.942 3.007M15 12v5.25a.75.75 0 01-1.5 0V12a.75.75 0 011.5 0z" />
  </svg>
);
// --- End Icons ---

/**
 * @param {object} props
 * @param {object} props.job - ข้อมูล Job 1 ชิ้น
 * @param {Function} props.onEdit - (Callback เมื่อกด "แก้ไข")
 * @param {Function} props.onDeleteSuccess - (Callback เมื่อ "ลบ" สำเร็จ)
 */
const EmployerJobRow = ({ job, onEdit, onDeleteSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Logic การลบ
  const handleDelete = async () => {
    // (ห้ามใช้ confirm())
    const isConfirmed = window.prompt("หากต้องการลบงานนี้ ให้พิมพ์ 'DELETE' (ตัวพิมพ์ใหญ่)");
    if (isConfirmed !== 'DELETE') {
      return;
    }

    setIsDeleting(true);
    try {
      await jobApi.deleteJob(job.id);
      toast.success("ลบงานสำเร็จ");
      onDeleteSuccess(); // (บอกให้ Dashboard refresh)
    } catch (err) {
      toast.error("ลบไม่สำเร็จ: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // 2. Logic การเปลี่ยนสถานะ (Publish/Archive)
  const handleToggleStatus = async () => {
    const newStatus = job.status === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED';
    try {
      await jobApi.updateJobStatus(job.id, newStatus);
      toast.success("เปลี่ยนสถานะสำเร็จ");
      onDeleteSuccess(); // (ใช้ Callback เดียวกันเพื่อ Refresh)
    } catch (err) {
      toast.error("เปลี่ยนสถานะไม่สำเร็จ: " + err.message);
    }
  };


  // (Helper)
  const statusConfig = {
    PUBLISHED: { text: "เผยแพร่", color: "bg-green-100 text-green-800" },
    ARCHIVED: { text: "ปิดรับ", color: "bg-yellow-100 text-yellow-800" },
    DRAFT: { text: "แบบร่าง", color: "bg-gray-100 text-gray-800" },
    FILLED: { text: "ได้คนแล้ว", color: "bg-blue-100 text-blue-800" }
  };
  const currentStatus = statusConfig[job.status] || statusConfig.DRAFT;


  return (
    <tr className="bg-white hover:bg-gray-50">
      {/* 1. ชื่องาน */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{job.title}</div>
        <div className="text-sm text-gray-500">{job.subCategory?.name || job.mainCategory.name}</div>
      </td>

      {/* 2. สถานะ */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${currentStatus.color}`}
        >
          {currentStatus.text}
        </span>
      </td>

      {/* 3. จำนวนใบสมัคร (Link ไปยังหน้ารวม) */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <Link
          to={`/dashboard/jobs/${job.id}/applicants`} // (เราจะสร้างหน้านี้ทีหลัง)
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {job.applications} คน
        </Link>
      </td>

      {/* 4. วันที่โพสต์ */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(job.createdAt).toLocaleDateString("th-TH", { day: 'numeric', month: 'short' })}
      </td>

      {/* 5. ปุ่ม Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        {/* 5.1 ปุ่ม Publish/Archive */}
        <button
          onClick={handleToggleStatus}
          className={job.status === 'PUBLISHED' ? "text-yellow-600" : "text-green-600"}
        >
          {job.status === 'PUBLISHED' ? 'ปิดรับ' : 'เผยแพร่'}
        </button>

        {/* 5.2 ปุ่ม Edit (เปิด Modal) */}
        <button
          onClick={() => onEdit(job)}
          className="text-blue-600 hover:text-blue-900"
          title="แก้ไข"
        >
          <IconPencil />
        </button>

        {/* 5.3 ปุ่ม Delete */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-900 disabled:text-gray-400"
          title="ลบ"
        >
          {isDeleting ? '...' : <IconTrash />}
        </button>
      </td>
    </tr>
  );
};

export default EmployerJobRow;
