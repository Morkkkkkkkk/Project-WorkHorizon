import { useState, useEffect } from 'react';

/**
 * Hook สำหรับหน่วงเวลาการเปลี่ยนแปลงค่า (Debounce)
 * @param {*} value - ค่าที่ต้องการหน่วง
 * @param {number} delay - เวลา (ms)
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // (ตั้ง Timer)
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // (Cleanup: ยกเลิก Timer ถ้า value เปลี่ยนก่อน)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // (ทำงานใหม่เมื่อ value หรือ delay เปลี่ยน)

  return debouncedValue;
};