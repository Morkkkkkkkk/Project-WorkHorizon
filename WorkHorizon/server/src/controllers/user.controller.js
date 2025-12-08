import prisma from '../config.js';
import fs from "fs/promises";
import path from "path";
import { comparePassword, hashPassword } from "../utils/hash.js";

// --- Helpers (ฟังก์ชันช่วยทำงาน) ---

// แปลง Path ของไฟล์ให้เป็น URL สำหรับ Frontend
const getWebPath = (filePath) => {
  if (!filePath) return null;
  if (filePath.includes("uploads")) {
    return filePath.replace(/\\/g, "/").replace("uploads", "/uploads");
  }
  return filePath;
};

// ลบไฟล์ออกจาก Disk (ใช้เมื่อมีการเปลี่ยนรูปหรือลบข้อมูล)
const deleteFileFromDisk = async (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith("/uploads")) {
    return;
  }
  const oldPath = path.join(
    process.cwd(),
    fileUrl.replace("/uploads", "uploads")
  );
  try {
    await fs.unlink(oldPath);
  } catch (err) {
    // ถ้าหาไฟล์ไม่เจอ (ENOENT) ให้ข้ามไป ไม่ต้อง Error
    if (err.code !== "ENOENT") {
      console.warn(`Failed to delete old file: ${oldPath}`, err.message);
    }
  }
};

// --- User Profile Controllers ---

// GET /api/users/me: ดึงข้อมูลส่วนตัวทั้งหมด
export const getMyProfile = async (req, res) => {
  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        educations: { orderBy: { startDate: "desc" } },
        experiences: { orderBy: { startDate: "desc" } },
        skills: true,
        resumes: true,
        savedJobs: { select: { jobId: true } },
        applications: { select: { jobId: true } },
        freelancerProfile: true,
      },
    });
    userProfile.password = undefined; // ปิดบังรหัสผ่านก่อนส่งกลับ
    res.json(userProfile);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile", details: error.message });
  }
};

// PUT /api/users/me: อัปเดตข้อมูลพื้นฐาน
export const updateMyProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, bio, profileImageUrl } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone, bio, profileImageUrl },
    });
    updatedUser.password = undefined;
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile", details: error.message });
  }
};

// PUT /api/users/me/profile-picture: อัปโหลดรูปโปรไฟล์ใหม่
export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });

    // 1. หา User เก่าเพื่อเอารูปเดิมไปลบ
    const oldUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (oldUser.profileImageUrl) {
      await deleteFileFromDisk(oldUser.profileImageUrl);
    }

    // 2. อัปเดต Path รูปใหม่ลง DB
    const newImageUrl = getWebPath(req.file.path);
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profileImageUrl: newImageUrl },
      select: { profileImageUrl: true },
    });
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// --- Education Controllers ---

export const getMyEducations = async (req, res, next) => {
   try { 
    const educations = await prisma.education.findMany({
      where: { userId: req.user.id },
    });
    res.json(educations);
  } catch (error) { next(error); } 
};

export const addMyEducation = async (req, res, next) => {
  try {
    const { institute, degree, fieldOfStudy, startDate, endDate } = req.body;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: Missing user data" });
    }

    const education = await prisma.education.create({
      data: {
        institute, degree, fieldOfStudy,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        userId: req.user.id,
      },
    });
    res.status(201).json(education);
  } catch (error) {
    next(error);
  }
};

export const updateMyEducation = async (req, res) => {
  try {
    const { institute, degree, fieldOfStudy, startDate, endDate } = req.body;
    // ใช้ updateMany เพื่อตรวจสอบว่าเป็นเจ้าของข้อมูลจริง (security check)
    const updated = await prisma.education.updateMany({
      where: { id: req.params.eduId, userId: req.user.id },
      data: {
        institute, degree, fieldOfStudy,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    if (updated.count === 0) return res.status(404).json({ error: "Not found or unauthorized" });
    res.json({ message: "Education updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update education", details: error.message });
  }
};

export const deleteMyEducation = async (req, res) => {
  try {
    const deleted = await prisma.education.deleteMany({
      where: { id: req.params.eduId, userId: req.user.id },
    });
    if (deleted.count === 0) return res.status(404).json({ error: "Not found or unauthorized" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete education", details: error.message });
  }
};

// --- Experience Controllers ---
// (Logic เหมือน Education แต่เปลี่ยน Model เป็น Experience)

export const getMyExperiences = async (req, res) => {
  const experiences = await prisma.experience.findMany({ where: { userId: req.user.id } });
  res.json(experiences);
};

export const addMyExperience = async (req, res) => {
  try {
    const { title, company, description, startDate, endDate } = req.body;
    const experience = await prisma.experience.create({
      data: {
        title, company, description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        userId: req.user.id,
      },
    });
    res.status(201).json(experience);
  } catch (error) {
    res.status(500).json({ error: "Failed to add experience", details: error.message });
  }
};

export const updateMyExperience = async (req, res) => {
  try {
    const { title, company, description, startDate, endDate } = req.body;
    const updated = await prisma.experience.updateMany({
      where: { id: req.params.expId, userId: req.user.id },
      data: {
        title, company, description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    if (updated.count === 0) return res.status(404).json({ error: "Not found or unauthorized" });
    res.json({ message: "Experience updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update experience", details: error.message });
  }
};

export const deleteMyExperience = async (req, res) => {
  try {
    const deleted = await prisma.experience.deleteMany({
      where: { id: req.params.expId, userId: req.user.id },
    });
    if (deleted.count === 0) return res.status(404).json({ error: "Not found or unauthorized" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete experience", details: error.message });
  }
};

// --- Skills Controllers ---

export const getMySkills = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { skills: true },
    });
    res.json(user.skills || []);
  } catch (error) { next(error); }
};

// อัปเดต Skills (ล้างเก่าใส่ใหม่ตามรายการที่ส่งมา)
export const updateMySkills = async (req, res) => {
  try {
    const { skills } = req.body; 
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: "Invalid format. 'skills' must be an array." });
    }

    const skillOperations = skills.map(skill => ({
      where: { name: skill.name }, 
      create: { name: skill.name },
    }));

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        skills: {
          set: [], // ลบความสัมพันธ์เดิมทั้งหมด
          connectOrCreate: skillOperations, // สร้างใหม่หรือเชื่อมโยงที่มีอยู่
        },
      },
    });

    res.json({ message: "Skills updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update skills", details: error.message });
  }
};

