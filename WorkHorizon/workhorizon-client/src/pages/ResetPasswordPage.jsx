import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 1. ดึง Token จาก URL (เช่น ?token=...)
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 2. เช็กรหัสผ่าน
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (!token) {
      setError("Token ไม่ถูกต้องหรือไม่พบ");
      return;
    }

    setIsLoading(true);
    try {
      // 3. เรียก API
      const data = await authApi.resetPassword(token, password);
      setSuccess(data.message || "เปลี่ยนรหัสผ่านสำเร็จ!");
      
      // (พาไปหน้า Login หลังผ่านไป 3 วิ)
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.error || "เกิดข้อผิดพลาด หรือ Token หมดอายุ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="card w-full max-w-md p-8 space-y-6">
        
        <h2 className="text-2xl font-bold text-center text-slate-900">
          ตั้งรหัสผ่านใหม่
        </h2>
        
        {success ? (
          <div className="text-center">
            <p className="alert-success">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {!token && (
              <div className="alert-danger">
                ไม่พบ Token (ลิงก์อาจไม่ถูกต้อง)
              </div>
            )}
            {error && (
              <div className="alert-danger">
                {error}
              </div>
            )}

            <div>
              <label className="label-text">รหัสผ่านใหม่ *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div>
              <label className="label-text">ยืนยันรหัสผ่านใหม่ *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !token}
                className="btn-primary w-full"
              >
                {isLoading ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านใหม่'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ResetPasswordPage;
