// controllers/freelancer.controller.js
import prisma from "../config.js";
import fs from "fs/promises";
import path from "path";

const getWebPath = (filePath) => {
  if (!filePath) return null;
  if (filePath.includes("uploads")) {
    return filePath.replace(/\\/g, "/").replace("uploads", "/uploads");
  }
  return filePath;
};

const deleteFileFromDisk = async (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith("/uploads")) return;
  const oldPath = path.join(
    process.cwd(),
    fileUrl.replace("/uploads", "uploads")
  );
  try {
    await fs.unlink(oldPath);
  } catch (err) {
    if (err.code !== "ENOENT") console.warn(err.message);
  }
};

// ข้อมูลส่วนตัว (Private)
export const getMyFreelancerProfile = async (req, res) => {
  try {
    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true, phone: true },
        },
        // ✅ เพิ่ม: ดึงงานทั้งหมด (ทั้ง Pending และ Completed) เพื่อไปแสดงในหน้าจัดการ
        completedWorks: {
          orderBy: { completedAt: "desc" },
          include: {
            jobSeeker: {
              select: {
                firstName: true,
                lastName: true,
                profileImageUrl: true,
              },
            },
            review: true,
          },
        },
      },
    });
    // ถ้ายังไม่มี Profile ให้ส่งกลับไปว่างๆ หรือสร้าง Default ชั่วคราว (ไม่ต้อง Error)
    if (!profile) return res.json({});
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// อัปเดตข้อมูล (Private)
export const updateMyFreelancerProfile = async (req, res) => {
  try {
    const {
      professionalTitle,
      bio,
      hourlyRate,
      portfolioUrl,
      yearsOfExperience,
    } = req.body;

    // เตรียมข้อมูลที่จะบันทึก
    const dataToSave = {
      professionalTitle,
      bio,
      portfolioUrl,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
    };

    const updated = await prisma.freelancerProfile.upsert({
      where: { userId: req.user.id },
      update: dataToSave, // ถ้ามีแล้ว -> อัปเดต
      create: {
        // ถ้ายังไม่มี -> สร้างใหม่
        userId: req.user.id,
        ...dataToSave,
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// อัปโหลดรูป (Private)
export const uploadFreelancerProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    const userId = req.user.id;

    // ลบรูปเก่า (ถ้ามี)
    const oldProfile = await prisma.freelancerProfile.findUnique({
      where: { userId },
    });
    if (oldProfile?.profileImageUrl)
      await deleteFileFromDisk(oldProfile.profileImageUrl);

    const newImageUrl = getWebPath(req.file.path);

    const updated = await prisma.freelancerProfile.upsert({
      where: { userId },
      update: { profileImageUrl: newImageUrl },
      create: {
        userId,
        profileImageUrl: newImageUrl,
        professionalTitle: "Freelancer", // ค่า Default กัน Error
        bio: "",
      },
    });
    res.json({ message: "Updated", profileImageUrl: updated.profileImageUrl });
  } catch (error) {
    next(error);
  }
};

// --- ✅ UPDATED: Public Profile (ใช้ FreelancerWork แทน Application) ---
export const getPublicFreelancerProfile = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    // ดึงข้อมูล Freelancer พื้นฐาน
    const freelancer = await prisma.user.findUnique({
      where: { id: freelancerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        profileImageUrl: true,
        freelancerProfile: true,
        skills: true,
        role: true,
      },
    });

    if (!freelancer || freelancer.role !== "FREELANCER")
      return res.status(404).json({ error: "Freelancer not found" });

    // ✅ ดึงงานที่เสร็จแล้วจาก FreelancerWork (เฉพาะที่ COMPLETED)
    const completedWorks = await prisma.freelancerWork.findMany({
      where: {
        freelancerId,
        status: "COMPLETED", // ✅ กรองเฉพาะงานที่เสร็จแล้ว
      },
      include: {
        jobSeeker: {
          select: { firstName: true, lastName: true, profileImageUrl: true },
        },
        review: {
          include: {
            reviewer: {
              select: {
                firstName: true,
                lastName: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    // ✅ คำนวณ Stats และรีวิว
    let totalRating = 0;
    let reviewCount = 0;
    const reviews = [];
    const portfolio = [];

    completedWorks.forEach((work) => {
      // เพิ่มใน Portfolio
      portfolio.push({
        id: work.id,
        title: work.jobTitle,
        description: work.description,
        company: {
          companyName: `${work.jobSeeker.firstName} ${work.jobSeeker.lastName}`,
        },
        requiredSkills: [], // ไม่มีข้อมูล Skills ใน FreelancerWork (ถ้าต้องการให้เพิ่มใน Schema)
      });

      // ถ้ามีรีวิว
      if (work.review) {
        totalRating += work.review.rating;
        reviewCount++;
        reviews.push({
          jobTitle: work.jobTitle,
          rating: work.review.rating,
          comment: work.review.comment,
          reviewerName: `${work.review.reviewer.firstName} ${work.review.reviewer.lastName}`,
          reviewerImage: work.review.reviewer.profileImageUrl,
        });
      }
    });

    const averageRating =
      reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : "0.0";

    res.json({
      ...freelancer,
      freelancerProfile: freelancer.freelancerProfile || {},
      stats: {
        completedJobs: completedWorks.length,
        averageRating: parseFloat(averageRating),
        totalReviews: reviewCount,
      },
      portfolio,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ API ใหม่: ดึงงานที่ Job Seeker จ้าง (My Hires)
// GET /api/freelancers/hires
export const getMyHires = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const works = await prisma.freelancerWork.findMany({
      where: { jobSeekerId: userId },
      include: {
        freelancerProfile: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                email: true,
              },
            },
          },
        },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(works);
  } catch (error) {
    next(error);
  }
};

// ✅ API ใหม่: Freelancer กด "งานเสร็จสิ้น" (หรือสร้างงานใหม่)
// POST /api/freelancers/work/complete
// ✅ API ใหม่: Freelancer สร้างใบเสนอราคา (Offer)
// POST /api/freelancers/work
export const createWork = async (req, res, next) => {
  try {
    const freelancerId = req.user.id; // ต้องเป็น FREELANCER
    const { jobSeekerId, jobTitle, description, price, duration } = req.body;

    if (!jobSeekerId)
      return res.status(400).json({ error: "Job Seeker ID is required" });
    if (!jobTitle)
      return res.status(400).json({ error: "Job Title is required" });
    if (!price) return res.status(400).json({ error: "Price is required" });

    // ตรวจสอบว่า Job Seeker มีตัวตนจริงหรือไม่
    const jobSeeker = await prisma.user.findUnique({
      where: { id: jobSeekerId },
    });

    if (!jobSeeker) {
      return res
        .status(404)
        .json({ error: "ไม่พบข้อมูลผู้จ้าง (Job Seeker ID ไม่ถูกต้อง)" });
    }

    // ตรวจสอบค่า Price และ Duration
    const parsedPrice = parseFloat(price);
    const parsedDuration = parseInt(duration);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res
        .status(400)
        .json({ error: "ราคาไม่ถูกต้อง (ต้องเป็นตัวเลขมากกว่า 0)" });
    }
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      return res
        .status(400)
        .json({ error: "ระยะเวลาไม่ถูกต้อง (ต้องเป็นจำนวนวันมากกว่า 0)" });
    }

    // ตรวจสอบว่ามี FreelancerProfile หรือยัง
    let freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: freelancerId },
    });

    if (!freelancerProfile) {
      freelancerProfile = await prisma.freelancerProfile.create({
        data: {
          userId: freelancerId,
          professionalTitle: "Freelancer",
          bio: "",
        },
      });
    }

    // สร้างงาน (Offer)
    const work = await prisma.freelancerWork.create({
      data: {
        jobSeekerId,
        freelancerId,
        freelancerProfileId: freelancerProfile.id,
        jobTitle,
        description: description || "",
        price: parsedPrice,
        duration: parsedDuration || 1,
        status: "OFFER_PENDING", // เริ่มต้นที่รอการตอบรับ
      },
    });

    res.status(201).json({ message: "ส่งใบเสนอราคาเรียบร้อยแล้ว", work });
  } catch (error) {
    console.error("Error in createWork:", error);
    next(error);
  }
};

// ✅ API ใหม่: อัปเดตสถานะงาน (Accept, Submit, Revision, Complete, Dispute)
// PUT /api/freelancers/work/:workId/status
export const updateWorkStatus = async (req, res, next) => {
  try {
    const { workId } = req.params;
    const { status, comment } = req.body; // status: IN_PROGRESS, SUBMITTED, REVISION_REQUESTED, COMPLETED, DISPUTED
    const userId = req.user.id;

    const work = await prisma.freelancerWork.findUnique({
      where: { id: workId },
    });

    if (!work) return res.status(404).json({ error: "Work not found" });

    // ตรวจสอบสิทธิ์ (ต้องเป็นคู่กรณี)
    if (work.freelancerId !== userId && work.jobSeekerId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    let updateData = { status };

    // --- State Machine Logic ---

    // 1. Accept Offer (Job Seeker Only)
    if (status === "IN_PROGRESS") {
      if (work.jobSeekerId !== userId)
        return res
          .status(403)
          .json({ error: "Only Job Seeker can accept offer" });
      if (work.status !== "OFFER_PENDING")
        return res.status(400).json({ error: "Invalid status transition" });
    }

    // 2. Submit Work (Freelancer Only)
    if (status === "SUBMITTED") {
      if (work.freelancerId !== userId)
        return res
          .status(403)
          .json({ error: "Only Freelancer can submit work" });
      if (work.status !== "IN_PROGRESS" && work.status !== "REVISION_REQUESTED")
        return res.status(400).json({ error: "Invalid status transition" });
    }

    // 3. Request Revision (Job Seeker Only)
    if (status === "REVISION_REQUESTED") {
      if (work.jobSeekerId !== userId)
        return res
          .status(403)
          .json({ error: "Only Job Seeker can request revision" });
      if (work.status !== "SUBMITTED")
        return res.status(400).json({ error: "Invalid status transition" });
      updateData.revisionCount = { increment: 1 };
    }

    // 4. Complete Work (Job Seeker Only)
    if (status === "COMPLETED") {
      if (work.jobSeekerId !== userId)
        return res
          .status(403)
          .json({ error: "Only Job Seeker can approve work" });
      if (work.status !== "SUBMITTED")
        return res.status(400).json({ error: "Invalid status transition" });
      updateData.completedAt = new Date();
    }

    // 5. Dispute (Both)
    if (status === "DISPUTED") {
      // Allow from any active state
    }

    const updatedWork = await prisma.freelancerWork.update({
      where: { id: workId },
      data: updateData,
    });

    res.json({ message: "Status updated", work: updatedWork });
  } catch (error) {
    next(error);
  }
};

// ✅ API ใหม่: ลบงาน
// DELETE /api/freelancers/work/:workId
export const deleteWork = async (req, res, next) => {
  try {
    const { workId } = req.params;

    const work = await prisma.freelancerWork.findUnique({
      where: { id: workId },
    });

    if (!work) return res.status(404).json({ error: "Work not found" });
    if (work.freelancerId !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    await prisma.freelancerWork.delete({
      where: { id: workId },
    });

    res.json({ message: "Work deleted" });
  } catch (error) {
    next(error);
  }
};

// ✅ API ใหม่: Job Seeker ส่งรีวิว/คะแนน
// POST /api/freelancers/:freelancerId/reviews
export const submitReview = async (req, res, next) => {
  try {
    const reviewerId = req.user.id; // Job Seeker
    const { freelancerId } = req.params;
    const { workId, rating, comment } = req.body;

    // ตรวจสอบว่างานนี้มีจริงและเป็นของ Job Seeker คนนี้
    const work = await prisma.freelancerWork.findUnique({
      where: { id: workId },
      include: { freelancerProfile: true },
    });

    if (!work) {
      return res.status(404).json({ error: "Work not found" });
    }

    if (work.jobSeekerId !== reviewerId) {
      return res.status(403).json({ error: "คุณไม่มีสิทธิ์รีวิวงานนี้" });
    }

    // ตรวจสอบว่ารีวิวแล้วหรือยัง
    const existingReview = await prisma.freelancerReview.findUnique({
      where: { workId },
    });

    if (existingReview) {
      return res.status(400).json({ error: "คุณรีวิวงานนี้ไปแล้ว" });
    }

    // สร้างรีวิว
    const review = await prisma.freelancerReview.create({
      data: {
        workId,
        rating: parseInt(rating),
        comment,
        reviewerId,
        reviewedId: freelancerId,
        freelancerProfileId: work.freelancerProfileId,
      },
    });

    res.status(201).json({
      message: "รีวิวสำเร็จแล้ว!",
      review,
    });
  } catch (error) {
    next(error);
  }
};
