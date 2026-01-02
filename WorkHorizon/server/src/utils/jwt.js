import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ✅ เพิ่มการเช็คความปลอดภัยตรงนี้
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file");
  // บังคับให้ Server หยุดทำงานทันที เพื่อให้เรารู้ตัวว่าลืมตั้งค่า
  // (หรือถ้าไม่อยากให้หยุด ก็ comment บรรทัด process.exit ออก)
  process.exit(1); 
}

export const signToken = (payload) => {
  // เช็คซ้ำอีกทีเพื่อความชัวร์
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};