import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('jobhub_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromToken = async () => {
      if (token) {
        try {
          const { data } = await apiClient.get('/auth/me');
          setUser(data);
        } catch (error) {
          console.error("Token ไม่ถูกต้อง:", error);
          setToken(null);
          localStorage.removeItem('jobhub_token');
        }
      }
      setIsLoading(false);
    };

    loadUserFromToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('jobhub_token', data.token);

      // (อัปเดต) (ดึงโปรไฟล์เต็มหลังล็อกอิน เพื่อให้ Role อัปเดตทันที)
      if (data.token) {
        const { data: meData } = await apiClient.get('/auth/me');
        setUser(meData);
        return { user: meData, token: data.token }; // ✅ Return user data AND token
      }
      return { user: data.user, token: data.token };

    } catch (error) {
      console.error("Login ล้มเหลว:", error);
      throw error.response?.data || error;
    }
  };

  // ✅ NEW: Function to login with a stored token (for "Remember Me")
  const loginWithToken = async (storedToken) => {
    try {
      setToken(storedToken);
      localStorage.setItem('jobhub_token', storedToken);
      const { data } = await apiClient.get('/auth/me');
      setUser(data);
      return data;
    } catch (error) {
      console.error("Login with token failed:", error);
      setToken(null);
      localStorage.removeItem('jobhub_token');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await apiClient.post('/auth/register', userData);
      return data;
    } catch (error) {
      console.error("Register ล้มเหลว:", error);
      throw error.response?.data || error;
    }
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jobhub_token');
  };

  // (อัปเดต) (ฟังก์ชันสำหรับอัปเดต user state โดยตรง)
  // (เราจะใช้ฟังก์ชันนี้ใน BasicInfoForm เพื่อให้รูปโปรไฟล์เปลี่ยนทันที)
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
    isAdmin: user?.role === 'SUPER_ADMIN',
    isFreelancer: user?.role === 'FREELANCER',
    login,
    loginWithToken, // ✅ Export new function
    register,
    logout,
    refreshAuthUser, // 
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
    throw new Error('useAuth ต้องถูกเรียกใช้ภายใน AuthProvider');
  }
  return context;
};