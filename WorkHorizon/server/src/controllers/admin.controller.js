import prisma from "../config.js";
import { hashPassword } from "../utils/hash.js";

// --- PATCH /api/admin/companies/:companyId/verify ---
export const verifyCompany = async (req, res) => {
  const { companyId } = req.params;
  const { isVerified } = req.body; // (เช่น { isVerified: true })

  try {
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { isVerified: isVerified },
    });
    res.json(updatedCompany);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to update company verification",
        details: error.message,
      });
  }
};

// ---  PATCH /api/admin/users/:userId/status ---
export const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body; // รับค่า 'ACTIVE', 'SUSPENDED', หรือ 'BANNED'

  // Validate ค่าที่ส่งมา
  const validStatuses = ['ACTIVE', 'SUSPENDED', 'BANNED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  // ป้องกัน Admin แบนตัวเอง
  if (req.user.id === userId) {
    return res.status(400).json({ error: "Admin cannot change their own status" });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: status },
      select: { id: true, email: true, status: true } // ส่งกลับเฉพาะที่จำเป็น
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user status", details: error.message });
  }
};

// --- GET /api/admin/companies ---
// export const getAdminCompanies = async (req, res) => {
//   try {
//     const companies = await prisma.company.findMany({
//       orderBy: { createdAt: 'desc' },
//       include: {
//         user: { // (ดึงข้อมูลเจ้าของ)
//           select: {
//             email: true,
//             firstName: true,
//             lastName: true,
//           }
//         }
//       }
//     });
//     res.json(companies);
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to get companies', details: error.message });
//   }
// };

export const getAdminCompanies = async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        user: true,
        industry: true,
      },
    });
    res.json(companies);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get companies", details: error.message });
  }
};

// --- GET /api/admin/users ---
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        profileImageUrl: true,
        status: true,
        company: {
          // (ดึงบริษัทที่เชื่อมโยง)
          select: {
            id: true,
            companyName: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get users", details: error.message });
  }
};

// --- DELETE /api/admin/users/:userId ---
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  // (ป้องกัน Admin ลบตัวเอง)
  if (req.user.id === userId) {
    return res.status(400).json({ error: "Admin cannot delete themselves" });
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete user", details: error.message });
  }
};

// --- GET /api/admin/jobs ---
export const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {}; // (Admin ดึงทั้งหมด, ไม่กรอง Status)

    const totalJobs = await prisma.job.count({ where });
    const totalPages = Math.ceil(totalJobs / limit);

    const jobs = await prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        company: { select: { companyName: true } },
        // (เพิ่ม) (Include ข้อมูลที่ JobForm ต้องการ)
        mainCategory: true,
        subCategory: true,
        jobType: true,
        province: true,
        district: true,
        requiredSkills: true,
      },
    });
    // (อัปเดต) (ส่งข้อมูล Pagination กลับไป)
    res.json({
      jobs,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch jobs", details: error.message });
  }
};

// --- DELETE /api/admin/jobs/:jobId ---
export const adminDeleteJob = async (req, res) => {
  try {
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
 
// --- PUT /api/admin/jobs/:jobId (Admin แก้ไขงาน) ---
export const adminUpdateJob = async (req, res, next) => {
  try {
    const { 
        mainCategory, 
        subCategory,
        jobType,
        province,
        district,
        skills,
        salaryMin, 
        salaryMax,
        ...restOfJobData // title, description, status, etc.
    } = req.body;

    // (Admin ไม่ต้องเช็ก Ownership)
    // [FIX/IMPROVEMENT] Logic to handle relation updates (assuming only 'connect' is needed for Admin)
    const relations = {};
    if (mainCategory?.id) relations.mainCategory = { connect: { id: mainCategory.id } };
    if (jobType?.id) relations.jobType = { connect: { id: jobType.id } };
    if (province?.id) relations.province = { connect: { id: province.id } };
    
    // Handle optional fields that need explicit null/disconnect
    if (subCategory?.id) relations.subCategory = { connect: { id: subCategory.id } };
    else if (subCategory === null) relations.subCategory = { disconnect: true };

    if (district?.id) relations.district = { connect: { id: district.id } };
    else if (district === null) relations.district = { disconnect: true };
    
    // Note: Skill management needs 'set' or 'connect/disconnect'.
    const skillsToUpdate = skills && Array.isArray(skills) 
        ? { set: skills.filter(s => s.id).map(s => ({ id: s.id })) }
        : { set: [] }; // Assume Admin only connects existing skills by ID

    const updatedJob = await prisma.job.update({
      where: { id: req.params.jobId },
      data: {
        ...restOfJobData,
        // (แปลง salary ที่อาจจะว่าง)
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        
        ...relations, // [FIX] Spread relation updates
        requiredSkills: skillsToUpdate, // [FIX] Use set for skills
      },
    });
    res.json(updatedJob);
  } catch (error) {
    next(error);
  }
};

// --- POST /api/admin/users (Admin สร้างผู้ใช้) ---
export const adminCreateUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields." });
    }

    // 1. เช็กอีเมลซ้ำ
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use." });
    }

    // 2. เข้ารหัสรหัสผ่าน
    const hashedPassword = await hashPassword(password);

    // 3. สร้างผู้ใช้
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

    // [FIX] เพิ่ม Logic สร้าง Company/FreelancerProfile สำหรับ Admin
    if (role === "EMPLOYER") {
      await prisma.company.create({
        data: {
          userId: user.id, 
          companyName: `${firstName}`, 
          description: "กรุณาอัปเดตรายละเอียดบริษัท", 
          isVerified: false,
        },
      });
    }

    if (role === "FREELANCER") {
      await prisma.freelancerProfile.create({
        data: {
          userId: user.id,
          professionalTitle: "Freelancer", 
          bio: "ยินดีต้อนรับ! กรุณาอัปเดตประวัติและผลงานของคุณ", 
        },
      });
    }

    user.password = undefined;
    res.status(201).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create user", details: error.message });
  }
};

