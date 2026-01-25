import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// --- 1. สร้าง Ticket ข้อพิพาท (แจ้งปัญหา) ---
export const createDispute = async (req, res) => {
  const { workId, reason, description } = req.body;
  const userId = req.user.id; // ดึง ID คนแจ้งจาก Token

  try {
    // 1. ตรวจสอบว่างานนี้มีอยู่จริงไหม
    const work = await prisma.freelancerWork.findUnique({
      where: { id: workId }
    });

    if (!work) {
      return res.status(404).json({ message: "ไม่พบข้อมูลงานจ้างนี้" });
    }

    // 2. ตรวจสอบสิทธิ์ (ต้องเป็น ผู้จ้าง หรือ ฟรีแลนซ์ ในงานนั้นเท่านั้น)
    if (work.jobSeekerId !== userId && work.freelancerId !== userId) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์แจ้งปัญหาในงานนี้" });
    }

    // 3. ตรวจสอบว่าเคยแจ้งไปแล้วหรือยัง
    const existingTicket = await prisma.disputeTicket.findUnique({
      where: { workId }
    });
    if (existingTicket) {
      return res.status(400).json({ message: "งานนี้มีการเปิดข้อพิพาทไว้อยู่แล้ว" });
    }

    // 4. เริ่ม Transaction (เปลี่ยนสถานะงาน + สร้าง Ticket)
    const ticket = await prisma.$transaction(async (tx) => {
      // อัปเดตสถานะงานเป็น DISPUTED
      await tx.freelancerWork.update({
        where: { id: workId },
        data: { status: "DISPUTED" }
      });

      // สร้าง Ticket
      const newTicket = await tx.disputeTicket.create({
        data: {
          ticketNumber: `DIS-${Date.now()}`, // สร้างเลข Ticket แบบง่าย
          workId,
          creatorId: userId,
          reason,
          description,
          status: "OPEN"
        }
      });

      return newTicket;
    });

    res.status(201).json({ success: true, ticket });

  } catch (error) {
    console.error("Create Dispute Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างข้อพิพาท" });
  }
};

// --- 2. ดูรายละเอียด Ticket และประวัติแชท ---
export const getDisputeDetail = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const ticket = await prisma.disputeTicket.findUnique({
      where: { id: ticketId },
      include: {
        work: true, // ดึงข้อมูลงานมาด้วย
        creator: { select: { id: true, firstName: true, lastName: true, role: true } }, // ดึงคนแจ้ง
        messages: {
          orderBy: { createdAt: 'asc' }, // เรียงข้อความเก่า -> ใหม่
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, role: true, profileImageUrl: true } }
          }
        }
      }
    });

    if (!ticket) return res.status(404).json({ message: "ไม่พบข้อพิพาทนี้" });

    res.json(ticket);

  } catch (error) {
    res.status(500).json({ message: "Error fetching dispute details" });
  }
};

// --- 3. ตอบแชทใน Ticket ---
export const replyDispute = async (req, res) => {
  const { ticketId, content, fileUrl } = req.body;
  const senderId = req.user.id;

  try {
    const message = await prisma.disputeMessage.create({
      data: {
        ticketId,
        senderId,
        content,
        fileUrl
      },
      include: {
        sender: { select: { firstName: true, lastName: true, profileImageUrl: true } }
      }
    });

    res.json(message);

  } catch (error) {
    res.status(500).json({ message: "ส่งข้อความไม่สำเร็จ" });
  }
};

