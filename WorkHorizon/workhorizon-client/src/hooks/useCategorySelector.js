import { useState, useEffect, useCallback } from 'react';
import { masterDataApi } from '../api/masterDataApi'; // (API ของเรา)

export const useCategorySelector = (initialMainCatId = "", initialSubCatId = "") => {
  // --- 1. สถานะการดึงข้อมูล ---
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]); // (เปลี่ยนชื่อ)
  
  const [isLoadingMain, setIsLoadingMain] = useState(true);
  const [isLoadingSub, setIsLoadingSub] = useState(false); // (จะโหลดทีหลัง)

  // --- 2. สถานะการเลือกของผู้ใช้ ---
  const [selectedMainCat, setSelectedMainCat] = useState(initialMainCatId);
  const [selectedSubCat, setSelectedSubCat] = useState(initialSubCatId);

  // --- 3. Effect ดึง "หมวดหมู่หลัก" (ตอนเริ่ม) ---
  useEffect(() => {
    const fetchMain = async () => {
      try {
        setIsLoadingMain(true);
        const data = await masterDataApi.getMainCategories();
        setMainCategories(data || []);
      } catch (err) {
        console.error("ล้มเหลวในการโหลดหมวดหมู่หลัก:", err);
        setMainCategories([]);
      } finally {
        setIsLoadingMain(false);
      }
    };
    fetchMain();
  }, []); // รันครั้งเดียว

  // --- 4. Effect ดึง "หมวดหมู่ย่อย" (เมื่อ Main เปลี่ยน) ---
  useEffect(() => {
    // ถ้าไม่มี Main Cat ที่เลือก ก็ไม่ต้องทำอะไร
    if (!selectedMainCat) {
      setSubCategories([]); // ล้างค่าเก่า
      return;
    }

    const fetchSub = async () => {
      try {
        setIsLoadingSub(true);
        // (เรียก API จริงที่เรามี ส่ง query เป็น "" หรือ null)
        const data = await masterDataApi.getSubCategories(selectedMainCat, "");
        setSubCategories(data || []);
        
        // (สำคัญ) เช็กว่า initialSubId ควรถูกตั้งค่าหรือไม่
        // (ป้องกันกรณีที่ 'initialSub' ที่ส่งมา ไม่ได้อยู่ใน 'data' ที่เพิ่งโหลด)
        const foundInitialSub = data?.some(sub => sub.id === initialSubCatId);
        if (!foundInitialSub) {
            // ถ้าไม่เจอ (เช่น user แก้ main cat เอง) ก็ล้าง sub cat ที่เลือกไว้
            setSelectedSubCat("");
        }

      } catch (err) {
        console.error("ล้มเหลวในการโหลดหมวดหมู่ย่อย:", err);
        setSubCategories([]);
      } finally {
        setIsLoadingSub(false);
      }
    };

    fetchSub();
  }, [selectedMainCat, initialSubCatId]); // (จะทำงานใหม่ เมื่อ MainCat เปลี่ยน)

  // --- 5. Event Handlers ---
  const handleMainCategoryChange = (e) => {
    const newMainCatId = e.target.value;
    setSelectedMainCat(newMainCatId);
    // (ล้าง Sub ทันที)
    setSelectedSubCat(""); 
    setSubCategories([]); // (ล้างข้อมูลเก่า)
  };

  const handleSubCategoryChange = (e) => {
    setSelectedSubCat(e.target.value);
  };

  // --- 6. คืนค่า ---
  return {
    selectedMainCat,
    selectedSubCat,
    mainCategories,
    filteredSubCategories: subCategories, // (ส่ง subCategories ที่โหลดมา)
    isLoadingCategories: isLoadingMain || isLoadingSub, // (โหลด ถ้ามีตัวใดตัวหนึ่งโหลด)
    handleMainCategoryChange,
    handleSubCategoryChange,
  };
};