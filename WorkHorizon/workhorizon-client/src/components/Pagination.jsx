import React from 'react';

// --- Icons ---
const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);
// --- End Icons ---

/**
 * Component Pagination
 * @param {object} props
 * @param {number} props.currentPage - หน้าปัจจุบัน
 * @param {number} props.totalPages - จำนวนหน้าทั้งหมด
 * @param {Function} props.onPageChange - (Callback เมื่อคลิกเปลี่ยนหน้า)
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // (Logic การสร้าง Array ของเลขหน้า, เช่น [1, 2, 3] หรือ [4, 5, 6])
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    }
    if (currentPage > totalPages - 3) {
      startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  // (ถ้ามีแค่หน้าเดียว ไม่ต้องแสดงผล)
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center space-x-2 mt-8">
      
      {/* 1. ปุ่ม "ก่อนหน้า" (<) */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <IconChevronLeft />
      </button>

      {/* (แสดง ... ถ้าหน้าแรกไกลไป) */}
      {pageNumbers[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="pagination-btn">
            1
          </button>
          <span className="pagination-dots">...</span>
        </>
      )}

      {/* 2. ปุ่มตัวเลข */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`pagination-btn ${
            currentPage === page ? 'pagination-btn-active' : ''
          }`}
        >
          {page}
        </button>
      ))}

      {/* (แสดง ... ถ้าหน้าสุดท้ายไกลไป) */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          <span className="pagination-dots">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className="pagination-btn"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* 3. ปุ่ม "ถัดไป" (>) */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <IconChevronRight />
      </button>
    </nav>
  );
};

export default Pagination;

