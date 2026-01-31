import prisma from '../config.js';
import fs from 'fs/promises';
import path from 'path';

// Helper: ลบรูป
const deleteFileFromDisk = async (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith("/uploads")) return;
  const oldPath = path.join(process.cwd(), fileUrl.replace("/uploads", "uploads"));
  try { await fs.unlink(oldPath); } catch (err) {}
};

// Helper: แปลง Path
const getWebPath = (filePath) => filePath.replace(/\\/g, '/').replace('uploads', '/uploads');

// 1. สร้างบริการใหม่ (Freelancer เท่านั้น)
export const createService = async (req, res) => {
  try {
    const { title, description, price, category , mainCategoryId } = req.body;
    const userId = req.user.id; // ได้จาก Token

    // ไม่ต้องเช็ค Company! เช็คแค่ว่าเป็น Freelancer หรือไม่
    if (req.user.role !== 'FREELANCER') {
        return res.status(403).json({ error: 'เฉพาะ Freelancer เท่านั้นที่โพสต์งานบริการได้' });
    }

    let coverImage = null;
    if (req.file) {
      coverImage = getWebPath(req.file.path);
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        coverImage,
        freelancerId: userId,
        mainCategoryId: mainCategoryId || null, // บันทึก ID หมวดหมู่
      }
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service', details: error.message });
  }
};

// 2. ดึงบริการของฉัน (Freelancer ดูงานตัวเอง)
export const getMyServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { freelancerId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// 3. แก้ไขบริการ
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. (แก้ไข) เพิ่ม mainCategoryId เข้ามาในตัวแปรที่รับจาก req.body
    const { title, description, price, category, isActive, mainCategoryId } = req.body;

    //  เพิ่มโค้ดส่วนนี้: ตรวจสอบค่าว่างฝั่ง Server
    if (!mainCategoryId || mainCategoryId === 'null' || mainCategoryId === '') {
        return res.status(400).json({ error: "หมวดหมู่ (Category) จำเป็นต้องระบุ ห้ามเว้นว่าง" });
    }

    // เช็คความเป็นเจ้าของ
    const existing = await prisma.service.findFirst({
        where: { id, freelancerId: req.user.id }
    });
    if (!existing) return res.status(403).json({ error: 'Unauthorized' });

    const data = { 
        title, 
        description, 
        price: price ? parseFloat(price) : undefined, 
        category,
        isActive: isActive === 'true' || isActive === true,
        
        // 2. (แก้ไข) เพิ่มบรรทัดนี้เพื่อบันทึกหมวดหมู่
        // (ถ้าส่งมาเป็นสตริงว่างให้เป็น null, ถ้ามีค่าให้บันทึกค่า)
        mainCategoryId: mainCategoryId
    };

    if (req.file) {
        if (existing.coverImage) await deleteFileFromDisk(existing.coverImage);
        data.coverImage = getWebPath(req.file.path);
    }

    const updated = await prisma.service.update({
        where: { id },
        data // ส่ง data ที่แก้แล้วเข้าไป
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
};

// 4. ลบบริการ
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. เช็คความเป็นเจ้าของ
    const existing = await prisma.service.findFirst({
        where: { id, freelancerId: userId }
    });
    if (!existing) return res.status(403).json({ error: 'Unauthorized' });

    // 2. ลบรูปปกจาก Disk (ถ้ามี)
    if (existing.coverImage) await deleteFileFromDisk(existing.coverImage);

    // 3. ใช้ Transaction เพื่อเคลียร์ข้อมูลที่เกี่ยวข้องใน Database ก่อนลบ Service
    await prisma.$transaction(async (tx) => {
        
        // 3.1 หาห้องแชททั้งหมดที่เกี่ยวข้องกับ Service นี้
        const conversations = await tx.serviceConversation.findMany({
            where: { serviceId: id },
            select: { id: true }
        });
        
        const convoIds = conversations.map(c => c.id);

        if (convoIds.length > 0) {
            // 3.2 ปลดล็อค FreelancerWork ที่ผูกกับแชทเหล่านี้ (Set null)
            // เพื่อไม่ให้ประวัติการจ้างงานหายไป หรือติด Error
            await tx.freelancerWork.updateMany({
                where: { serviceConversationId: { in: convoIds } },
                data: { serviceConversationId: null } 
            });

            // 3.3 ลบข้อความ (Message) ในห้องแชทเหล่านั้น
            await tx.message.deleteMany({
                where: { serviceConversationId: { in: convoIds } }
            });

            // 3.4 ลบห้องแชท (ServiceConversation)
            await tx.serviceConversation.deleteMany({
                where: { id: { in: convoIds } }
            });
        }

        // 3.5 สุดท้าย ลบตัวบริการ (Service)
        await tx.service.delete({ where: { id } });
    });

    res.status(204).send();
  } catch (error) {
    console.error("Delete Service Error:", error); // Log Error เพื่อดูสาเหตุชัดเจนขึ้น
    res.status(500).json({ error: 'Failed to delete service', details: error.message });
  }
};

