import prisma from '../config.js';

// --- (Helper สร้าง Notification) ---
export async function createNotification(userId, content, link) {
  try {
    await prisma.notification.create({
      data: { userId, content, link },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

// POST /api/applications (Job Seeker สมัครงาน)
export const createApplication = async (req, res) => {
  try {
    const { jobId, coverLetter, resumeId } = req.body;
    const userId = req.user.id;

    // 1. เช็กว่าสมัครซ้ำหรือไม่ (จาก @@unique([jobId, userId]))
    const existingApplication = await prisma.application.findFirst({
      where: { jobId, userId },
    });
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job.' });
    }

    // 2. (Optional) เช็กว่า resumeId เป็นของ User คนนี้จริง
    const resume = await prisma.resume.findFirst({
       where: { id: resumeId, userId: userId }
    });
    if (!resume) {
       return res.status(400).json({ error: 'Invalid resume ID.' });
    }

    // 3. สร้างใบสมัคร
    const application = await prisma.application.create({
      data: {
        jobId,
        userId,
        coverLetter,
        resumeId,
      },
    });
    
    // 4. (Bonus) แจ้งเตือน Employer
    const job = await prisma.job.findUnique({ 
        where: { id: jobId }, 
        include: { company: true }
    });
    if(job) {
        await createNotification(
            job.company.userId, 
            `${req.user.firstName} ได้สมัครงาน ${job.title}`, 
            `/dashboard/jobs/${job.id}/applicants` // Link ไปหน้ารายชื่อผู้สมัคร
        );
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create application', details: error.message });
  }
};

// GET /api/applications/my (Job Seeker ดูใบสมัครของตัวเอง)
export const getMyApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.user.id },
      include: {
        job: { // ดึงข้อมูลง่ายๆ ของงาน
          select: { 
            id: true,
            title: true, 
            status: true,
            company: { select: { id: true, companyName: true, logoUrl: true } }
          }
        },
         conversation: { select: { id: true } } // (สำหรับปุ่มแชท)
      },
      orderBy: { appliedAt: 'desc' },
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications', details: error.message });
  }
};

// GET /api/jobs/:jobId/applications (Controller นี้ถูกเรียกจาก job.routes)
export const getApplicationsForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // 1. เช็กว่า Employer เป็นเจ้าของงานนี้
     const job = await prisma.job.findFirst({
       where: { 
         id: jobId,
         company: { userId: req.user.id } 
       },
       select: { id: true, title: true }
     });
    if (!job) {
       return res.status(403).json({ error: 'User unauthorized to view applications for this job' });
    }

    // 2. ดึงใบสมัครทั้งหมดของงานนี้
    const applications = await prisma.application.findMany({
      where: { jobId: jobId },
      include: {
        user: { // ดึงข้อมูลผู้สมัคร (ยกเว้นรหัสผ่าน)
           select: {
             id: true,
             firstName: true,
             lastName: true,
             email: true,
             phone: true,
             profileImageUrl: true
           }
        },
        resume: { select: { url: true } }, 
        conversation: { select: { id: true } },

        ratings: true, // (ดึงคะแนนที่ User นี้ให้)
        internalNotes: { // (ดึงโน้ตทั้งหมด)
          include: {
            author: { select: { id: true, firstName: true, profileImageUrl: true }}
          },
          orderBy: { createdAt: 'desc' }
        }
      },
       orderBy: { appliedAt: 'desc' },
    });
    res.json({ job: job, applications: applications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications', details: error.message });
  }
};

// GET /api/applications/:appId (ดูใบสมัคร 1 ใบ - ทั้ง 2 ฝ่าย)
export const getApplicationById = async (req, res) => {
  try {
    const { appId } = req.params;
    const application = await prisma.application.findUnique({
      where: { id: appId },
      include: {
        user: { // ข้อมูลผู้สมัคร
          include: {
             educations: true,
             experiences: true,
             skills: true,
          }
        },
        job: { include: { company: true } }, // ข้อมูลงาน
        resume: true, // Resume ที่ใช้สมัคร
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Security: เช็กว่า User ที่ขอดู เป็น "ผู้สมัคร" หรือ "เจ้าของงาน"
    const isOwner = application.userId === req.user.id;
    const isEmployer = application.job.company.userId === req.user.id;

    if (!isOwner && !isEmployer) {
      return res.status(403).json({ error: 'User unauthorized to view this application' });
    }
    
    application.user.password = undefined; // ซ่อนรหัสผ่าน
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch application', details: error.message });
  }
};

// PATCH /api/applications/:appId/status (Employer อัปเดตสถานะ)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { appId } = req.params;
    const { status } = req.body; // รับสถานะ (REVIEWED, SHORTLISTED, REJECTED, HIRED)

    // 1. ค้นหา Application และเช็กสิทธิ์ Employer
    const application = await prisma.application.findFirst({
        where: {
            id: appId,
            job: { company: { userId: req.user.id } } // เช็กว่า Employer เป็นเจ้าของงาน
        },
        include: {
           job: { select: { title: true }}
        }
    });

    if (!application) {
        return res.status(403).json({ error: 'Application not found or user unauthorized' });
    }
    
    // 2. อัปเดต
    const updatedApplication = await prisma.application.update({
        where: { id: appId },
        data: { status: status }
    });
    
    // 3. (Bonus) แจ้งเตือน Job Seeker
    await createNotification(
        application.userId,
        `ใบสมัครงาน ${application.job.title} ของคุณ ถูกเปลี่ยนสถานะเป็น ${status}`,
        `/my-applications` // Link ไปหน้าใบสมัครของฉัน
    );

    res.json(updatedApplication);
  } catch (error) {
     res.status(500).json({ error: 'Failed to update status', details: error.message });
  }
};

// POST /api/applications/:appId/notes (Employer เพิ่มโน้ต)
export const createInternalNote = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // (เช็กสิทธิ์ว่า Employer เป็นเจ้าของ App นี้)
    const application = await prisma.application.findFirst({
        where: { id: appId, job: { company: { userId: userId } } }
    });
    if (!application) {
        return res.status(403).json({ error: 'User unauthorized' });
    }
    
    const note = await prisma.internalNote.create({
      data: {
        content,
        applicationId: appId,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, firstName: true, profileImageUrl: true }}
      }
    });
    res.status(201).json(note);
  } catch (error) { next(error); }
};