// --- Resume Controllers ---

export const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await prisma.resume.findMany({ where: { userId: req.user.id } });
    res.json(resumes);
  } catch (error) { next(error); }
};

// อัปโหลด Resume (เก็บ Path ลง DB)
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    
    const fileUrl = getWebPath(req.file.path);
    const resume = await prisma.resume.create({
      data: {
        userId: req.user.id,
        filename: req.file.originalname,
        url: fileUrl,
      },
    });
    res.status(201).json({ message: "Resume uploaded", resume });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: { id: req.params.resumeId, userId: req.user.id },
    });
    if (!resume) return res.status(404).json({ error: "Resume not found" });

    await deleteFileFromDisk(resume.url); // ลบไฟล์จริง
    await prisma.resume.delete({ where: { id: resume.id } }); // ลบข้อมูลใน DB
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Job Recommendations ---

// แนะนำงานตาม Skill ที่ User มี
export const getRecommendedJobs = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. ดึง Skills และงานที่เคยสมัครไปแล้ว
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        skills: { select: { id: true } },
        applications: { select: { jobId: true } },
      },
    });

    if (!userProfile || userProfile.skills.length === 0) return res.json([]);

    const skillIds = userProfile.skills.map(s => s.id);
    const appliedJobIds = userProfile.applications.map(app => app.jobId);

    // 2. ค้นหางานที่ตรงกับ Skill และยังไม่เคยสมัคร
    const recommendedJobs = await prisma.job.findMany({
      where: {
        status: 'PUBLISHED',
        id: { notIn: appliedJobIds },
        requiredSkills: { some: { id: { in: skillIds } } },
      },
      include: {
        company: { select: { id: true, companyName: true, logoUrl: true, isVerified: true } },
        mainCategory: true, // แก้ให้ตรงกับ Schema (จากเดิม category)
        subCategory: true,  // เพิ่ม subCategory
        jobType: true,
        province: true,
        district: true,
        requiredSkills: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    res.json(recommendedJobs);
  } catch (error) {
    next(error);
  }
};

// --- Password Management ---

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide old and new passwords.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // ตรวจสอบรหัสเก่า และ Hash รหัสใหม่
    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'รหัสผ่านเดิมไม่ถูกต้อง' });

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (error) {
    next(error);
  }
};

// --- Saved Jobs Controllers ---

export const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: req.user.id },
      include: {
        job: {
          include: {
            company: {
              select: { id: true, companyName: true, logoUrl: true, isVerified: true },
            },
            mainCategory: true,
            subCategory: true,
            jobType: true,
            province: true,
            district: true,
            requiredSkills: true,
          },
        },
      },
      orderBy: { savedAt: "desc" },
    });
    res.json(savedJobs);
  } catch (error) {
    console.error("Error in getSavedJobs:", error);
    res.status(500).json({ error: "Failed to fetch saved jobs", details: error.message });
  }
};

export const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    // เช็กว่ามีงานอยู่จริงไหม
    const jobExists = await prisma.job.findUnique({ where: { id: jobId } });
    if (!jobExists) return res.status(404).json({ error: "Job not found" });
    
    // สร้าง SavedJob (ถ้าซ้ำ Prisma จะ Error P2002)
    const savedJob = await prisma.savedJob.create({
      data: { userId: req.user.id, jobId: jobId },
    });
    res.status(201).json(savedJob);
  } catch (error) {
    if (error.code === "P2002") return res.status(400).json({ error: "Job already saved" });
    res.status(500).json({ error: "Failed to save job", details: error.message });
  }
};

export const unsaveJob = async (req, res) => {
  try {
    const deleted = await prisma.savedJob.deleteMany({
      where: { userId: req.user.id, jobId: req.params.jobId },
    });
    if (deleted.count === 0) return res.status(404).json({ error: "Saved job not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to unsave job", details: error.message });
  }
};