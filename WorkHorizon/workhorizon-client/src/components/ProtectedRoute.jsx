import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // 1. Import "Auth Controller"
import { Navigate, useLocation } from 'react-router-dom';

// --- SVG Icons ---
const IconLoading = () => (
  <svg stroke="currentColor" viewBox="0 0 24 24" className="w-8 h-8 animate-spin text-blue-600">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
  </svg>
);
// --- End Icons ---

/**
 * Component นี้จะตรวจสอบสิทธิ์การเข้าถึง
 * @param {object} props
 * @param {React.ReactNode} props.children - Page ที่ต้องการป้องกัน
 * @param {'JOB_SEEKER' | 'EMPLOYER' | 'SUPER_ADMIN'} [props.role] - (Optional) Role ที่ต้องการ
 */
const ProtectedRoute = ({ children, role }) => {
  // 2. เรียกใช้ Controller
  const { isLoading, isAuth, isEmployer, isJobSeeker, isAdmin, isFreelancer } = useAuth();
  const location = useLocation(); // <--- สำหรับจำว่ามาจากหน้าไหน

  // 3. (Case 1) กำลังเช็ก Token...
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <IconLoading />
        <span className="ml-3 text-lg">กำลังตรวจสอบสิทธิ์...</span>
      </div>
    );
  }

  // 4. (Case 2) เช็ก Token แล้ว (isLoading=false) แต่ "ไม่ได้ล็อกอิน"
  if (!isAuth) {
    // ส่งไปหน้า Login
    // `replace` คือไม่เก็บประวัติหน้านี้
    // `state` คือการบอกหน้า Login ว่า "ถ้าล็อกอินเสร็จ ให้กลับมาหน้านี้นะ"
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 5. (Case 3) ล็อกอินแล้ว "แต่ Role ไม่ตรง" (ถ้ามีการระบุ Role)
  if (role === 'EMPLOYER' && !isEmployer) {
    // ถ้าหน้านี้สำหรับ Employer แต่คนเข้าเป็น Job Seeker
    return <Navigate to="/" replace />; // เด้งกลับหน้าแรก
  }

  if (role === 'JOB_SEEKER' && !isJobSeeker) {
    // ถ้าหน้านี้สำหรับ Job Seeker แต่คนเข้าเป็น Employer
    return <Navigate to="/" replace />; // เด้งกลับหน้าแรก
  }
  if (role === 'SUPER_ADMIN' && !isAdmin) {
    // ถ้าหน้านี้สำหรับ Admin แต่คนเข้าไม่ใช่ Admin
    return <Navigate to="/" replace />; // เด้งกลับหน้าแรก
  }
  if (role === 'FREELANCER' && !isFreelancer) {
    return <Navigate to="/" replace />;
  }
    

  // 6. (Case 4) ล็อกอินแล้ว และ Role ถูกต้อง (หรือไม่ได้ระบุ Role)
  // ให้แสดง Page นั้นๆ
  return children;
};

export default ProtectedRoute;
