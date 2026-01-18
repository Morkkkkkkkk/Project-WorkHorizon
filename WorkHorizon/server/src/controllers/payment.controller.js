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

    // ✅ 1. ตรวจสอบว่าเป็น "การเติมเงิน" หรือไม่?
    // (เงื่อนไข: ผู้จ่าย = ผู้รับ หรือ ไม่ระบุผู้รับแต่ไม่มีงาน)
    const isTopUp = (payerId === receiverId) || (!receiverId && !workId);

    // ------------------------------------------------------------------
    // 2. เตรียมชื่อ Title
    // ------------------------------------------------------------------
    let workTitle = isTopUp ? "เติมเงินเข้ากระเป๋า (Top Up)" : "งานจ้างทั่วไป"; 
    
    if (!isTopUp) {
        if (serviceId) {
            const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { title: true } });
            if (service) workTitle = service.title;
        } else if (jobId) {
            const job = await prisma.job.findUnique({ where: { id: jobId }, select: { title: true } });
            if (job) workTitle = job.title;
        }
    }

    // ------------------------------------------------------------------
    // 3. เช็คงานซ้ำ (Duplicate Check) - ข้ามถ้าเป็น Top Up
    // ------------------------------------------------------------------
    if (!isTopUp && !workId && receiverId) { 
        const existingWork = await prisma.freelancerWork.findFirst({
            where: {
                jobSeekerId: payerId,       
                freelancerId: receiverId,   
                status: "IN_PROGRESS",      
                jobTitle: workTitle         
            }
        });

        if (existingWork) {
            return res.status(400).json({ message: "คุณได้จ้างงานนี้ไปแล้ว (ตรวจสอบที่เมนู 'งานที่ฉันจ้าง')" });
        }
    }

    // ------------------------------------------------------------------
    // 4. หา Profile ID (✅ แก้ไข: ข้ามถ้าเป็น Top Up)
    // ------------------------------------------------------------------
    let freelancerProfileId = null;
    if (receiverId && !isTopUp) { // <-- เพิ่ม !isTopUp
        const profile = await prisma.freelancerProfile.findFirst({ where: { userId: receiverId } });
        
        // ถ้าเป็นการจ่ายงานจริง ผู้รับต้องมีโปรไฟล์ แต่ถ้าหาไม่เจอให้แจ้งเตือน
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
        
        // Mock Card Logic
        if (MOCK_CARDS[cardNumber]) {
           if(MOCK_CARDS[cardNumber].status !== 'SUCCESS') throw new Error(MOCK_CARDS[cardNumber].message);
           status = 'SUCCESS';
           message = MOCK_CARDS[cardNumber].message;
        } else {
           // Default Success for any other number (Sandbox mode)
           status = 'SUCCESS'; 
           message = 'ชำระเงินสำเร็จ';
        }
      }
      else if (method === 'BANK_TRANSFER') {
         // ปกติ Bank Transfer ต้องรอ Admin approve แต่ใน Demo ให้ Success เลย
         status = 'SUCCESS'; 
         message = 'แจ้งโอนเงินเรียบร้อย';
      }

      // ✅ เพิ่ม Logic: ถ้าเป็นการเติมเงิน (Top Up) และสถานะสำเร็จ -> เพิ่มเงินให้ตัวเอง
      if (isTopUp && status === 'SUCCESS') {
          await tx.user.update({
              where: { id: payerId },
              data: { walletBalance: { increment: parseFloat(amount) } }
          });
          message = "เติมเงินเข้ากระเป๋าเรียบร้อย";
      }

      // --- ส่วนจัดการใบงาน (ข้ามถ้าเป็น Top Up) ---
      let finalWorkId = workId; 

      if (!isTopUp && status === 'SUCCESS') {
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
          // ถ้าเติมเงิน receiverId ให้เป็น NULL หรือใส่ ID ตัวเองก็ได้ (แต่ในที่นี้ใส่ NULL เพื่อแยกแยะง่าย)
          receiverId: isTopUp ? null : receiverId, 
          workId: finalWorkId || null, 
          gatewayRef: gatewayRef,
          type: isTopUp ? 'TOPUP' : 'PAYMENT' // (ถ้า Schema มี field type แนะนำให้ใส่)
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