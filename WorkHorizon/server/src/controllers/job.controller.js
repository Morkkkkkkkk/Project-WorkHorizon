import prisma from "../config.js";
import fs from "fs/promises"; // (เพิ่ม)
import path from "path"; // (เพิ่ม)

// (Helper)
const getWebPath = (filePath) => {
  if (!filePath) return null;
  return filePath.replace(/\\/g, "/").replace("uploads", "/uploads");
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

// GET /api/jobs (ค้นหางาน - Public)
export const searchJobs = async (req, res) => {
  try {
    // 1. ดึงค่าจาก req.query (สำหรับ Filter และ Pagination)
    const {
      q,
      mainCategoryId, 
      subCategoryId,
      jobTypeId,
      provinceId,
      districtId,
      salaryMin,
      skillIds, // (จะมาในรูปแบบ "id1,id2")
      page = 1,
      limit = 9, // (แสดง 9 งานต่อหน้า)
    } = req.query;

    // 2. ตั้งค่า Pagination
    const currentPage = parseInt(page);
    const take = parseInt(limit);
    const skip = (currentPage - 1) * take;

    // 3. สร้างเงื่อนไข (Where Clause) (จากโค้ดของคุณ)
    const where = {
      status: "PUBLISHED", // (สำคัญ!)
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { company: { companyName: { contains: q } } },
      ]; // (หมายเหตุ: 'mode: insensitive' ใช้ไม่ได้กับ MySQL ครับ)
    }
    if (mainCategoryId) where.mainCategoryId = mainCategoryId;
    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (jobTypeId) where.jobTypeId = jobTypeId;
    if (provinceId) where.provinceId = provinceId;
    if (districtId) where.districtId = districtId;
    if (salaryMin) {
      where.salaryMin = { gte: parseFloat(salaryMin) };
    }
    if (skillIds) {
      const ids = skillIds.split(",");
      where.requiredSkills = {
        some: { id: { in: ids } },
      };
    }

    // 4. (สำคัญ) นับจำนวนงานทั้งหมดที่ตรงเงื่อนไข (สำหรับ Pagination)
    const totalJobs = await prisma.job.count({ where });
    const totalPages = Math.ceil(totalJobs / take);

    // 5. (สำคัญ) ดึงข้อมูลงาน พร้อม Include และ Pagination
    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: {
          select: {
            id: true, // <---ต้องมี ID สำหรับ Link
            companyName: true,
            logoUrl: true,
            isVerified: true,
          },
        }, // (ดีมากครับ)
        subCategory: true,
        mainCategory: true,
        jobType: true,
        province: true,
        district: true,
        requiredSkills: true,
        images: {
           orderBy: { createdAt: 'asc' },  
           take: 2,
          },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    // 6. (สำคัญที่สุด) ส่งข้อมูลกลับใน Format ที่ Frontend (HomePage) ต้องการ
    res.json({
      jobs,
      totalPages,
      currentPage,
      totalJobs,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to search jobs", details: error.message });
  }
};

// GET /api/jobs/:jobId (ดูรายละเอียดงาน - Public)
export const getJobById = async (req, res) => {
  try {
      // (ประกาศ include ที่ถูกต้องไว้ 1 ชุด)
    const includeConfig = {
      company: true,
      subCategory: true, 
      mainCategory: true,
      jobType: true,
      province: true,
      district: true,
      requiredSkills: true,
      images: { orderBy: { createdAt: 'asc' } },
      documents: true
    };

    const job = await prisma.job.findFirst({
      where: {
        id: req.params.jobId,
        status: "PUBLISHED", // ต้อง Published
      },
      include: includeConfig,
    });

    if (!job) {
      // (ลองค้นหาอีกครั้ง ถ้าเป็นเจ้าของ)
      const isOwner = await checkJobOwnership(req.params.jobId, req.user?.id);
      if (isOwner) {
        const ownerJob = await prisma.job.findUnique({
          where: { id: req.params.jobId },
          include: includeConfig,
        });
        return res.json(ownerJob);
      }
      return res.status(404).json({ error: "Job not found or not published" });
    }
    res.json(job);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch job", details: error.message });
  }
};

// 2. เพิ่มฟังก์ชัน uploadJobDocuments (เลียนแบบ uploadJobImages)
export const uploadJobDocuments = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // เช็กความเป็นเจ้าของงาน
    const isOwner = await checkJobOwnership(jobId, req.user.id);
    if (!isOwner) return res.status(403).json({ error: "User unauthorized" });
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No PDF files uploaded." });
    }

    const docPromises = req.files.map(file => {
      const fileUrl = getWebPath(file.path); // ใช้ Helper เดิมแปลง path
      return prisma.jobDocument.create({
        data: {
          name: file.originalname, // เก็บชื่อไฟล์เดิมไว้โชว์
          url: fileUrl,
          jobId: jobId,
        },
      });
    });

    const newDocs = await Promise.all(docPromises);
    res.status(201).json(newDocs);

  } catch (error) {
    next(error);
  }
};

