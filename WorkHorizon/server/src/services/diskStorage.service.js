import multer from 'multer';
import path from 'path';
import fs from 'fs';

// (ตรวจสอบและสร้างโฟลเดอร์ 'uploads/images' ถ้ายังไม่มี)
const uploadDir = 'uploads/images';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// สร้างโฟลเดอร์สำหรับ Resumes
const resumeDir = 'uploads/resumes';
if (!fs.existsSync(resumeDir)){
    fs.mkdirSync(resumeDir, { recursive: true });
}

// 1. ตั้งค่าการจัดเก็บไฟล์ (Disk Storage)
const storage = multer.diskStorage({
  // (บอกว่าให้เซฟที่โฟลเดอร์ไหน)
  destination: (req, file, cb) => {
    if (file.fieldname === 'resumeFile') {
      cb(null, resumeDir);
    } else {
      cb(null, uploadDir);
    }
  },
  // (ตั้งชื่อไฟล์ใหม่ ไม่ให้ซ้ำกัน)
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// 2. ตั้งค่า Filter (อัปเดต)
const fileFilter = (req, file, cb) => {
  // (อนุญาต รูปภาพ)
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif'
  ) {
    cb(null, true);
  } 
  // (อนุญาต เอกสาร)
  else if (
    file.mimetype === 'application/pdf' || // (อนุญาต PDF)
    file.mimetype === 'application/msword' || // (อนุญาต .doc)
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // (อนุญาต .docx)
  ) {
     cb(null, true);
  }
  // (ปฏิเสธไฟล์อื่น)
  else {
    cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG) หรือเอกสาร (PDF, DOC) เท่านั้น'), false);
  }
};

// 3. ส่งออก Middleware
export const diskUpload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 50 // 50 MB
  },
  fileFilter: fileFilter,
});