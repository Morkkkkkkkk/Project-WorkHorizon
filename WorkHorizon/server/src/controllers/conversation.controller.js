import prisma from "../config.js";
import { createNotification } from "./application.controller.js";

// --- Helper เช็กสิทธิ์ในห้องแชท ---
const checkConversationAccess = async (convoId, userId) => {
  // 1. ลองหาจาก Job Application Conversation (แบบเดิม)
  const jobConvo = await prisma.conversation.findFirst({
    where: {
      id: convoId,
      application: {
        OR: [{ userId: userId }, { job: { company: { userId: userId } } }],
      },
    },
    // ✅ ลด Includes ให้เบาที่สุดสำหรับ Job Chat
    include: {
      application: {
        select: {
          userId: true,
          job: {
            select: {
              title: true,
              company: {
                select: {
                  userId: true,
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      profileImageUrl: true,
                    },
                  },
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
      },
    },
  });
  if (jobConvo) return { type: "JOB", data: jobConvo };

  // ✅ 2. ลองหาจาก Service Conversation (FIX: ตัด freelancerProfile ออกจาก include)
  const serviceConvo = await prisma.serviceConversation.findFirst({
    where: { id: convoId, OR: [{ user1Id: userId }, { user2Id: userId }] },
    include: {
      service: { select: { title: true, id: true } }, // ดึงแค่ชื่อ Service
      user1: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          // ❌ ตัด freelancerProfile ออก เพื่อป้องกัน Crash
        },
      },
      user2: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          // ❌ ตัด freelancerProfile ออก
        },
      },
    },
  });
  if (serviceConvo) return { type: "SERVICE", data: serviceConvo };

  return null; // ไม่พบ
};

// GET /api/conversations/application/:appId
export const getOrCreateConversation = async (req, res) => {
  try {
    const { appId } = req.params;

    // 1. ค้นหา Application และเช็กสิทธิ์
    const application = await prisma.application.findFirst({
      where: { id: appId },
      include: { job: { include: { company: true } } },
    });
    if (!application)
      return res.status(404).json({ error: "Application not found" });

    const isOwner = application.userId === req.user.id;
    const isEmployer = application.job.company.userId === req.user.id;

    if (!isOwner && !isEmployer) {
      return res.status(403).json({ error: "User unauthorized" });
    }

    // 2. ค้นหาห้องแชท
    let conversation = await prisma.conversation.findUnique({
      where: { applicationId: appId },
    });

    // 3. ถ้าไม่มี ให้สร้างใหม่
    if (!conversation) {
      // (เฉพาะ Employer หรือ Job Seeker ที่ผ่านเข้ารอบ (SHORTLISTED) เท่านั้นที่ควรสร้างได้)
      const allowedToCreate =
        isEmployer ||
        application.status === "SHORTLISTED" ||
        application.status === "HIRED";
      if (!allowedToCreate) {
        return res.status(403).json({
          error: "Cannot start conversation. Application not shortlisted.",
        });
      }

      conversation = await prisma.conversation.create({
        data: { applicationId: appId },
      });
    }

    res.json({ conversationId: conversation.id });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to get conversation", details: error.message });
  }
};

// GET /api/conversations/:convoId/messages
export const getMessages = async (req, res) => {
  try {
    const { convoId } = req.params;
    const access = await checkConversationAccess(convoId, req.user.id);
    if (!access) return res.status(403).json({ error: "User unauthorized" });

    const whereCondition =
      access.type === "JOB"
        ? { conversationId: convoId, serviceConversationId: null }
        : { serviceConversationId: convoId, conversationId: null };

    // 🛑 LOGGING STEP: ให้ Server พิมพ์ Where Clause ที่กำลังจะ execute
    console.log(
      "[DEBUG CHAT] Executing Message Query with WHERE:",
      whereCondition
    );
    console.log("[DEBUG CHAT] Access Type:", access.type);

    const messages = await prisma.message.findMany({
      where: whereCondition,
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, firstName: true, profileImageUrl: true },
        },
      },
    });

    res.json({ conversation: access.data, messages });
  } catch (error) {
    // ✅ Log full details of the crash
    console.error("❌ CRITICAL CHAT CRASH:", error);
    res
      .status(500)
      .json({ error: "Failed to get messages", details: error.message });
  }
};

