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
            disputeTicket: true,
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
      promptPayNumber,
    } = req.body;

    // เตรียมข้อมูลที่จะบันทึก
    const dataToSave = {
      professionalTitle,
      bio,
      portfolioUrl,
      promptPayNumber,
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
          select: { // ✅ เปลี่ยนจาก include เป็น select เพื่อระบุฟิลด์
            id: true,
            professionalTitle: true,
            promptPayNumber: true, // ⭐ บรรทัดนี้สำคัญที่สุด! ต้องมีอันนี้
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
        disputeTicket: true,
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
    const { jobSeekerId, jobTitle, description, price, duration, serviceConversationId } = req.body;

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
        serviceConversationId: serviceConversationId
      },
    });

    // Send System Message
    await sendSystemMessageToPair(
      freelancerId,
      jobSeekerId,
      `📄 คุณได้รับใบเสนอราคาใหม่: "${jobTitle}"\nราคา: ฿${parsedPrice.toLocaleString()}\nระยะเวลา: ${parsedDuration} วัน`,
      freelancerId
    );

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
    // ✅ 1. ดึง Socket IO instance
    const io = req.app.get("io");
    
    const { workId } = req.params;
    const { status } = req.body; 
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
    let systemMsg = null;
    const actorName = req.user.firstName;

    // --- State Machine Logic ---

    // 1. Accept Offer / Start Work (เริ่มงาน)
    if (status === "IN_PROGRESS") {
       if (work.freelancerId === userId) {
          if (!work.isPayerPaid) {
             return res.status(400).json({ error: "ไม่สามารถเริ่มงานได้ เนื่องจากผู้ว่าจ้างยังไม่ได้ชำระเงิน" });
          }
          systemMsg = `[STATUS:IN_PROGRESS] 🚀 เริ่มดำเนินการแล้ว|ฟรีแลนซ์ยืนยันรับงานและเริ่มลงมือทำโปรเจกต์`;
       } 
       else if (work.jobSeekerId === userId) {
          systemMsg = `[STATUS:IN_PROGRESS] 🚀 เริ่มดำเนินการแล้ว|ผู้ว่าจ้างยืนยันให้เริ่มงานได้`;
       } 
       else {
          return res.status(403).json({ error: "คุณไม่มีสิทธิ์เปลี่ยนสถานะนี้" });
       }
    }

    // 2. Submit Work (ส่งงาน)
    if (status === "SUBMITTED") {
        if (work.freelancerId !== userId) return res.status(403).json({ error: "Only Freelancer can submit work" });
        systemMsg = `[STATUS:SUBMITTED] 📦 ส่งมอบงานแล้ว|ฟรีแลนซ์ได้ส่งมอบงานให้คุณตรวจสอบ กรุณาตรวจเช็คความเรียบร้อย`;
    }

    // 3. Request Revision (ขอแก้ไข)
    if (status === "REVISION_REQUESTED") {
        if (work.jobSeekerId !== userId) return res.status(403).json({ error: "Only Job Seeker can request revision" });
        updateData.revisionCount = { increment: 1 };
        systemMsg = `[STATUS:REVISION_REQUESTED] 📝 แจ้งแก้ไขงาน|ผู้ว่าจ้างต้องการให้ปรับปรุงรายละเอียดงานเพิ่มเติม`;
    }

    // 4. Complete Work (จบงาน)
    if (status === "COMPLETED") {
      if (work.jobSeekerId !== userId)
        return res.status(403).json({ error: "Only Job Seeker can approve work" });
      
      const completeMsg = `[STATUS:COMPLETED] 🎉 อนุมัติงานสำเร็จ|งานเสร็จสิ้นสมบูรณ์ ระบบได้โอนเงินให้ฟรีแลนซ์เรียบร้อยแล้ว`;

      // ใช้ Transaction เพื่อความปลอดภัย: จบงาน + โอนเงิน
      await prisma.$transaction(async (tx) => {
         await tx.freelancerWork.update({
            where: { id: workId },
            data: { status: "COMPLETED", completedAt: new Date() }
         });

         if (work.price && work.price > 0) {
            await tx.user.update({
              where: { id: work.freelancerId },
              data: { walletBalance: { increment: work.price } }
            });

            await tx.transaction.create({
               data: {
                 amount: work.price,
                 status: "SUCCESS",
                 method: "WALLET",
                 payerId: work.jobSeekerId,
                 receiverId: work.freelancerId,
                 workId: workId,
                 gatewayRef: `PAYOUT-${workId}`
               }
            });
         }
      });

      // บันทึกข้อความลง DB
      await sendSystemMessageToPair(work.freelancerId, work.jobSeekerId, completeMsg, userId);
      
      // ✅ 2. Real-time Trigger (กรณีจบงาน)
      if (work.serviceConversationId) {
        // แจ้งเปลี่ยนสถานะปุ่ม
        io.to(work.serviceConversationId).emit("work_status_updated", {
            workId: workId,
            status: "COMPLETED"
        });
        // ส่งข้อความแจ้งเตือนเข้าแชททันที
        io.to(work.serviceConversationId).emit("receive_message", {
            id: 'sys-end-' + Date.now(),
            content: completeMsg,
            senderId: userId,
            createdAt: new Date().toISOString(),
            serviceConversationId: work.serviceConversationId,
        });
      }
      
      return res.json({ message: "Work completed and payment released" });
    }

    // --- กรณีสถานะอื่นๆ (IN_PROGRESS, SUBMITTED, REVISION) ---
    const updatedWork = await prisma.freelancerWork.update({
      where: { id: workId },
      data: updateData,
    });

    if (systemMsg) {
      // บันทึกข้อความลง DB
      await sendSystemMessageToPair(work.freelancerId, work.jobSeekerId, systemMsg, userId);

      // ✅ 3. Real-time Trigger (กรณีทั่วไป)
      if (work.serviceConversationId) {
         // ส่งข้อความแจ้งเตือนเข้าแชททันที
         io.to(work.serviceConversationId).emit("receive_message", {
            id: 'sys-' + Date.now(),
            content: systemMsg,
            senderId: userId,
            createdAt: new Date().toISOString(),
            serviceConversationId: work.serviceConversationId,
        });
      }
    }

    // ✅ แจ้งเปลี่ยนสถานะปุ่มทันที
    if (work.serviceConversationId) {
        io.to(work.serviceConversationId).emit("work_status_updated", {
            workId: workId,
            status: status
        });
    }

    res.json({ message: "Status updated", work: updatedWork });

  } catch (error) {
    next(error);
  }
};

