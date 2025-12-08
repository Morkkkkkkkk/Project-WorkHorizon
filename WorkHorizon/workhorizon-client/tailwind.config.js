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
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
      // --- (จบส่วนที่เพิ่ม) ---

      // (Font ที่เราเคยตั้งค่าไว้)
      fontFamily: {
        heading: ["Inter", "Noto Sans Thai", "sans-serif"],
        body: ["Noto Sans Thai", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
