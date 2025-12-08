import axios from 'axios';

// 1. (เพิ่ม) กำหนด URL ของ Backend
export const BACKEND_URL = 'http://localhost:5000';
//export const BACKEND_URL = 'http://49.49.36.238:5000';

// 2. (อัปเดต) สร้าง Axios instance
const apiClient = axios.create({
  baseURL: `${BACKEND_URL}/api/`, // (ใช้ตัวแปร)
  headers: {
    'Content-Type': 'application/json',
  },
})

// 2. สร้าง Interceptor (ตัวดักจับ)
// นี่คือส่วนที่สำคัญมาก!
apiClient.interceptors.request.use(
  (config) => {
    // ดึง Token จาก localStorage
    const token = localStorage.getItem('jobhub_token'); 
    
    if (token) {
      // ถ้ามี Token, ให้แนบไปกับ Header ของทุก Request
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // ถ้าเกิดข้อผิดพลาดตอนส่ง Request
    return Promise.reject(error);
  }
);

export default apiClient;