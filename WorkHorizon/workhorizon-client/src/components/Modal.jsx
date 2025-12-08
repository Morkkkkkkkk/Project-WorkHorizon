import React, { useEffect } from 'react';

// --- SVG Icons ---
const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
// --- End Icons ---

/**
 * Component Modal (Pop-up)
 * @param {object} props
 * @param {boolean} props.isOpen - สถานะว่า Modal เปิดอยู่หรือไม่
 * @param {Function} props.onClose - ฟังก์ชันที่จะเรียกเมื่อกดปิด
 * @param {string} props.title - หัวข้อของ Modal
 * @param {React.ReactNode} props.children - เนื้อหา (Form) ที่จะแสดงข้างใน
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  // 1. Effect สำหรับป้องกันการ scroll หน้าเว็บหลักเมื่อ Modal เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]); // <--- ทำงานเมื่อ isOpen เปลี่ยน

  // 2. ถ้าไม่เปิด (isOpen=false) ไม่ต้อง render อะไรเลย
  if (!isOpen) {
    return null;
  }

  // 3. UI (ใช้ Tailwind)
  return (
    // (ใช้ Portal จะดีที่สุด แต่ใช้ Fragment ก็ได้)
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      // 3.1 คลิกที่พื้นหลังสีดำ (Overlay) เพื่อปิด
      onMouseDown={onClose} 
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden"
        // 3.2 ป้องกันการปิด Modal เมื่อคลิกที่ตัวเนื้อหา
        onMouseDown={(e) => e.stopPropagation()} 
      >
        {/* 3.3 Modal Header (หัวข้อและปุ่มปิด) */}
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <IconClose />
          </button>
        </div>

        {/* 3.4 Modal Body (เนื้อหา/Form ที่ถูกส่งมา) */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
