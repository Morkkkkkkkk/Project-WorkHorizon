import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// --- 🛠️ MOCK DATA สำหรับทดสอบ ---
const MOCK_CARDS = {
  '4242424242424242': { status: 'SUCCESS', message: 'ชำระเงินสำเร็จ' }, // บัตรผ่าน
  '4000000000000000': { status: 'FAILED', message: 'บัตรถูกปฏิเสธ (Card Declined)' }, // บัตรเสีย
  '5555555555555555': { status: 'FAILED', message: 'วงเงินไม่เพียงพอ (Insufficient Funds)' }, // เงินไม่พอ
};

export const processPayment = async (req, res) => {
  const { payerId, receiverId, amount, method, workId, cardDetails } = req.body;

  try {
    if (!payerId) return res.status(401).json({ success: false, message: "Unauthorized" });
    
    // 1. หา User
    const payer = await prisma.user.findUnique({ where: { id: payerId } });
    if (!payer) return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });

    // 2. หน่วงเวลาจำลองการประมวลผล (Simulate Network Delay)
    // สุ่มรอ 1.5 - 3 วินาที ให้เหมือนระบบกำลังหมุนติ้วๆ
    const delay = Math.floor(Math.random() * 1500) + 1500; 
    await new Promise(resolve => setTimeout(resolve, delay));

    let status = "FAILED";
    let message = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
    let gatewayRef = `ch_${Math.random().toString(36).substr(2, 9).toUpperCase()}`; // จำลอง Transaction ID แบบ Stripe (ch_xxxx)

    // =========================================================
    // 💳 SCENARIO 1: จ่ายด้วยบัตรเครดิต (Credit Card)
    // =========================================================
    if (method === 'CREDIT_CARD') {
      const cardNumber = cardDetails?.number?.replace(/\s/g, '') || '';
      
      // เช็ค Mock Logic
      if (MOCK_CARDS[cardNumber]) {
        status = MOCK_CARDS[cardNumber].status;
        message = MOCK_CARDS[cardNumber].message;
      } else {
        // กรณีเลขบัตรมั่วๆ ให้ผ่านแบบ Random (หรือจะให้ผ่านหมดก็ได้ถ้าอยากง่าย)
        // สมมติ: ถ้าเลขลงท้ายเลขคู่ = ผ่าน, เลขคี่ = ไม่ผ่าน
        const lastDigit = parseInt(cardNumber.slice(-1));
        if (!isNaN(lastDigit) && lastDigit % 2 === 0) {
            status = 'SUCCESS';
            message = 'ชำระเงินสำเร็จ (Random Approved)';
        } else {
            status = 'FAILED';
            message = 'บัตรไม่ถูกต้อง หรือข้อมูลผิดพลาด';
        }
      }
    }

    // =========================================================
    // 🏦 SCENARIO 2: โอนเงิน (Bank Transfer / QR PromtPay)
    // =========================================================
    else if (method === 'BANK_TRANSFER') {
      // สมมติว่า Frontend ส่งหลักฐาน หรือกดยืนยันแล้ว
      status = 'SUCCESS';
      message = 'แจ้งโอนเงินเรียบร้อย';
      gatewayRef = `th_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    // =========================================================
    // 👛 SCENARIO 3: ตัด Wallet (Internal)
    // =========================================================
    else if (method === 'WALLET') {
      if (parseFloat(payer.walletBalance) >= parseFloat(amount)) {
        status = 'SUCCESS';
        message = 'ตัดเงินจากกระเป๋าสำเร็จ';
        
        // ตัดเงินทันที
        await prisma.user.update({
          where: { id: payerId },
          data: { walletBalance: { decrement: parseFloat(amount) } }
        });
      } else {
        message = 'ยอดเงินในกระเป๋าไม่เพียงพอ';
      }
    }

    // --- ✅ ถ้าสำเร็จ: ดำเนินการต่อ ---
    if (status === 'SUCCESS') {
      
      // 1. เพิ่มเงินให้คนรับ (ถ้ามี)
      if (receiverId) {
        await prisma.user.update({
          where: { id: receiverId },
          data: { walletBalance: { increment: parseFloat(amount) } }
        });
      }

      // 2. อัปเดตสถานะงาน (ถ้ามี)
      if (workId) {
        await prisma.freelancerWork.update({
          where: { id: workId },
          data: { status: "IN_PROGRESS" } // หรือสถานะอื่นตาม Flow
        });
      }
    }

    // --- 📝 บันทึก Transaction ลง DB ---
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        status: status,
        method: method,
        payerId: payerId,
        receiverId: receiverId || null,
        workId: workId || null,
        gatewayRef: gatewayRef
      }
    });

    return res.json({ 
        success: status === 'SUCCESS', 
        message, 
        transaction,
        details: { gatewayRef, method } // ส่งกลับไปโชว์สวยๆ
    });

  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ ฟังก์ชันถอนเงิน
export const withdraw = async (req, res) => {
  const { userId, amount, bankAccount } = req.body;

  try {
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "ข้อมูลไม่ถูกต้อง" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

    if (parseFloat(user.walletBalance) < parseFloat(amount)) {
      return res.status(400).json({ success: false, message: "ยอดเงินไม่เพียงพอ" });
    }

    // 1. ตัดเงิน
    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: parseFloat(amount) } }
    });

    // 2. บันทึก Transaction
    // สำหรับการถอน เราอาจจะใช้ payerId เป็น user เอง และ receiverId เป็น null (ออกไปข้างนอก)
    await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        status: "SUCCESS", // สมมติว่าสำเร็จทันที
        method: "BANK_TRANSFER", 
        payerId: userId,
        receiverId: null, // เงินออกจากระบบ
        workId: null,
        gatewayRef: `WITHDRAW-${Date.now()}`
      }
    });

    return res.json({ success: true, message: "แจ้งถอนเงินสำเร็จ" });

  } catch (error) {
    console.error("Withdraw Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


export const getMyTransactions = async (req, res) => {
    // ฟังก์ชันดึงประวัติการจ่ายเงินของ User (ถ้าต้องการ)
    try {
        const { userId } = req.params;
        const transactions = await prisma.transaction.findMany({
            where: { payerId: userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching transactions" });
    }
  }