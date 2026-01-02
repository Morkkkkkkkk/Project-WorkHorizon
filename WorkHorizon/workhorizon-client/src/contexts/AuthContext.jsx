import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('jobhub_token'));
  const [isLoading, setIsLoading] = useState(true);

  // 1. โหลด User เมื่อมี Token (ตอนเข้าเว็บใหม่)
  useEffect(() => {
    const loadUserFromToken = async () => {
      if (token) {
        try {
          // ✅ FIX 1: บังคับใส่ Header ก่อนยิง API
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const { data } = await apiClient.get('/auth/me');
          setUser(data);
        } catch (error) {
          console.error("Token invalid/expired:", error);
          // ถ้า Token ใช้ไม่ได้ ให้ลบทิ้ง
          localStorage.removeItem('jobhub_token');
          setToken(null);
          setUser(null);
          delete apiClient.defaults.headers.common['Authorization'];
        }
      } else {
          setUser(null);
      }
      setIsLoading(false);
    };

    loadUserFromToken();
  }, [token]);

  // 2. ฟังก์ชัน Login (ฉบับแก้ไข: ไม่เรียก /me ซ้ำ)
  const login = async (email, password) => {
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });

      // เช็คว่า Server ส่งของมาครบไหม
      if (!data.token || !data.user) {
         throw new Error("Invalid response from server");
      }

      // 1. เก็บ Token
      localStorage.setItem('jobhub_token', data.token);
      setToken(data.token);
      
      // ✅ FIX 2: อัปเดต Header ทันที! (สำคัญมาก เพื่อให้ request ต่อไปใช้งานได้เลย)
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      // 2. ใช้ User Data จาก Login Response เลย (ไม่ต้องเรียก /me ซ้ำให้เสี่ยง Error)
      setUser(data.user);

      return { success: true, user: data.user, token: data.token };

    } catch (error) {
      console.error("Login failed:", error);
      throw error.response?.data || error;
    }
  };

  const loginWithToken = async (storedToken) => {
    try {
      setToken(storedToken);
      localStorage.setItem('jobhub_token', storedToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      
      const { data } = await apiClient.get('/auth/me');
      setUser(data);
      return data;
    } catch (error) {
      console.error("Login with token failed:", error);
      logout();
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await apiClient.post('/auth/register', userData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jobhub_token');
    delete apiClient.defaults.headers.common['Authorization'];
    // window.location.href = '/login'; // ถ้าต้องการ Redirect
  };

  const refreshAuthUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    token,
    isLoading,
    isAuth: !!user,
    isEmployer: user?.role === 'EMPLOYER',
    isJobSeeker: user?.role === 'JOB_SEEKER',
    isAdmin: user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN',
    isFreelancer: user?.role === 'FREELANCER',
    login,
    loginWithToken,
    register,
    logout,
    refreshAuthUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};