import React from 'react';

// --- SVG Icon ---
const IconLoading = () => (
  <svg stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8 animate-spin text-blue-600">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
  </svg>
);
// --- End Icon ---

/**
 * Component แสดง Icon หมุนๆ กลางหน้าจอ
 * @param {object} props
 * @param {boolean} [props.fullScreen] - ถ้า true จะยืดเต็มจอ (ลบ header)
 * @param {string} [props.text] - (Optional) ข้อความที่แสดงใต้ Icon
 */
const LoadingSpinner = ({ fullScreen = false, text = "กำลังโหลด..." }) => {
  const heightClass = fullScreen ? 'h-screen' : 'h-[calc(100vh-150px)]';
  
  return (
    <div className={`flex flex-col justify-center items-center ${heightClass} w-full`}>
      <IconLoading />
      {text && <span className="ml-3 text-lg mt-2 text-gray-700">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
