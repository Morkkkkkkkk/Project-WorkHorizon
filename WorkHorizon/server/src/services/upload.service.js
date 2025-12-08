import multer from 'multer';
import path from 'path';
import fs from 'fs';

// (ตรวจสอบและสร้างโฟลเดอร์ 'uploads/images' ถ้ายังไม่มี)
const uploadDir = 'uploads/images';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. ตั้งค่าการจัดเก็บไฟล์ (Disk Storage)
const storage = multer.diskStorage({
  // (บอกว่าให้เซฟที่โฟลเดอร์ไหน)
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // (ตั้งชื่อไฟล์ใหม่ ไม่ให้ซ้ำกัน)
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});
// อนุญาตไฟล์ประเภทไหนบ้าง (ตัวอย่าง: รูปภาพและ PDF)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB
  },
  fileFilter: fileFilter,
});

