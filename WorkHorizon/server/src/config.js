import { PrismaClient } from '@prisma/client';

// สร้าง instance ของ PrismaClient เพื่อใช้ในไฟล์อื่นๆ
const prisma = new PrismaClient();

export default prisma;