// 3. เพิ่มฟังก์ชันลบเอกสาร
export const deleteJobDocument = async (req, res, next) => {
  try {
    const { docId } = req.params;
    
    // ค้นหาเอกสารและเช็กสิทธิ์
    const doc = await prisma.jobDocument.findFirst({
      where: {
        id: docId,
        job: { company: { userId: req.user.id } }
      }
    });

    if (!doc) return res.status(404).json({ error: "Document not found or unauthorized" });

    // ลบไฟล์จาก Disk
    await deleteFileFromDisk(doc.url);

    // ลบจาก DB
    await prisma.jobDocument.delete({ where: { id: docId } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- (เพิ่มใหม่) Helper สำหรับ SubCategory (ที่ต้องใช้ MainCategoryId) ---
// (สมมติว่า Schema ของ SubCategory มี @@unique([name, mainCategoryId]))
const upsertSubCategory = (data, mainCategoryId) => {
  if (!data || !mainCategoryId) return undefined;

  // Case 1: ผู้ใช้ "เลือก" (ส่ง ID มา)
  if (data.id) {
    return { connect: { id: data.id } };
  }
  // Case 2: ผู้ใช้ "พิมพ์ใหม่" (ส่ง Name มา)
  if (data.name) {
    return {
      connectOrCreate: {
        where: {
          name_mainCategoryId: { // (ชื่อ Unique constraint ใน Schema)
            name: data.name,
            mainCategoryId: mainCategoryId
          }
        },
        create: { 
          name: data.name, 
          mainCategoryId: mainCategoryId 
        },
      },
    };
  }
  return undefined;
}

// --- (เพิ่มใหม่) Helper สำหรับการ Find-or-Create ข้อมูลหลัก ---
const upsertMasterData = (modelName, data, extraData = {}) => {
  if (!data) return undefined; // (ถ้าไม่มีข้อมูลมา)
  // Case 1: ผู้ใช้ "เลือก" (ส่ง ID มา)
  if (data.id) {
    return { connect: { id: data.id } };
  }
  // Case 1: ผู้ใช้ "เลือก" (ส่ง ID มา)
  if (data.name) {
    // ค้นหา หรือ สร้างใหม่
    return {
      connectOrCreate: {
        where: { name: data.name },
        create: { name: data.name, ...extraData },
      },
    };
  }
  return undefined;
};

// --- (เพิ่มใหม่) Helper สำหรับ District (มีเงื่อนไข ProvinceId) ---
const upsertDistrict = (data) => {
  if (!data || !data.provinceId) return undefined;

  if (data.id) {
    return { connect: { id: data.id } };
  }
  if (data.name) {
    return {
      connectOrCreate: {
        // (Unique constraint คือ name + provinceId)
        where: {
          name_provinceId: { name: data.name, provinceId: data.provinceId },
        },
        create: { name: data.name, provinceId: data.provinceId },
      },
    };
  }
  return undefined;
};

// --- (เพิ่มใหม่) Helper สำหรับ Skills (Many-to-Many) ---
const getSkillsForCreate = (skillsData = []) => {
  if (!skillsData || skillsData.length === 0) return undefined;

  // (เมื่อ "สร้าง" เราใช้ connectOrCreate กับทุกรายการ)
  const connectOrCreate = skillsData.map(skill => {
    // (ถ้ามี ID, หาด้วย ID; ถ้าไม่มี, หาด้วย Name)
    const where = skill.id ? { id: skill.id } : { name: skill.name };
    return {
      where: where,
      create: { name: skill.name },
    };
  });

  return { connectOrCreate };
};

// --- Helper "อัปเดต" Skills (สำหรับ UpdateJob) ---
const getSkillsForUpdate = (skillsData = []) => {
  if (!skillsData) return undefined;
  // (เมื่อ "อัปเดต" เราใช้ 'set' (ลบของเก่า) + 'connectOrCreate' (เพิ่มของใหม่))
  return {
    set: skillsData.filter(s => s.id).map(s => ({ id: s.id })), // เชื่อมอันที่มี ID
    connectOrCreate: skillsData.filter(s => !s.id && s.name).map(s => ({
        // สร้างอันที่พิมพ์ใหม่
        where: { name: s.name },
        create: { name: s.name },
      })),
  };
};

// POST /api/jobs (สร้างงาน - Employer)
export const createJob = async (req, res) => {
  try {
    // ✅ 1. Destructure fields ทั้งหมดจาก req.body
    const {
      mainCategory, 
      subCategory,
      jobType,
      province,
      district,
      skills,
      responsibilities, 
      benefits,
      workingHours,
      location,
      isSalaryNegotiable,
      salaryMin, // รับค่า
      salaryMax, // รับค่า
      ...restOfJobData // title, description, status, ฯลฯ
    } = req.body; 

    // ... (Company check และ Validation สำหรับ mainCategory เหมือนเดิม) ...
    const company = await prisma.company.findUnique({ where: { userId: req.user.id }, select: { id: true, isVerified: true }, });
    if (!company) { return res.status(400).json({ error: "Employer must have a company profile to post a job." }); }
    if (!company.isVerified) { return res.status(403).json({ error: "Your company profile is not yet verified by an admin. Cannot post jobs."}) }

    const mainCatId = mainCategory?.id;
    if (!mainCatId) { return res.status(400).json({ error: "Main Category is required." }); }

    // 2. Safe Salary Logic
    const finalSalaryMin = (isSalaryNegotiable || !salaryMin) ? null : parseFloat(salaryMin);
    const finalSalaryMax = (isSalaryNegotiable || !salaryMax) ? null : parseFloat(salaryMax);

    // ✅ 3. สร้าง Object สำหรับ Relations ที่สะอาด
    const relations = {};
    
    // Required Relation
    relations.company = { connect: { id: company.id } };
    relations.mainCategory = { connect: { id: mainCatId } }; 

    // Optional Relations: ใช้ Helper และเช็คว่า Helper คืนค่ากลับมาหรือไม่
    const subCatRelation = upsertSubCategory(subCategory, mainCatId);
    if (subCatRelation) relations.subCategory = subCatRelation;

    const jobTypeRelation = upsertMasterData("jobType", jobType);
    if (jobTypeRelation) relations.jobType = jobTypeRelation;

    const provinceRelation = upsertMasterData("province", province);
    if (provinceRelation) relations.province = provinceRelation;
    
    const districtRelation = upsertDistrict(district);
    if (districtRelation) relations.district = districtRelation;

    const skillsRelation = getSkillsForCreate(skills);
    if (skillsRelation) relations.requiredSkills = skillsRelation;

    // 4. Create Job โดย Spread Object ของ Data และ Relations
    const job = await prisma.job.create({
      data: {
        ...restOfJobData, 
        
        // New Text Fields
        responsibilities: responsibilities || null,
        benefits: benefits || null,
        workingHours: workingHours || null,
        location: location || null,
        isSalaryNegotiable: !!isSalaryNegotiable,

        // Salary Fields
        salaryMin: finalSalaryMin,
        salaryMax: finalSalaryMax,
        
        ...relations, // ✅ Spread the clean relations object here
        
        status: restOfJobData.status || "DRAFT",
      },
    });
    res.status(201).json(job);
  } catch (error) {
    console.error("[createJob Error]", error);
    res
      .status(500)
      .json({ error: "Failed to create job", details: error.message });
  }
};

// --- Helper function: เช็กว่า Employer เป็นเจ้าของงานนี้หรือไม่ ---
const checkJobOwnership = async (jobId, userId) => {
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      company: { userId: userId }, // เช็กว่า userId ของ company ตรงกับ user ที่ล็อกอิน
    },
    select: { id: true },
  });
  return !!job; // return true ถ้าเจองาน
};

// PUT /api/jobs/:jobId (แก้ไขงาน - Employer)
export const updateJob = async (req, res) => {
  try {
    // ... (Ownership check เหมือนเดิม) ...

    const {
      mainCategory,
      subCategory,
      jobType,
      province,
      district,
      skills,
      responsibilities, 
      benefits,
      workingHours,
      location,
      isSalaryNegotiable,
      salaryMin, // รับค่า
      salaryMax, // รับค่า
      ...restOfJobData
    } = req.body;

    const mainCatId = mainCategory?.id;
    if (!mainCatId) { return res.status(400).json({ error: "Main Category is required." }); }

    // 2. Safe Salary Logic
    const finalSalaryMin = (isSalaryNegotiable || !salaryMin) ? null : parseFloat(salaryMin);
    const finalSalaryMax = (isSalaryNegotiable || !salaryMax) ? null : parseFloat(salaryMax);

    // ✅ 3. สร้าง Object สำหรับ Relations
    const relations = {
        mainCategory: { connect: { id: mainCatId } },
    };
    
    // Optional Relations
    const subCatRelation = upsertSubCategory(subCategory, mainCatId);
    if (subCatRelation) relations.subCategory = subCatRelation; 

    const jobTypeRelation = upsertMasterData("jobType", jobType);
    if (jobTypeRelation) relations.jobType = jobTypeRelation;

    const provinceRelation = upsertMasterData("province", province);
    if (provinceRelation) relations.province = provinceRelation;
    
    const districtRelation = upsertDistrict(district);
    if (districtRelation) relations.district = districtRelation;

    const skillsRelation = getSkillsForUpdate(skills);
    if (skillsRelation) relations.requiredSkills = skillsRelation;

    // 4. Update Job
    const updatedJob = await prisma.job.update({
      where: { id: req.params.jobId },
      data: {
        ...restOfJobData,
        
        // New Text Fields
        responsibilities: responsibilities || null,
        benefits: benefits || null,
        workingHours: workingHours || null,
        location: location || null,
        isSalaryNegotiable: !!isSalaryNegotiable,

        // Salary Fields
        salaryMin: finalSalaryMin,
        salaryMax: finalSalaryMax,

        ...relations, // ✅ Spread the clean relations object here
      },
    });
    res.json(updatedJob);
  } catch (error) {
    console.error("[updateJob Error]", error);
    res
      .status(500)
      .json({ error: "Failed to update job", details: error.message });
  }
};

// DELETE /api/jobs/:jobId (ลบงาน - Employer)
export const deleteJob = async (req, res) => {
  try {
    const isOwner = await checkJobOwnership(req.params.jobId, req.user.id);
    if (!isOwner) {
      return res
        .status(403)
        .json({ error: "User unauthorized to delete this job" });
    }

    // (Prisma จะลบ Relation ที่เกี่ยวข้องให้ (เช่น Application) เพราะตั้ง onDelete: Cascade)
    await prisma.job.delete({
      where: { id: req.params.jobId },
    });
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete job", details: error.message });
  }
};

// PATCH /api/jobs/:jobId/status (เปลี่ยนสถานะงาน - Employer)
export const updateJobStatus = async (req, res) => {
  try {
    const isOwner = await checkJobOwnership(req.params.jobId, req.user.id);
    if (!isOwner) {
      return res
        .status(403)
        .json({ error: "User unauthorized to update this job" });
    }

    const { status } = req.body; // รับสถานะ (DRAFT, PUBLISHED, ARCHIVED, FILLED)

    // (ควร Validate `status` ว่าตรงกับ Enum)
    const updatedJob = await prisma.job.update({
      where: { id: req.params.jobId },
      data: { status: status },
    });
    res.json(updatedJob);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update job status", details: error.message });
  }
};

// GET /api/companies/me/jobs (Controller นี้ถูกเรียกจาก company.routes)
export const getMyCompanyJobs = async (req, res) => {
  try {
    // 1. หา CompanyId
    const company = await prisma.company.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // 2. หางานทั้งหมดของบริษัทนี้
    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: {
        _count: {
          // นับจำนวนใบสมัคร
          select: { applications: true },
        },
        subCategory: true, 
        mainCategory: true,
        jobType: true,
        province: true,
        district: true,
        requiredSkills: true,
      },
      orderBy: { createdAt: "desc" },
    });
    // (อัปเดต) (แปลง _count)
    const formattedJobs = jobs.map((job) => ({
      ...job,
      applications: job._count.applications,
    }));
    res.json(formattedJobs);
  } catch (error) {
    res
    .status(500)
    .json({ error: "Failed to fetch company jobs", details: error.message });
  }
};