// ✅ HELPER: Send logic
const sendSystemMessageToPair = async (
  freelancerId,
  jobSeekerId,
  content,
  senderId
) => {
  try {
    // 1. Try to find existing Service Conversation
    let conversation = await prisma.serviceConversation.findFirst({
      where: {
        OR: [
          { user1Id: freelancerId, user2Id: jobSeekerId },
          { user1Id: jobSeekerId, user2Id: freelancerId },
        ],
      },
    });

    // 2. If not found, create one
    if (!conversation) {
      conversation = await prisma.serviceConversation.create({
        data: {
          user1Id: freelancerId,
          user2Id: jobSeekerId,
          serviceId: null, // Not tied to a specific service listing strictly, or nullable
        },
      });
    }

    // 3. Create Message
    await prisma.message.create({
      data: {
        content,
        senderId: senderId, // The person who triggered the action
        serviceConversationId: conversation.id,
      },
    });
  } catch (err) {
    console.error("Failed to send auto-message:", err);
    // Don't throw, let the main action succeed
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

export const confirmPaymentReceived = async (req, res) => {
  const { workId } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. อัปเดตสถานะใบงาน
      const work = await tx.freelancerWork.update({
        where: { id: workId },
        data: { 
          isReceiverConfirmed: true,
          status: "IN_PROGRESS" // ✅ เปลี่ยนเป็นกำลังดำเนินการทันที
        }
      });

      // 2. บันทึก Transaction เป็น SUCCESS
      await tx.transaction.updateMany({
        where: { workId: workId },
        data: { status: "SUCCESS" }
      });

      return work;
    });
    res.json({ success: true, message: "ยืนยันการรับเงินและเริ่มงานแล้ว", result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const acceptWorkStart = async (req, res) => {
  const { workId } = req.body;
  try {
    const updatedWork = await prisma.freelancerWork.update({
      where: { id: workId },
      data: { 
        isReceiverConfirmed: true,
        status: "IN_PROGRESS" // ✅ เปลี่ยนสถานะเป็นกำลังทำงาน
      }
    });
    res.json({ success: true, message: "ยืนยันเงินเข้าบัญชีกลางและเริ่มงานแล้ว", updatedWork });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ API: ยกเลิกงาน (สำหรับ Job Seeker)
// DELETE /api/freelancers/work/:workId/cancel
export const cancelWork = async (req, res, next) => {
  try {
    const io = req.app.get("io");
    const { workId } = req.params;
    const userId = req.user.id; // คนกดต้องเป็นผู้จ้าง

    const work = await prisma.freelancerWork.findUnique({
      where: { id: workId },
    });

    if (!work) return res.status(404).json({ error: "Work not found" });

    // 1. ตรวจสอบสิทธิ์: ต้องเป็นคนจ้าง (Job Seeker) เท่านั้น
    if (work.jobSeekerId !== userId) {
      return res.status(403).json({ error: "Only Job Seeker can cancel" });
    }

    // 2. ตรวจสอบสถานะ: ต้องเป็น OFFER_PENDING เท่านั้น (ถ้าเริ่มงานไปแล้วต้องใช้ระบบ Dispute)
    if (work.status !== "OFFER_PENDING") {
      return res.status(400).json({ error: "ไม่สามารถยกเลิกงานที่เริ่มดำเนินการไปแล้วได้" });
    }

    const systemMsg = `[STATUS:REFUNDED] 💸 คืนเงินสำเร็จ|ผู้ว่าจ้างยกเลิกงานและได้รับเงินคืนเข้า Wallet แล้ว`;

    // 3. เริ่ม Transaction: คืนเงิน + เปลี่ยนสถานะ
    await prisma.$transaction(async (tx) => {
      // 3.1 คืนเงินเข้า Wallet ผู้จ้าง (ถ้ามีการจ่ายแล้ว)
      if (work.isPayerPaid && work.price > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { increment: work.price } }
        });

        // 3.2 บันทึกประวัติการคืนเงิน (ใช้ TransactionType ที่มีอยู่)
        await tx.transaction.create({
          data: {
            amount: work.price,
            status: "SUCCESS",
            method: "WALLET",
            type: "TOPUP", // ใช้ TOPUP ไปก่อน (เป็นการเติมเงินกลับ) หรือถ้ามี REFUND ก็ใช้ได้
            payerId: null, // ระบบคืนให้
            receiverId: userId,
            workId: workId,
            gatewayRef: `REFUND-${workId}`
          }
        });
      }

      // 3.3 อัปเดตสถานะงานเป็น REFUNDED
      await tx.freelancerWork.update({
        where: { id: workId },
        data: { 
          status: "REFUNDED",
          // isPayerPaid: false // ไม่ต้องแก้ flag นี้ เพื่อเก็บประวัติว่าเคยจ่ายแล้ว
        }
      });
    });

    // 4. แจ้งเตือน Real-time
    if (work.serviceConversationId) {
      // เปลี่ยนปุ่มทันที
      io.to(work.serviceConversationId).emit("work_status_updated", {
        workId: workId,
        status: "REFUNDED"
      });

      // ส่งข้อความเข้าแชท
      const chatMsg = {
        id: 'sys-refund-' + Date.now(),
        content: systemMsg,
        senderId: userId,
        createdAt: new Date().toISOString(),
        serviceConversationId: work.serviceConversationId,
      };
      
      io.to(work.serviceConversationId).emit("receive_message", chatMsg);

      // บันทึกข้อความลง DB
      await sendSystemMessageToPair(work.freelancerId, work.jobSeekerId, systemMsg, userId);
    }

    res.json({ message: "Work cancelled and refunded" });

  } catch (error) {
    next(error);
  }
};

// GET /api/freelancers/works
export const getMyWorks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // ค้นหาจาก freelancerId แทน jobSeekerId
    const works = await prisma.freelancerWork.findMany({
      where: { freelancerId: userId }, 
      include: {
        jobSeeker: { // ดึงข้อมูลผู้ว่าจ้างมาแสดง
          select: {
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            email: true,
          },
        },
        review: true,
        disputeTicket: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(works);
  } catch (error) {
    next(error);
  }
};