// 5. (Public) ค้นหาบริการทั้งหมด (สำหรับคนจ้างมาดู)
export const searchServices = async (req, res) => {
    try {
        const { q , mainCategoryId } = req.query;
        const where = { isActive: true };
        
        if (q) {
            where.OR = [
                { title: { contains: q } }, // MySQL อาจต้องแก้ตรงนี้ถ้าใช้ Case Insensitive ไม่ได้
                { description: { contains: q } }
            ];
        }

        //  กรองตามหมวดหมู่
        if (mainCategoryId) {
            where.mainCategoryId = mainCategoryId;
        }

        const services = await prisma.service.findMany({
            where,
            include: {
                freelancer: {
                    select: { 
                      firstName: true, 
                      lastName: true, 
                      profileImageUrl: true,
                      freelancerProfile: { select: { professionalTitle: true }} // [FIX] Include professionalTitle สำหรับ ServiceCard
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search services' });
    }
};

//  ดึงรายละเอียดบริการ 1 รายการ
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        freelancer: { // ดึงข้อมูลคนโพสต์มาด้วย
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImageUrl: true,
            freelancerProfile: true // เพื่อเอาตำแหน่งงาน (Professional Title)
          }
        },
        mainCategory: true
      }
    });

    if (!service) return res.status(404).json({ error: 'Service not found' });

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service details' });
  }
};

// GET /api/services/:serviceId/conversation
export const getOrCreateServiceConversation = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const userId = req.user.id; // Customer ID

        // 1. Find Service and Freelancer
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            select: { id: true, freelancerId: true } 
        });

        if (!service) return res.status(404).json({ error: 'Service not found.' });
        if (service.freelancerId === userId) return res.status(400).json({ error: 'Cannot chat with yourself.' });

        // 2. Find existing Conversation
        let conversation = await prisma.serviceConversation.findFirst({
            where: {
                serviceId: serviceId,
                // เช็คทั้งสองฝั่ง (เผื่อ User A ทักก่อน, หรือ User B ทักก่อน)
                OR: [
                    { user1Id: userId, user2Id: service.freelancerId },
                    { user1Id: service.freelancerId, user2Id: userId },
                ]
            },
        });
        
        // 3. ถ้าไม่มี ให้สร้างใหม่ (User1 คือคนทัก (Customer))
        if (!conversation) {
             try {
                 conversation = await prisma.serviceConversation.create({
                     data: {
                         serviceId: serviceId,
                         user1Id: userId, // Customer
                         user2Id: service.freelancerId // Freelancer
                     }
                 });
             } catch (error) {
                 // ✅ จัดการ P2002 (Unique Constraint Violation) เมื่อผู้ใช้คลิกซ้ำ
                 if (error.code === 'P2002') {
                     // พยายามหาห้องแชทที่ถูกสร้างไปแล้วโดย Request ที่ชนกัน
                     conversation = await prisma.serviceConversation.findFirst({
                         where: { serviceId: serviceId, OR: [{ user1Id: userId, user2Id: service.freelancerId }, { user1Id: service.freelancerId, user2Id: userId }] }
                     });
                     if (conversation) {
                         // พบห้องแชทที่สร้างแล้ว, ส่ง ID นั้นกลับไปแทน
                         return res.json({ conversationId: conversation.id });
                     }
                 }
                 // ถ้าไม่ใช่ Error P2002 ให้โยน Error 500
                 throw error;
             }
        }
        
        res.json({ conversationId: conversation.id });

    } catch (error) {
        console.error("Failed to get/create service conversation:", error.message);
        // ✅ ส่ง 400 กลับไปสำหรับ Foreign Key issues
        if (error.code === 'P2003') { 
             return res.status(400).json({ error: 'Invalid service ID or user data (Foreign Key Violation).' });
        }
        res.status(500).json({ error: 'Failed to start chat. Check DB configuration.' });
    }
};