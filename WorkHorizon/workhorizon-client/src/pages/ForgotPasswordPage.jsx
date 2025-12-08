import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi'; // 1. Import (ใหม่)

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // 2. เรียก API
      const data = await authApi.forgotPassword(email);
      setSuccess(data.message || "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว");
    } catch (err) {
      setError(err.response?.data?.error || "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="card w-full max-w-md p-8 space-y-6">
        
        <h2 className="text-2xl font-bold text-center text-slate-900">
          ลืมรหัสผ่าน
        </h2>
        
        {/* 3. ถ้าสำเร็จ (Success) */}
        {success ? (
          <div className="text-center">
            <p className="alert-success">{success}</p>
            <Link 
              to="/login" 
              className="mt-4 text-blue-600 hover:underline"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-center text-slate-600">
              กรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้
            </p>
          
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="alert-danger">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="label-text"
                >
                  อีเมล
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? 'กำลังส่ง...' : 'ส่งคำขอ'}
                </button>
              </div>
            </form>

            <p className="mt-4 text-sm text-center text-slate-600">
              จำรหัสผ่านได้แล้ว?{' '}
              <Link 
                to="/login" 
                className="font-medium text-blue-600 hover:underline"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
