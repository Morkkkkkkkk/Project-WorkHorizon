import multer from 'multer';
import path from 'path';
import fs from 'fs';

// --- 1. เตรียมโฟลเดอร์ (Create Directories) ---

const uploadDir = 'uploads/images';      // สำหรับรูปภาพทั่วไป
const resumeDir = 'uploads/resumes';     // สำหรับ Resume ผู้สมัคร
const documentDir = 'uploads/documents'; // ✅ (เพิ่ม) สำหรับเอกสารประกอบงานของบริษัท

// วนลูปสร้างโฟลเดอร์ถ้ายังไม่มี
[uploadDir, resumeDir, documentDir].forEach(dir => {
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }
});

// --- 2. Config เดิม (สำหรับรูปและ Resume) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'resumeFile') {
      cb(null, resumeDir);
    } else {
      cb(null, uploadDir); // รูปอื่นๆ ลงที่นี่
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif'
  ) {
    cb(null, true);
  } 
  else if (
    file.mimetype === 'application/pdf' || 
    file.mimetype === 'application/msword' || 
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  ) {
     cb(null, true);
  }
  else {
    cb(new Error('รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG) หรือเอกสาร (PDF, DOC) เท่านั้น'), false);
  }
};

export const diskUpload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 50 }, // 50 MB
  fileFilter: fileFilter,
});


// --- 3. ✅ (เพิ่มใหม่) Config แยกสำหรับ "เอกสารประกอบงาน" (Job Documents) ---
// สาเหตุที่แยก: เพื่อให้ไฟล์ไปอยู่ที่ uploads/documents และบังคับรับเฉพาะ PDF เพื่อความปลอดภัย

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentDir); // ✅ บันทึกลงโฟลเดอร์ documents
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // ตั้งชื่อไฟล์ขึ้นต้นด้วย job-doc เพื่อให้รู้ว่าเป็นเอกสารงาน
    cb(null, 'job-doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // จำกัด 10 MB (เอกสารไม่ควรใหญ่มาก)
  fileFilter: (req, file, cb) => {
    // ✅ บังคับรับเฉพาะ PDF เท่านั้น (หรือจะเพิ่ม docx ก็ได้ตามต้องการ)
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('อนุญาตเฉพาะไฟล์ PDF เท่านั้นสำหรับการแนบเอกสารสมัครงาน'), false);
    }
  }
});