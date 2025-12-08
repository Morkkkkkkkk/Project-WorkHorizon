import jwt from 'jsonwebtoken';
import prisma from '../config.js';

// 1. ตัวกลางเช็ก Token (JWT)
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ error: 'No token provided' }); // ไม่มี Token
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // --- (DEBUG 1) ---
    //console.log(`[AuthToken] Token ได้รับการถอดรหัส, ค้นหา User ID: ${decoded.userId}`);
    // --- (จบ DEBUG 1) ---

    // ค้นหาผู้ใช้จาก Token payload
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {

      // --- (DEBUG 2) ---
      //console.warn(`[AuthToken] "หา User ไม่เจอ" (401) สำหรับ ID: ${decoded.userId}`);
      // --- (จบ DEBUG 2) ---

      return res.status(401).json({ error: 'User not found' });
    }
    // --- (DEBUG 3) ---
    //console.log(`[AuthToken] "เจอ User" -> ${user.email}, Role: ${user.role}`);
    // --- (จบ DEBUG 3) ---

    // --- ตรวจสอบสถานะบัญชี ---
    if (user.status === 'BANNED') {
      return res.status(403).json({ error: 'Your account has been banned.' });
    }
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Your account is temporarily suspended.' });
    }

    // เก็บข้อมูลผู้ใช้ไว้ใน req เพื่อให้ controller อื่นใช้ได้
    req.user = user;
    next(); // ไปยัง Logic ถัดไป
  } catch (err) {
    return res.status(403).json({ error: 'Token is invalid' }); // Token ไม่ถูกต้อง
  }
};

// 2. ตัวกลางเช็ก Role (ต้องเรียกหลัง authenticateToken)
export const isJobSeeker = (req, res, next) => {
  if (req.user.role !== 'JOB_SEEKER') {
    return res.status(403).json({ error: 'Access denied. Job seekers only.' });
  }
  next();
};

export const isEmployer = (req, res, next) => {

  // --- (DEBUG 4) ---
  //console.log(`[isEmployer] กำลังตรวจสอบ Role... (ต้องการ 'EMPLOYER', ได้รับ '${req.user.role}')`);
  // --- (จบ DEBUG 4) ---

  if (req.user.role !== 'EMPLOYER') {

    // --- (DEBUG 5) ---
    //console.warn('[isEmployer] "ปฏิเสธ" (403) - Role ไม่ตรงกัน');
    // --- (จบ DEBUG 5) ---

    return res.status(403).json({ error: 'Access denied. Employers only.' });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};


// ---  Middleware สำหรับ Freelancer ---
export const isFreelancer = (req, res, next) => {
  if (req.user.role !== 'FREELANCER') {
    return res.status(403).json({ error: 'Access denied. Freelancers only.' });
  }
  next();
};

// --- อนุญาตทั้ง Job Seeker และ Freelancer (ใช้สำหรับสมัครงาน/บันทึกงาน) ---
export const isCandidate = (req, res, next) => {
  if (req.user.role !== 'JOB_SEEKER' && req.user.role !== 'FREELANCER' ) {
    return res.status(403).json({ error: 'Access denied. Candidates only.' });
  }
  next();
};