// --- PUT /api/admin/users/:userId (Admin แก้ไขผู้ใช้) ---
export const adminUpdateUser = async (req, res, next) => {
  const { userId } = req.params;
  const { email, firstName, lastName, phone, role, password } = req.body;

  try {
    const dataToUpdate = {
      email,
      firstName,
      lastName,
      phone,
      role,
    };

    // (ถ้ามีการส่งรหัสผ่านใหม่มาด้วย ให้เข้ารหัส)
    if (password) {
      dataToUpdate.password = await hashPassword(password);
    }

    // (เช็กว่า email ที่แก้ไข จะไม่ซ้ำกับคนอื่น)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== userId) {
      return res
        .status(400)
        .json({ error: "Email already in use by another user." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    updatedUser.password = undefined;
    res.json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update user", details: error.message });
  }
};

// --- GET /api/admin/stats (สำหรับ Dashboard) ---
export const getAdminStats = async (req, res, next) => {
  try {
    // (ตั้งค่า 7 วันย้อนหลัง)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. นับข้อมูลทั้งหมด (ใช้ .count() เพื่อความรวดเร็ว)
    const totalUsers = await prisma.user.count();
    const totalJobs = await prisma.job.count();
    const totalCompanies = await prisma.company.count();
    const pendingVerification = await prisma.company.count({
      where: { isVerified: false },
    });
    

    // 2. นับข้อมูลใหม่ (7 วันล่าสุด)
    const newUsers = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });
    const newApplications = await prisma.application.count({
      where: { appliedAt: { gte: sevenDaysAgo } },
    });

    // 2. (ใหม่) User Role Distribution (สำหรับ Pie Chart)
    const userRoles = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    // 3. (ใหม่) Job Status Distribution (สำหรับ Bar/Pie Chart)
    const jobStatus = await prisma.job.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // 4. (ใหม่) 5 งานล่าสุด (สำหรับ Recent Jobs Table)
    const recentJobs = await prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { companyName: true, logoUrl: true } },
        jobType: true,
      }
    });

    res.json({
      totalUsers,
      totalJobs,
      totalCompanies,
      pendingVerification,
      newUsers,
      newApplications,
      // ส่งข้อมูลใหม่กลับไป
      charts: {
        userRoles: userRoles.map(r => ({ name: r.role, value: r._count.role })),
        jobStatus: jobStatus.map(s => ({ name: s.status, value: s._count.status })),
      },
      recentJobs
    });
  } catch (error) {
    next(error);
  }
};

// --- Master Data CRUD Helper ---
const createMasterData = (modelName) => async (req, res, next) => {
  try {
    const { name, iconCode, mainCategoryId } = req.body;
    if (!name || typeof name !== "string")
      return res
        .status(400)
        .json({ error: "Name is required and must be a string." });

    const exists = await prisma[modelName].findFirst({ where: { name } });
    if (exists)
      return res.status(400).json({ error: `${modelName} already exists` });

    const data = { name };
    if (modelName === "SubCategory" && iconCode) {
      if (iconCode) data.iconCode = iconCode;
      if (!mainCategoryId) {
        // (บังคับว่า SubCategory ต้องมี MainCategory)
        return res
          .status(400)
          .json({ error: "mainCategoryId is required for SubCategory" });
      }
      data.mainCategoryId = mainCategoryId;
    }

    const item = await prisma[modelName].create({ data });
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const updateMasterData = (modelName) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, iconCode, mainCategoryId } = req.body;
    if (!name || typeof name !== "string")
      return res
        .status(400)
        .json({ error: "Name is required and must be a string." });

    const exists = await prisma[modelName].findFirst({
      where: { name, NOT: { id } },
    });
    if (exists)
      return res
        .status(400)
        .json({ error: `${modelName} name already in use` });

    const data = { name };
    if (modelName === "SubCategory") {
      if (iconCode !== undefined) data.iconCode = iconCode || null;
      if (!mainCategoryId) {
        // (บังคับ)
        return res
          .status(400)
          .json({ error: "mainCategoryId is required for SubCategory" });
      }
      data.mainCategoryId = mainCategoryId;
    }

    const item = await prisma[modelName].update({ where: { id }, data }); // (อัปเดต)
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const deleteMasterData = (modelName) => async (req, res, next) => {
  try {
    await prisma[modelName].delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2003") {
      return res
        .status(400)
        .json({ error: `Cannot delete ${modelName}, it is still in use.` });
    }
    next(error);
  }
};

