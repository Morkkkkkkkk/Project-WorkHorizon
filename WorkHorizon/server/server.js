import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import allRoutes from './src/routes/index.js';
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import { errorHandler } from './src/middlewares/error.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  'http://localhost:5173',      // 1. สำหรับเทสในคอม (ตอนรัน npm run dev)
  //'http://49.49.36.238:5173' // 2. สำหรับเทสในมือถือ (ใช้ IP คอมของคุณ)
  // (ถ้า IP คอมของคุณเปลี่ยน ต้องมาแก้ตรงนี้ด้วย)
];

// เราจะแทนที่ app.use(cors()); ด้วยโค้ดนี้:
app.use(cors({
  origin: function (origin, callback) {
    // อนุญาตถ้า origin อยู่ใน List หรือถ้าเป็น "undefined" (เช่น Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
})); // อนุญาตการเชื่อมต่อจากโดเมนอื่น

app.use(express.json()); // อ่าน JSON body
app.use(express.urlencoded({ extended: true })); // อ่าน Form body

// base route
app.get("/", (req, res) => res.json({ message: "JobFinder API" }));

// --- (เพิ่ม) เสิร์ฟไฟล์ Static จากโฟลเดอร์ uploads ---
// (ทำให้ URL เช่น /uploads/images/my-image.png ใช้งานได้)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
// นำ Route ทั้งหมดมาใช้
app.use('/api', allRoutes);

// Error Handling (ตัวอย่าง)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
