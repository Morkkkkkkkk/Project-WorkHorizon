import prisma from "../config.js";

// POST /api/freelancers/:freelancerId/reviews
// สร้างรีวิวสำหรับ Freelancer (ต้องมี FreelancerWork ก่อน)
export const createReview = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const { rating, comment, workId } = req.body;
    const reviewerId = req.user.id;

    // 1. ตรวจสอบว่ามี FreelancerProfile หรือไม่
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: freelancerId },
    });

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    // 2. ถ้ามี workId ให้ตรวจสอบว่างานนี้มีจริงและยังไม่มีรีวิว
    if (workId) {
      const work = await prisma.freelancerWork.findUnique({
        where: { id: workId },
        include: { review: true },
      });

      if (!work) {
        return res.status(404).json({ error: "Work not found" });
      }

      if (work.review) {
        return res
          .status(400)
          .json({ error: "This work has already been reviewed" });
      }

      if (work.jobSeekerId !== reviewerId) {
        return res
          .status(403)
          .json({ error: "You can only review work you hired" });
      }

      // สร้างรีวิวที่ผูกกับงาน
      const review = await prisma.freelancerReview.create({
        data: {
          rating: parseInt(rating),
          comment,
          workId,
          reviewerId,
          reviewedId: freelancerId,
          freelancerProfileId: freelancerProfile.id,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
      });

      return res.status(201).json(review);
    }

    // 3. ถ้าไม่มี workId ให้สร้างงานชั่วคราวก่อน (สำหรับรีวิวทั่วไป)
    // สร้าง FreelancerWork ชั่วคราว
    const tempWork = await prisma.freelancerWork.create({
      data: {
        jobSeekerId: reviewerId,
        freelancerId,
        freelancerProfileId: freelancerProfile.id,
        jobTitle: "General Service Review", // ชื่องานทั่วไป
        description: "Review from service interaction",
      },
    });

    // สร้างรีวิว
    const review = await prisma.freelancerReview.create({
      data: {
        rating: parseInt(rating),
        comment,
        workId: tempWork.id,
        reviewerId,
        reviewedId: freelancerId,
        freelancerProfileId: freelancerProfile.id,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res
      .status(500)
      .json({ error: "Failed to create review", details: error.message });
  }
};

// GET /api/freelancers/:freelancerId/reviews
// ดึงรีวิวทั้งหมดของ Freelancer
export const getFreelancerReviews = async (req, res) => {
  try {
    const { freelancerId } = req.params;

    // ตรวจสอบว่ามี FreelancerProfile หรือไม่
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: freelancerId },
    });

    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer profile not found" });
    }

    // ดึงรีวิวทั้งหมด
    const reviews = await prisma.freelancerReview.findMany({
      where: {
        freelancerProfileId: freelancerProfile.id,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
        work: {
          select: {
            jobTitle: true,
            completedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // คำนวณคะแนนเฉลี่ย
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    res.json({
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch reviews", details: error.message });
  }
};

// GET /api/services/:serviceId/reviews
// ดึงรีวิวของ Service (ผ่าน Freelancer ที่เป็นเจ้าของ)
export const getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // ดึงข้อมูล Service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { freelancerId: true },
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // ดึงรีวิวของ Freelancer คนนี้
    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: service.freelancerId },
    });

    if (!freelancerProfile) {
      return res.json({ reviews: [], averageRating: 0, totalReviews: 0 });
    }

    const reviews = await prisma.freelancerReview.findMany({
      where: {
        freelancerProfileId: freelancerProfile.id,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10, // จำกัดแค่ 10 รีวิวล่าสุด
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    res.json({
      reviews: reviews.map((review) => ({
        rating: review.rating,
        comment: review.comment,
        reviewerName: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
        createdAt: review.createdAt,
      })),
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching service reviews:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch reviews", details: error.message });
  }
};
