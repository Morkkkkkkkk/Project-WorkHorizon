import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// --- 🛠️ MOCK DATA ---
const MOCK_CARDS = {
  '4242424242424242': { status: 'SUCCESS', message: 'ชำระเงินสำเร็จ' },
  '4000000000000000': { status: 'FAILED', message: 'บัตรถูกปฏิเสธ' },
  '5555555555555555': { status: 'FAILED', message: 'วงเงินไม่เพียงพอ' },
};

export const processPayment = async (req, res) => {
  // 1. 🔒 Security: ใช้ ID จาก Token เท่านั้น
  const payerId = req.user.id; 
  const { amount, method, workId, cardDetails } = req.body;

  try {
    if (!amount || amount <= 0) return res.status(400).json({ message: "ยอดเงินไม่ถูกต้อง" });

    // 2. 🛡️ เริ่ม Database Transaction (ถ้าพังจุดไหน ให้ Rollback ทั้งหมด)
    const result = await prisma.$transaction(async (tx) => {
      
      let status = "PENDING";
      let gatewayRef = `ref_${Date.now()}`;
      let message = "ดำเนินการไม่สำเร็จ";

      // --- SCENARIO 3: จ่ายด้วย Wallet ---
      if (method === 'WALLET') {
        // 3. 🏎️ Atomic Update: เช็คยอดและตัดเงินในคำสั่งเดียว (ป้องกัน Race Condition)
        const updateResult = await tx.user.updateMany({
          where: { 
            id: payerId, 
            walletBalance: { gte: parseFloat(amount) } // ต้องมีเงิน >= ยอดจ่าย
          },
          data: { 
            walletBalance: { decrement: parseFloat(amount) } 
          }
        });

        if (updateResult.count === 0) {
          throw new Error("ยอดเงินในกระเป๋าไม่เพียงพอ");
        }
        
        status = 'SUCCESS';
        message = 'ตัดเงินจากกระเป๋าสำเร็จ';
      } 
      // --- SCENARIO 1: จ่ายด้วยบัตรเครดิต (Mock) ---
      else if (method === 'CREDIT_CARD') {
        // หน่วงเวลาจำลอง
        const delay = Math.floor(Math.random() * 1000) + 500; 
        await new Promise(resolve => setTimeout(resolve, delay));

        const cardNumber = cardDetails?.number?.replace(/\s/g, '') || '';
        if (MOCK_CARDS[cardNumber]) {
           if(MOCK_CARDS[cardNumber].status !== 'SUCCESS') throw new Error(MOCK_CARDS[cardNumber].message);
           status = 'SUCCESS';
           message = MOCK_CARDS[cardNumber].message;
        } else {
           // Default Success for Mock random
           status = 'SUCCESS'; 
           message = 'ชำระเงินสำเร็จ';
        }
      }
      // --- SCENARIO 2: Bank Transfer ---
      else if (method === 'BANK_TRANSFER') {
         status = 'SUCCESS';
         message = 'แจ้งโอนเงินเรียบร้อย';
      }

      // 4. 💼 Escrow System: ถ้าจ่ายสำเร็จ เงินจะยังไม่เข้า Freelancer ทันที
      // แค่อัปเดตสถานะงานให้เริ่มทำได้ (IN_PROGRESS)
      if (status === 'SUCCESS' && workId) {
        await tx.freelancerWork.update({
          where: { id: workId },
          data: { status: "IN_PROGRESS" }
        });
      }

      // 5. บันทึก Transaction (ผู้รับ = null เพราะเงินอยู่ที่ระบบกลาง)
      const transaction = await tx.transaction.create({
        data: {
          amount: parseFloat(amount),
          status: status,
          method: method,
          payerId: payerId,
          receiverId: null, 
          workId: workId || null,
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

// ✅ ฟังก์ชันแจ้งถอนเงิน (เปลี่ยนเป็นระบบรออนุมัติ)
export const withdraw = async (req, res) => {
  const userId = req.user.id; // 🔒 ใช้ Token
  const { amount, bankAccount } = req.body; 

  try {
    if (!amount || amount <= 0) return res.status(400).json({ message: "ยอดเงินไม่ถูกต้อง" });

    await prisma.$transaction(async (tx) => {
      // 1. ตัดเงินทันทีเพื่อ Lock วงเงิน
      const updateResult = await tx.user.updateMany({
        where: { 
           id: userId, 
           walletBalance: { gte: parseFloat(amount) } 
        },
        data: { walletBalance: { decrement: parseFloat(amount) } }
      });

      if (updateResult.count === 0) {
        throw new Error("ยอดเงินไม่เพียงพอสำหรับการถอน");
      }

      // 2. สร้าง Transaction สถานะ PENDING (รอ Admin อนุมัติ)
      await tx.transaction.create({
        data: {
          amount: parseFloat(amount),
          status: "PENDING", 
          method: "BANK_TRANSFER", 
          payerId: userId, // เงินออกจาก User นี้
          receiverId: null, // ออกนอกระบบ
          gatewayRef: `WITHDRAW-${Date.now()}`,
          slipUrl: `Account: ${bankAccount}`,
          // หมายเหตุ: ควรเก็บ bankAccount ไว้ใน DB ด้วย (ถ้ามี field รองรับ หรือใส่ใน slipUrl/Note ชั่วคราว)
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