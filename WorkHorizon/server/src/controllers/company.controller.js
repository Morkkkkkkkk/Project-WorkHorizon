import prisma from "../config.js";
import fs from "fs/promises";
import path from "path";

// (Helper)
const getWebPath = (filePath) => {
  if (!filePath) return null;
  if (filePath.includes("uploads")) {
    return filePath.replace(/\\/g, "/").replace("uploads", "/uploads");
  }
  return filePath;
};

// (Helper)
const deleteFileFromDisk = async (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith("/uploads")) return;
  const oldPath = path.join(
    process.cwd(),
    fileUrl.replace("/uploads", "uploads")
  );
  try {
    await fs.unlink(oldPath);
  } catch (err) {
    console.warn(`Failed to delete old file: ${oldPath}`, err.message);
  }
};

// (ฟังก์ชันนี้ไม่ควรถูกเรียกแล้ว แต่มีไว้เผื่อ)
export const createCompany = async (req, res) => {
  try {
    const existingCompany = await prisma.company.findUnique({
      where: { userId: req.user.id },
    });
    if (existingCompany) {
      return res
        .status(400)
        .json({ error: "User already has a company profile." });
    }
    const { industryId, ...rest } = req.body;
    const company = await prisma.company.create({
      data: {
      ...rest,
        industryId: industryId || null, // (ถ้า industryId เป็น "" จะถูกแปลงเป็น null)
        userId: req.user.id, 
      },
    });
    res.status(201).json(company);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create company", details: error.message });
  }
};

// (แก้ไข) GET /api/companies/me
export const getMyCompany = async (req, res) => {
  try {
    // --- (DEBUG 4) ---
    //console.log(
    //  "[getMyCompany] เริ่มทำงาน, ค้นหาบริษัทสำหรับ User ID:",
    //  req.user.id
   // );
    // --- (จบ DEBUG 4) ---

    // (ค้นหาด้วย userId ของคนที่ Login)
    const company = await prisma.company.findUnique({
      where: { userId: req.user.id },
      include: { industry: true },
    });
    if (!company) {

      // --- (DEBUG 5) ---
      //console.warn(
     //   `[getMyCompany] "หาไม่เจอ" (404) สำหรับ User ID: ${req.user.id}`
     // );
      // --- (จบ DEBUG 5) ---

      return res.status(404).json({ error: "Company profile not found." });
    }
    res.json(company);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch company", details: error.message });
  }
};

// (แก้ไข) PUT /api/companies/me (อัปเดตบริษัทของฉัน)
export const updateMyCompany = async (req, res) => {
  try {
    const { userId, industryId, ...dataToUpdate } = req.body;

    const updatedCompany = await prisma.company.updateMany({
      where: { userId: req.user.id },
      data: {
        ...dataToUpdate,
        industryId: industryId || null, // (ถ้า industryId เป็น "" จะถูกแปลงเป็น null)
      },
    });
    if (updatedCompany.count === 0) {
      return res
        .status(404)
        .json({ error: "Company not found or user unauthorized" });
    }
    res.json({ message: "Company profile updated" });
  } catch (error) {
    console.error('[updateMyCompany Error]', error);
    res.status(500).json({ error: "Failed to update company", details: error.message });
  }
};

// (แก้ไข) PUT /api/companies/me/logo
export const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const oldCompany = await prisma.company.findUnique({
      where: { userId: req.user.id },
    });

    if (!oldCompany) {
      return res
        .status(404)
        .json({
          error: "Company profile not found. Please create profile first.",
        });
    }

    await deleteFileFromDisk(oldCompany.logoUrl);

    const newImageUrl = getWebPath(req.file.path);
    const updatedCompany = await prisma.company.update({
      where: { userId: req.user.id },
      data: { logoUrl: newImageUrl },
      select: { logoUrl: true },
    });

    res.json(updatedCompany);
  } catch (error) {
    next(error);
  }
};

// GET /api/companies/:companyId (Public)
export const getPublicCompany = async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.companyId },
      include: {
        jobs: {
          where: { status: "PUBLISHED" },
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
                isVerified: true,
              },
            },
            mainCategory: true, 
            subCategory: true,
            jobType: true,
            province: true,
            district: true,
            requiredSkills: true,
            images: { orderBy: { createdAt: 'asc' } },
          },
        },
        industry: true,
      },
    });

    if (!company || !company.isVerified) {
      return res
        .status(404)
        .json({ error: "Company not found or not verified." });
    }
    res.json(company);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch company", details: error.message });
  }
};
