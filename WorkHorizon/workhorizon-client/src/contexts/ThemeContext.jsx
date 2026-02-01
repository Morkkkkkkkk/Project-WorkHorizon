import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(null);

  const fetchTheme = async () => {
    try {
      const res = await apiClient.get('/themes/active');
      if (res.data) {
          applyTheme(res.data);
      } else {
          resetTheme();
      }
    } catch (error) {
      console.error("Failed to load theme", error);
    }
  };

  const applyTheme = (themeData) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', themeData.primaryColor);
    root.style.setProperty('--color-secondary', themeData.secondaryColor);
    root.style.setProperty('--bg-color', themeData.backgroundColor);
    
    // ตั้งค่าสี 50 ให้เป็นสีเดียวกับ Background เพื่อความเนียน
    root.style.setProperty('--color-primary-50', themeData.backgroundColor); 
    setTheme(themeData);
  };

  const resetTheme = () => {
    const root = document.documentElement;
    // Default Blue
    root.style.setProperty('--color-primary', '#2563eb');
    root.style.setProperty('--color-secondary', '#1d4ed8');
    root.style.setProperty('--bg-color', '#f8fafc');
    root.style.setProperty('--color-primary-50', '#eff6ff');
    setTheme(null);
  }

  useEffect(() => {
    fetchTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, refreshTheme: fetchTheme }}>
        {/* Effect Layer: ปรับให้จางลงและไม่รบกวนการคลิก */}
        {theme?.decorationImage && (
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {/* 1. รูปใหญ่ลอยจางๆ (Background Ambience) */}
                <img 
                    src={theme.decorationImage} 
                    className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] object-cover opacity-[0.03] animate-float mix-blend-multiply" 
                    alt="" 
                />
                
                {/* 2. (Optional) รูปตกแต่งมุมขวาล่าง */}
                {/* <img 
                    src={theme.decorationImage} 
                    className="absolute bottom-4 right-4 w-32 h-32 object-contain opacity-20 hover:opacity-100 transition-opacity duration-500" 
                    alt="Decoration"
                /> */}
            </div>
        )}
      {children}
    </ThemeContext.Provider>
  );
};