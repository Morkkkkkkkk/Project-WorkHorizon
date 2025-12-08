import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const processPayment = async (req, res) => {
  // รับค่า: คนจ่าย, คนรับ(ถ้ามี), จำนวนเงิน, วิธีจ่าย, รหัสงาน
  const { payerId, receiverId, amount, method, workId, ...paymentDetails } = req.body;

  try {

    // 🔴 [เพิ่มตรงนี้] เช็คก่อนเลยว่ามี payerId ไหม ถ้าไม่มีให้ด่ากลับไป (อย่าเพิ่งเรียก Database)
    if (!payerId) {
      console.error("❌ Error: payerId is missing!", req.body); // Log ดูว่าส่งอะไรมาบ้าง
      return res.status(400).json({ 
        success: false, 
        message: "เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้งาน (กรุณาล็อกอินใหม่)" 
      });
    }

    if (!amount) {
      return res.status(400).json({ success: false, message: "ระบุจำนวนเงินไม่ถูกต้อง" });
    }
    
    // 1. หาคนจ่ายเงิน
    const payer = await prisma.user.findUnique({ where: { id: payerId } });
    if (!payer) return res.status(404).json({ message: "ไม่พบผู้จ่ายเงิน" });

    let status = "FAILED";
    let message = "ทำรายการไม่สำเร็จ";

    // ==========================================
    // 🟠 ZONE 1: ตรวจสอบการจ่ายเงิน (Simulation)
    // ==========================================
    
    // CASE A: จ่ายผ่าน Wallet (ต้องเช็คเงินในกระเป๋า)
    if (method === 'WALLET') {
      if (parseFloat(payer.walletBalance) >= parseFloat(amount)) {
        status = "SUCCESS"; 
        // ตัดเงินคนจ่ายทันที
        await prisma.user.update({
          where: { id: payerId },
          data: { walletBalance: { decrement: parseFloat(amount) } }
        });
      } else {
        message = "ยอดเงินใน Wallet ไม่พอ";
      }
    } 
    
    // CASE B: จ่ายผ่าน Bank (หน่วงเวลา + ให้ผ่านหมด)
    else if (method === 'BANK_TRANSFER') {
      await new Promise(r => setTimeout(r, 2000)); // รอ 2 วิ
      status = "SUCCESS";
    }

    // CASE C: จ่ายผ่านบัตร (เช็ค Magic Number)
    else if (method === 'CREDIT_CARD') {
       if (paymentDetails.cardNumber && paymentDetails.cardNumber.includes("4242")) {
           status = "SUCCESS";
       } else {
           message = "บัตรถูกปฏิเสธ (ลองใช้เลข 4242...)";
       }
    }

    // ==========================================
    // 🟢 ZONE 2: ถ้าจ่ายสำเร็จ -> โอนเงินให้คนรับ
    // ==========================================
    if (status === "SUCCESS") {
      message = "ชำระเงินเรียบร้อย";

      // ถ้ามีคนรับเงิน (เช่น จ้าง Freelancer) -> เพิ่มเงินให้เขา
      if (receiverId) {
         await prisma.user.update({
            where: { id: receiverId },
            data: { walletBalance: { increment: parseFloat(amount) } }
         });
      }

      // ถ้าเป็นการจ่ายค่างาน -> อัปเดตสถานะงาน
      if (workId) {
          await prisma.freelancerWork.update({
              where: { id: workId },
              data: { status: "IN_PROGRESS" }
          });
      }
    }

    // ==========================================
    // 🔵 ZONE 3: บันทึกประวัติ (Transaction)
    // ==========================================
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        status: status,
        method: method,
        payerId: payerId,
        receiverId: receiverId || null,
        workId: workId || null,
        gatewayRef: `TXN-${Date.now()}`
      }
    });

    return res.json({ success: status === "SUCCESS", message, transaction });

  } catch (error) {
    console.error(error);
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
};