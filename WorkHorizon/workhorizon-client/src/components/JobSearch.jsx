// src/components/JobSearch.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. Import Hook ของเรา
import { useCategorySelector } from '../hooks/useCategorySelector'; 

const JobSearch = () => {
  // 2. Hook สำหรับการ "นำทาง" (ย้ายหน้า)
  const navigate = useNavigate();

  // 3. State สำหรับ "คำค้นหา" (Keyword)
  const [keyword, setKeyword] = useState('');

  // 4. (นี่คือส่วนที่ง่ายที่สุด!)
  // เรียกใช้ Hook โดย "ไม่" ส่งค่าเริ่มต้น (เพราะเป็นการค้นหาใหม่)
  const {
    selectedMainCat,
    selectedSubCat,
    mainCategories,
    filteredSubCategories,
    isLoadingCategories,
    handleMainCategoryChange,
    handleSubCategoryChange,
  } = useCategorySelector();

  // 5. (นี่คือส่วนที่สำคัญที่สุด!)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // สร้างตัวจัดการ Query Parameters
    const params = new URLSearchParams();

    // เราจะเพิ่มค่าลงไป "ถ้า" ผู้ใช้เลือกหรือพิมพ์เท่านั้น
    if (keyword) {
      params.set('q', keyword);
    }
    if (selectedMainCat) {
      params.set('mainCat', selectedMainCat);
    }
    if (selectedSubCat) {
      params.set('subCat', selectedSubCat);
    }
    
    // 6. "ส่ง" ผู้ใช้ไปที่หน้าผลการค้นหา พร้อม Query ที่สร้าง
    navigate(`/search?${params.toString()}`);
  };

  return (
    // 7. เชื่อม Form เข้ากับ Handler
    <form onSubmit={handleSearchSubmit} className="job-search-form">
      {/* (ตัวอย่าง: เพิ่มช่องค้นหา Keyword) */}
      <input
        type="text"
        placeholder="ตำแหน่งงาน, ทักษะ..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="search-input" // (สมมติว่ามี CSS)
      />

      {/* 8. แสดงผล Dropdowns (ใช้ UI เหมือนเดิม) */}
      {isLoadingCategories ? (
        <div>Loading filters...</div>
      ) : (
        <>
          <select 
            value={selectedMainCat} 
            onChange={handleMainCategoryChange}
            className="search-select" // (สมมติว่ามี CSS)
          >
            {/* 9. (สำคัญ) เราต้องเพิ่ม Option "ทั้งหมด" เอง */}
            <option value="">-- ทุกหมวดหมู่ --</option>
            {mainCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={selectedSubCat}
            onChange={handleSubCategoryChange}
            disabled={!selectedMainCat} // ปิดไว้ถ้ายังไม่เลือก main
            className="search-select" // (สมมติว่ามี CSS)
          >
            {/* 9. (สำคัญ) เราต้องเพิ่ม Option "ทั้งหมด" เอง */}
            <option value="">-- ทุกหมวดหมู่ย่อย --</option>
            {filteredSubCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </>
      )}

      <button type="submit" className="search-button">
        ค้นหา
      </button>
    </form>
  );
};

export default JobSearch;