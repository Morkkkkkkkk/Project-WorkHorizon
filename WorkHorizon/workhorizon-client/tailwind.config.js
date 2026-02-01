/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      colors: {
        // เปลี่ยนสีเดิมที่ Hardcode ไว้ ให้ชี้ไปที่ตัวแปร CSS แทน
        blue: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          // ... ไล่เฉดสีถ้าต้องการ หรือใช้แบบง่ายๆ ด้านล่าง
          600: 'var(--color-primary)', // สีหลัก (ปุ่ม, link)
          700: 'var(--color-secondary)', // สีตอน Hover
        },
        slate: {
          50: 'var(--bg-color)', // สีพื้นหลัง
          // 800: 'var(--text-color)', // สีตัวอักษร (ถ้าต้องการเปลี่ยน)
        }
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        'float': 'float 6s ease-in-out infinite',
      },
      // --- (จบส่วนที่เพิ่ม) ---

      // (Font ที่เราเคยตั้งค่าไว้)
      fontFamily: {
        heading: ["Prompt", "sans-serif"],
        body: ["Prompt", "sans-serif"],
        sans: ["Prompt", "sans-serif"],
      },
    },
  },
  plugins: [],
};
