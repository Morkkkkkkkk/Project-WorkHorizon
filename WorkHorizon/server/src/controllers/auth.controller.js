import prisma from "../config.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // --- (DEBUG 1) ---
    //  console.log("[Register] ได้รับ Role:", role);
    // --- (จบ DEBUG 1) ---

    // --- (ควรเพิ่ม Validation Zod/Joi ตรงนี้) ---
    // --- Validation ---
    if (!email || !password || !firstName || !lastName || !role) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields." });
    }

    // 1. เช็กว่า email ซ้ำหรือไม่
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    // 2. เข้ารหัสผ่าน
    const hashedPassword = await hashPassword(password);

    
    // 3.1 สร้างผู้ใช้
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
      },
    });

    // 3.2 ถ้าเป็น Employer ให้สร้างโปรไฟล์บริษัทพื้นฐานให้ทันที
    if (role === "EMPLOYER") {
      // --- (DEBUG 2) ---
      // console.log(
      //    `[Register] Role เป็น EMPLOYER, กำลังสร้าง Company สำหรับ User ID: ${user.id}`
      //  );
      // --- (จบ DEBUG 2) ---
      await prisma.company.create({
        data: {
          userId: user.id, // (เชื่อมโยงกับ User)
          companyName: `${firstName}`, // (ชื่อเริ่มต้น)
          description: "กรุณาอัปเดตรายละเอียดบริษัท", // (คำอธิบายเริ่มต้น)
          isVerified: false,
        },
      });
    }

    // 3.3 กรณีเป็น Freelancer (เพิ่มใหม่)
    if (role === "FREELANCER") {
      await prisma.freelancerProfile.create({
        data: {
          userId: user.id,
          professionalTitle: "Freelancer", // ค่าเริ่มต้น
          bio: "ยินดีต้อนรับ! กรุณาอัปเดตประวัติและผลงานของคุณ", // ค่าเริ่มต้น
        },
      });
    }

    // 4. ไม่ส่งรหัสผ่านกลับไป
    user.password = undefined;

    // ส่ง Response เมื่อทุกอย่างสำเร็จ
    res.status(201).json({ message: "User registered successfully", user });

  } catch (error) {
    // --- (DEBUG 3) ---
    //console.error("[Register] เกิด Error 500:", error.message);
    // --- (จบ DEBUG 3) ---
    console.error("[Register Error]", error);
    res
      .status(500)
      .json({ error: "Registration failed", details: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. ค้นหาผู้ใช้
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // --- เช็กสถานะก่อนตรวจสอบรหัสผ่าน ---
    if (user.status === 'BANNED') {
      return res.status(403).json({ error: "This account has been banned." });
    }
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: "This account is suspended." });
    }

    // 2. ตรวจสอบรหัสผ่าน
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. สร้าง JWT
    const token = signToken({ userId: user.id, role: user.role });

    user.password = undefined;
    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  // req.user ถูกส่งมาจาก middleware 'authenticateToken'
  try {
    // เราอาจจะดึงข้อมูล user สดๆ อีกครั้ง (เผื่อมีการอัปเดต)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
         id: true,
         email: true,
         role: true,
         firstName: true,
         lastName: true,
         phone: true,
         createdAt: true,
         profileImageUrl: true,
         bio: true,
         status: true,
         
         //  เพิ่ม walletBalance
         walletBalance: true,

         // ดึงข้อมูลบริษัท (เฉพาะ logoUrl) ถ้า user นี้มี company
         company: {
           select: {
             logoUrl: true
           }
         },
         freelancerProfile: {
           select: { 
            profileImageUrl: true 
          } 
        }
      },
    });

    

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch user", details: error.message });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  // (Logic ส่งอีเมล (เช่น SendGrid/Nodemailer) ต้องทำเพิ่ม)

  res.json({ message: "If email exists, a reset link has been sent." });
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  // (Logic เช็ก Token, Hash รหัสใหม่, อัปเดต User)
  res.json({ message: "Password reset successful." });
};