// --- 4. (Admin Only) ตัดสินข้อพิพาท ---
export const resolveDispute = async (req, res) => {
  // *** ในโปรเจคจริงควรเช็ค Role ว่าเป็น SUPER_ADMIN ก่อน ***
  const { ticketId, resolution } = req.body; // resolution: 'REFUND' หรือ 'COMPLETE'

  try {
    const result = await prisma.$transaction(async (tx) => {
      // ดึงข้อมูล Ticket และงาน
      const ticket = await tx.disputeTicket.findUnique({
        where: { id: ticketId },
        include: { work: true }
      });

      if (!ticket) throw new Error("ไม่พบ Ticket");
      if (ticket.status !== "OPEN" && ticket.status !== "IN_PROGRESS") {
        throw new Error("Ticket นี้ถูกตัดสินไปแล้ว");
      }

      const price = parseFloat(ticket.work.price || 0);

      // --- กรณีที่ 1: คืนเงินให้ผู้จ้าง (REFUND) ---
      if (resolution === 'REFUND') {
        // คืนเงินเข้า Wallet ผู้จ้าง
        await tx.user.update({
          where: { id: ticket.work.jobSeekerId },
          data: { walletBalance: { increment: price } }
        });

        // อัปเดตสถานะงาน
        await tx.freelancerWork.update({
          where: { id: ticket.workId },
          data: { status: "REFUNDED" }
        });

        // อัปเดตสถานะ Ticket
        await tx.disputeTicket.update({
          where: { id: ticketId },
          data: { status: "RESOLVED_REFUNDED" }
        });

        // บันทึก Transaction การคืนเงิน
        await tx.transaction.create({
            data: {
                amount: price,
                status: "SUCCESS",
                method: "WALLET",
                type: "TOPUP", // หรือเพิ่มประเภท REFUND ใน Enum ก็ได้
                payerId: ticket.work.jobSeekerId, // ใส่ ID ตัวเอง (ระบบคืนให้)
                receiverId: ticket.work.jobSeekerId,
                gatewayRef: `REFUND-${ticket.ticketNumber}`
            }
        });
      } 
      
      // --- กรณีที่ 2: ให้งานผ่าน ฟรีแลนซ์ได้เงิน (COMPLETE) ---
      else if (resolution === 'COMPLETE') {
        // โอนเงินเข้า Wallet ฟรีแลนซ์
        await tx.user.update({
             where: { id: ticket.work.freelancerId },
             data: { walletBalance: { increment: price } }
        });

        // อัปเดตสถานะงาน
        await tx.freelancerWork.update({
          where: { id: ticket.workId },
          data: { status: "COMPLETED", completedAt: new Date() }
        });

        // อัปเดตสถานะ Ticket
        await tx.disputeTicket.update({
          where: { id: ticketId },
          data: { status: "RESOLVED_COMPLETED" }
        });
        
        // บันทึก Transaction รายรับฟรีแลนซ์
        await tx.transaction.create({
            data: {
                amount: price,
                status: "SUCCESS",
                method: "WALLET",
                type: "PAYMENT",
                payerId: ticket.work.jobSeekerId, // ผู้จ้างจ่าย
                receiverId: ticket.work.freelancerId, // ฟรีแลนซ์รับ
                workId: ticket.workId,
                gatewayRef: `RESOLVED-${ticket.ticketNumber}`
            }
        });
      }

      return { message: "ตัดสินข้อพิพาทเรียบร้อย" };
    });

    res.json(result);

  } catch (error) {
    console.error("Resolve Error:", error);
    res.status(500).json({ message: error.message || "เกิดข้อผิดพลาดในการตัดสิน" });
  }
};

// --- 5. (Admin Only) ดึงรายการข้อพิพาททั้งหมด ---
export const getAllDisputes = async (req, res) => {
  try {
    // ดึงเฉพาะที่ยังไม่ปิด หรือดึงทั้งหมดแล้วไปกรองหน้าบ้านก็ได้
    const disputes = await prisma.disputeTicket.findMany({
      include: {
        work: {
          include: {
            jobSeeker: { select: { firstName: true, lastName: true } },
            freelancer: { select: { firstName: true, lastName: true } }
          }
        },
        creator: { select: { firstName: true, role: true } }
      },
      orderBy: { createdAt: 'desc' } // ใหม่สุดขึ้นก่อน
    });
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 6. (Admin Only) ลบข้อพิพาท ---
export const deleteDispute = async (req, res) => {
  const { ticketId } = req.params;
  try {
    await prisma.disputeTicket.delete({
      where: { id: ticketId }
    });
    res.json({ message: "ลบข้อพิพาทเรียบร้อยแล้ว" });
  } catch (error) {
    res.status(500).json({ message: "ลบไม่สำเร็จ (อาจมีการอ้างอิงข้อมูลอื่น)" });
  }
};