// POST /api/conversations/:convoId/messages
export const sendMessage = async (req, res) => {
  try {
    const { convoId } = req.params;
    const { content } = req.body;

    const access = await checkConversationAccess(convoId, req.user.id);
    if (!access) return res.status(403).json({ error: "User unauthorized" });

    // ✅ 1. สร้าง Object สำหรับบันทึก ID (Polymorphic) และใส่ null ให้อีก Field
    const relationData =
      access.type === "JOB"
        ? { conversationId: convoId, serviceConversationId: null }
        : { serviceConversationId: convoId, conversationId: null };

    // 2. สร้างข้อความ
    const message = await prisma.message.create({
      data: {
        content,
        senderId: req.user.id,
        ...relationData, // ใส่ ID ที่ถูกต้อง (และ null ที่เหลือ)
      },
      include: {
        sender: {
          select: { id: true, firstName: true, profileImageUrl: true },
        },
      },
    });

    // 3. (Bonus) แจ้งเตือนคู่สนทนา (Logic ซับซ้อนขึ้นนิดหน่อย)
    const receiverId =
      access.type === "JOB"
        ? access.data.application.userId === req.user.id
          ? access.data.application.job.company.userId
          : access.data.application.userId
        : access.data.user1Id === req.user.id
        ? access.data.user2Id
        : access.data.user1Id; // Logic สำหรับ Service

    await createNotification(
      receiverId,
      `คุณมีข้อความใหม่จาก ${req.user.firstName}`,
      `/chat/${convoId}`
    );

    res.status(201).json(message);
  } catch (error) {
    console.error("Critical error in sendMessage:", error);
    res
      .status(500)
      .json({ error: "Failed to send message", details: error.message });
  }
};

// ✅ NEW: GET /api/conversations - Get all conversations for authenticated user
export const getAllConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. ดึง Job Application Conversations
    let jobConversations = [];
    try {
      jobConversations = await prisma.conversation.findMany({
        where: {
          application: {
            OR: [
              { userId: userId }, // Job Seeker's applications
              { job: { company: { userId: userId } } }, // Employer's jobs
            ],
          },
        },
        include: {
          application: {
            select: {
              userId: true,
              job: {
                select: {
                  title: true,
                  company: {
                    select: {
                      userId: true,
                      user: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          profileImageUrl: true,
                        },
                      },
                    },
                  },
                },
              },
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  profileImageUrl: true,
                },
              },
            },
          },
          messages: {
            where: { conversationId: { not: null } }, // Only job messages
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, createdAt: true, senderId: true },
          },
        },
        orderBy: { createdAt: "desc" }, // ✅ FIX: Use createdAt instead of updatedAt
      });
    } catch (err) {
      console.error("Error fetching job conversations:", err);
    }

    // 2. ดึง Service Conversations
    let serviceConversations = [];
    try {
      serviceConversations = await prisma.serviceConversation.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        include: {
          service: { select: { title: true, id: true } },
          user1: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
          user2: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
          messages: {
            where: { serviceConversationId: { not: null } }, // Only service messages
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { content: true, createdAt: true, senderId: true },
          },
        },
        orderBy: { createdAt: "desc" }, // ✅ FIX: Use createdAt instead of updatedAt
      });
    } catch (err) {
      console.error("Error fetching service conversations:", err);
    }

    // 3. รวมและจัดรูปแบบข้อมูล (with null checks)
    const allConversations = [
      ...jobConversations
        .filter(
          (convo) =>
            convo.application &&
            convo.application.job &&
            convo.application.job.company
        )
        .map((convo) => {
          const isJobSeeker = convo.application.userId === userId;
          const otherUser = isJobSeeker
            ? convo.application.job.company.user
            : convo.application.user;

          return {
            id: convo.id,
            type: "JOB",
            jobTitle: convo.application.job.title,
            otherUser,
            lastMessage: convo.messages[0] || null,
            createdAt: convo.createdAt,
            lastMessageTime: convo.messages[0]?.createdAt || convo.createdAt,
          };
        }),
      ...serviceConversations
        .filter((convo) => convo.service && convo.user1 && convo.user2)
        .map((convo) => {
          const otherUser =
            convo.user1Id === userId ? convo.user2 : convo.user1;

          return {
            id: convo.id,
            type: "SERVICE",
            serviceTitle: convo.service.title,
            otherUser,
            lastMessage: convo.messages[0] || null,
            createdAt: convo.createdAt,
            lastMessageTime: convo.messages[0]?.createdAt || convo.createdAt,
          };
        }),
    ];

    // 4. เรียงตามเวลาข้อความล่าสุด
    allConversations.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json(allConversations);
  } catch (error) {
    console.error("Error in getAllConversations:", error);
    res
      .status(500)
      .json({ error: "Failed to get conversations", details: error.message });
  }
};

// ✅ NEW: DELETE /api/conversations/:convoId - Delete a conversation
export const deleteConversation = async (req, res) => {
  try {
    const { convoId } = req.params;
    const userId = req.user.id;

    // 1. ตรวจสอบสิทธิ์
    const access = await checkConversationAccess(convoId, userId);
    if (!access) {
      return res.status(403).json({ error: "User unauthorized" });
    }

    // 2. ลบ Messages ก่อน (เพราะมี Foreign Key)
    if (access.type === "JOB") {
      await prisma.message.deleteMany({
        where: { conversationId: convoId },
      });
      // 3. ลบ Conversation
      await prisma.conversation.delete({
        where: { id: convoId },
      });
    } else {
      await prisma.message.deleteMany({
        where: { serviceConversationId: convoId },
      });
      // 3. ลบ Service Conversation
      await prisma.serviceConversation.delete({
        where: { id: convoId },
      });
    }

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    res
      .status(500)
      .json({ error: "Failed to delete conversation", details: error.message });
  }
};