// POST /api/applications/:appId/rating (Employer ให้คะแนน)
export const createOrUpdateRating = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // (เช็กสิทธิ์)
    const application = await prisma.application.findFirst({
        where: { id: appId, job: { company: { userId: userId } } }
    });
    if (!application) {
        return res.status(403).json({ error: 'User unauthorized' });
    }
    
    const newRating = await prisma.applicantRating.upsert({
      where: {
        raterId_applicationId: { // (Unique constraint ที่เราตั้ง)
          raterId: userId,
          applicationId: appId,
        }
      },
      update: { rating , comment },
      create: {
        rating,
        comment,
        raterId: userId,
        applicationId: appId,
      }
    });
    res.status(201).json(newRating);
  } catch (error) { next(error); }
};

// DELETE /api/applications/:appId (Employer ลบใบสมัคร)
export const deleteApplication = async (req, res, next) => {
  try {
    const { appId } = req.params;
    const userId = req.user.id;

    // 1. เช็กสิทธิ์ว่า Employer เป็นเจ้าของ App นี้
    const application = await prisma.application.findFirst({
        where: { 
          id: appId, 
          // (เช็กว่า appId นี้ อยู่ใน job ที่มี company ที่มี userId ตรงกับคนที่ล็อกอิน)
          job: { company: { userId: userId } } 
        },
        select: { id: true } // (ดึงแค่ ID มาเช็ก)
    });

    if (!application) {
        return res.status(403).json({ error: 'Application not found or user unauthorized' });
    }

    // 2. ลบ
    await prisma.application.delete({
      where: { id: appId },
    });

    res.status(204).send(); // No Content (ลบสำเร็จ)
  } catch (error) { next(error); }
};

