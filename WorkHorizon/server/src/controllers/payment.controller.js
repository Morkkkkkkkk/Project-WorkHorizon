import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// --- 🛠️ MOCK DATA ---
const MOCK_CARDS = {
  '4242424242424242': { status: 'SUCCESS', message: 'ชำระเงินสำเร็จ' },
  '4000000000000000': { status: 'FAILED', message: 'บัตรถูกปฏิเสธ' },
  '5555555555555555': { status: 'FAILED', message: 'วงเงินไม่เพียงพอ' },
};

export const processPayment = async (req, res) => {
  const payerId = req.user.id; 
  const { amount, method, workId, cardDetails, serviceId, jobId, receiverId } = req.body;

  try {
    if (!amount || amount <= 0) return res.status(400).json({ message: "ยอดเงินไม่ถูกต้อง" });

    // ------------------------------------------------------------------
    // 1. เตรียมชื่อ Title (ย้ายขึ้นมาทำก่อน เพื่อใช้เช็คงานซ้ำ)
    // ------------------------------------------------------------------
    let workTitle = "งานจ้างทั่วไป"; 
    if (serviceId) {
        const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { title: true } });
        if (service) workTitle = service.title;
    } else if (jobId) {
        const job = await prisma.job.findUnique({ where: { id: jobId }, select: { title: true } });
        if (job) workTitle = job.title;
    }

    // ------------------------------------------------------------------
    // 2. เช็คงานซ้ำ (Duplicate Check) - ✅ แก้ไขเงื่อนไขให้ตรงกับ Schema
    // ------------------------------------------------------------------
    if (!workId && receiverId) { 
        const existingWork = await prisma.freelancerWork.findFirst({
            where: {
                // ใช้ jobSeekerId แทน employerId
                jobSeekerId: payerId,       
                
                // เช็คว่าจ้างฟรีแลนซ์คนเดิมไหม
                freelancerId: receiverId,   
                
                // เช็คสถานะ
                status: "IN_PROGRESS",      
                
                // ✅ ใช้ Title เช็คแทน serviceId/jobId (เพราะ DB ไม่เก็บ ID)
                jobTitle: workTitle         
            }
        });

        if (existingWork) {
            return res.status(400).json({ message: "คุณได้จ้างงานนี้ไปแล้ว (ตรวจสอบที่เมนู 'งานที่ฉันจ้าง')" });
        }
    }

    // 3. หา Profile ID
    let freelancerProfileId = null;
    if (receiverId) {
        const profile = await prisma.freelancerProfile.findFirst({ where: { userId: receiverId } });
        if (!profile) return res.status(400).json({ message: "ผู้รับเงินยังไม่ได้ลงทะเบียนโปรไฟล์ฟรีแลนซ์" });
        freelancerProfileId = profile.id;
    }

    const result = await prisma.$transaction(async (tx) => {
      
      let status = "PENDING";
      let gatewayRef = `ref_${Date.now()}`;
      let message = "ดำเนินการไม่สำเร็จ";

      // --- ส่วนตัดเงิน ---
      if (method === 'WALLET') {
        const updateResult = await tx.user.updateMany({
          where: { id: payerId, walletBalance: { gte: parseFloat(amount) } },
          data: { walletBalance: { decrement: parseFloat(amount) } }
        });
        if (updateResult.count === 0) throw new Error("ยอดเงินในกระเป๋าไม่เพียงพอ");
        status = 'SUCCESS';
        message = 'ตัดเงินจากกระเป๋าสำเร็จ';
      } 
      else if (method === 'CREDIT_CARD') {
        const delay = Math.floor(Math.random() * 1000) + 500; 
        await new Promise(resolve => setTimeout(resolve, delay));
        const cardNumber = cardDetails?.number?.replace(/\s/g, '') || '';
        if (MOCK_CARDS[cardNumber]) {
           if(MOCK_CARDS[cardNumber].status !== 'SUCCESS') throw new Error(MOCK_CARDS[cardNumber].message);
           status = 'SUCCESS';
           message = MOCK_CARDS[cardNumber].message;
        } else {
           status = 'SUCCESS'; 
           message = 'ชำระเงินสำเร็จ';
        }
      }
      else if (method === 'BANK_TRANSFER') {
         status = 'SUCCESS';
         message = 'แจ้งโอนเงินเรียบร้อย';
      }

      // --- ส่วนจัดการใบงาน ---
      let finalWorkId = workId; 

      if (status === 'SUCCESS') {
          if (finalWorkId) {
             await tx.freelancerWork.updateMany({
                where: { id: finalWorkId },
                data: { status: "IN_PROGRESS" }
             });
          } 
          else if (receiverId && (serviceId || jobId)) {
             const newWork = await tx.freelancerWork.create({
                data: {
                   price: parseFloat(amount),
                   status: "IN_PROGRESS",
                   jobTitle: workTitle,
                   
                   // Relations
                   jobSeeker: { connect: { id: payerId } },
                   freelancer: { connect: { id: receiverId } },
                   freelancerProfile: { connect: { id: freelancerProfileId } }
                }
             });
             finalWorkId = newWork.id;
          }
      }

      // --- สร้าง Transaction ---
      const transaction = await tx.transaction.create({
        data: {
          amount: parseFloat(amount),
          status: status,
          method: method,
          payerId: payerId,
          receiverId: receiverId || null, 
          workId: finalWorkId || null, 
          gatewayRef: gatewayRef
        }
      });

      return { transaction, message };
    });

    res.json({ success: true, message: result.message, transaction: result.transaction });

  } catch (error) {
    console.error("Payment Error:", error);
    res.status(400).json({ success: false, message: error.message || "Payment Failed" });
  }
};

export const withdraw = async (req, res) => {
  const userId = req.user.id;
  const { amount, bankAccount } = req.body; 

  try {
    if (!amount || amount <= 0) return res.status(400).json({ message: "ยอดเงินไม่ถูกต้อง" });

    await prisma.$transaction(async (tx) => {
      const updateResult = await tx.user.updateMany({
        where: { id: userId, walletBalance: { gte: parseFloat(amount) } },
        data: { walletBalance: { decrement: parseFloat(amount) } }
      });

      if (updateResult.count === 0) throw new Error("ยอดเงินไม่เพียงพอสำหรับการถอน");

      await tx.transaction.create({
        data: {
          amount: parseFloat(amount),
          status: "PENDING", 
          method: "BANK_TRANSFER", 
          payerId: userId,
          receiverId: null,
          gatewayRef: `WITHDRAW-${Date.now()}`,
          slipUrl: `Account: ${bankAccount}`,
        }
      });
    });

    res.json({ success: true, message: "ส่งคำขอถอนเงินแล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ" });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyTransactions = async (req, res) => {
  try {
      const transactions = await prisma.transaction.findMany({
          where: { 
            OR: [
              { payerId: req.user.id },
              { receiverId: req.user.id }
            ]
          },
          orderBy: { createdAt: 'desc' }
      });
      res.json(transactions);
  } catch (error) {
      res.status(500).json({ message: "Error fetching transactions" });
  }
};