// POST /api/jobs/:jobId/images
export const uploadJobImages = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // 1. เช็กว่าเป็นเจ้าของงาน
    const isOwner = await checkJobOwnership(jobId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({ error: "User unauthorized" });
    }
    
    // 2. เช็กว่ามีไฟล์หรือไม่
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded." });
    }

    // 3. สร้างรายการรูปภาพ
    const imagePromises = req.files.map(file => {
      const imageUrl = getWebPath(file.path);
      return prisma.jobImage.create({
        data: {
          url: imageUrl,
          jobId: jobId,
        },
      });
    });

    const newImages = await Promise.all(imagePromises);
    res.status(201).json(newImages);

  } catch (error) {
    next(error);
  }
};

// DELETE /api/jobs/images/:imageId
export const deleteJobImage = async (req, res, next) => {
  try {
    const { imageId } = req.params;

    // 1. ค้นหารูป และเช็กสิทธิ์ความเป็นเจ้าของ
    const image = await prisma.jobImage.findFirst({
      where: {
        id: imageId,
        job: { // (เช็กว่า งาน(job) ของรูปนี้ เป็นของ บริษัท(company) ที่มี User ID ตรงกับคนที่ล็อกอิน)
          company: {
            userId: req.user.id
          }
        }
      }
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found or user unauthorized" });
    }

    // 2. ลบไฟล์ออกจาก Disk
    await deleteFileFromDisk(image.url);

    // 3. ลบออกจาก Database
    await prisma.jobImage.delete({
      where: { id: imageId }
    });

    res.status(204).send(); // (No Content)
  } catch (error) {
    next(error);
  }
};