// --- Export CRUD สำหรับแต่ละ Master Data ---
export const adminCreateSubCategory = createMasterData("SubCategory");
export const adminUpdateSubCategory = updateMasterData("SubCategory");
export const adminDeleteSubCategory = deleteMasterData("SubCategory");

export const adminCreateJobType = createMasterData("JobType");
export const adminUpdateJobType = updateMasterData("JobType");
export const adminDeleteJobType = deleteMasterData("JobType");

export const adminCreateIndustry = createMasterData("Industry");
export const adminUpdateIndustry = updateMasterData("Industry");
export const adminDeleteIndustry = deleteMasterData("Industry");

export const adminCreateSkill = createMasterData("Skill");
export const adminUpdateSkill = updateMasterData("Skill");
export const adminDeleteSkill = deleteMasterData("Skill");

export const adminCreateProvince = createMasterData("Province");
export const adminUpdateProvince = updateMasterData("Province");
export const adminDeleteProvince = deleteMasterData("Province");

export const adminCreateDistrict = async (req, res) => {
  try {
    const { name, provinceId } = req.body;
    if (!name || !provinceId) {
      return res
        .status(400)
        .json({ error: "Name and provinceId are required" });
    }

    const district = await prisma.district.create({
      data: {
        name,
        province: { connect: { id: provinceId } }, // 🔑 ต้อง connect relation
      },
    });

    res.json(district);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
export const adminUpdateDistrict = updateMasterData("District");
export const adminDeleteDistrict = deleteMasterData("District");

export const adminGetSubCategories = async (req, res) => {
  try {
    const categories = await prisma.subCategory.findMany({
      include: { mainCategory: { select: { id: true, name: true } } }
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// skill
export const adminGetSkills = async (req, res) => {
  try {
    const skills = await prisma.skill.findMany();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// job types
export const adminGetJobTypes = async (req, res) => {
  try {
    const jobTypes = await prisma.jobType.findMany();
    res.json(jobTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// industries
export const adminGetIndustries = async (req, res) => {
  try {
    const industries = await prisma.industry.findMany();
    res.json(industries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// provinces
export const adminGetProvinces = async (req, res) => {
  try {
    const provinces = await prisma.province.findMany();
    res.json(provinces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// districts
export const adminGetDistricts = async (req, res) => {
  try {
    const districts = await prisma.district.findMany();
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- 🏦 ADMIN: จัดการการถอนเงิน ---

// GET /api/admin/withdrawals -> ดูรายการรอถอน
export const getWithdrawalRequests = async (req, res) => {
   try {
     const withdrawals = await prisma.transaction.findMany({
       where: { 
         method: 'BANK_TRANSFER',
         receiverId: null, // เป็นการถอนเงินออก
         status: 'PENDING' // เฉพาะที่รอตรวจสอบ
       },
       include: {
         payer: { 
           select: { id: true, firstName: true, lastName: true, email: true, phone: true, walletBalance: true } 
         }
       },
       orderBy: { createdAt: 'asc' }
     });
     res.json(withdrawals);
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
};

// PATCH /api/admin/transactions/:transactionId/withdraw -> อนุมัติ/ปฏิเสธ
export const approveWithdrawal = async (req, res) => {
  const { transactionId } = req.params;
  const { action } = req.body; // ต้องส่งมาว่า 'APPROVE' หรือ 'REJECT'

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction || transaction.status !== 'PENDING') {
      return res.status(400).json({ error: "Transaction not found or not pending" });
    }

    await prisma.$transaction(async (tx) => {
      if (action === 'APPROVE') {
        // ✅ อนุมัติ: เปลี่ยนสถานะเป็น SUCCESS 
        // (ในชีวิตจริง Admin ต้องไปโอนเงินผ่านแอปธนาคารให้ลูกค้าก่อน แล้วค่อยมากดปุ่มนี้)
        await tx.transaction.update({
          where: { id: transactionId },
          data: { status: 'SUCCESS' }
        });

      } else if (action === 'REJECT') {
        // ❌ ปฏิเสธ: เปลี่ยนสถานะเป็น FAILED และ **คืนเงินให้ User**
        await tx.transaction.update({
          where: { id: transactionId },
          data: { status: 'FAILED' }
        });

        await tx.user.update({
          where: { id: transaction.payerId },
          data: { walletBalance: { increment: transaction.amount } }
        });
      }
    });

    res.json({ message: `Withdrawal ${action}D successfully` });

  } catch (error) {
    res.status(500).json({ error: "Operation failed", details: error.message });
  }
};