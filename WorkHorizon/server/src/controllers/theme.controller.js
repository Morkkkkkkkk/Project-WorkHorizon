import prisma from "../config.js";

// ดึงธีมที่ Active อยู่ปัจจุบัน (สำหรับ User ทั่วไป)
export const getActiveTheme = async (req, res) => {
  try {
    const theme = await prisma.seasonTheme.findFirst({
      where: { isActive: true },
    });
    // ถ้าไม่มีธีม Active ให้ส่งค่า Default กลับไป
    if (!theme) {
      return res.json({
        primaryColor: "#2563eb", // สีฟ้าเดิมของเว็บ
        secondaryColor: "#1d4ed8",
        backgroundColor: "#f8fafc",
        decorationImage: null
      });
    }
    res.json(theme);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ดึงธีมทั้งหมด (สำหรับ Admin)
export const getAllThemes = async (req, res) => {
  try {
    const themes = await prisma.seasonTheme.findMany();
    res.json(themes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// สร้างธีมใหม่ (Admin)
export const createTheme = async (req, res) => {
  try {
    const theme = await prisma.seasonTheme.create({
      data: req.body
    });
    res.json(theme);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// เปลี่ยนธีมที่ใช้งาน (Admin)
export const activateTheme = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. ปิด Active ทุกอันก่อน
    await prisma.seasonTheme.updateMany({
      data: { isActive: false }
    });

    // 2. เปิด Active อันที่เลือก
    const theme = await prisma.seasonTheme.update({
      where: { id },
      data: { isActive: true }
    });

    res.json(theme);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ เพิ่มฟังก์ชันนี้: รีเซ็ตกลับเป็นค่าเริ่มต้น (ปิด Active ทั้งหมด)
export const resetToDefault = async (req, res) => {
  try {
    await prisma.seasonTheme.updateMany({
      data: { isActive: false } // สั่งปิดทุกธีม
    });
    res.json({ message: "Reset to default theme successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTheme = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.seasonTheme.delete({
            where: { id }
        });
        res.json({ message: "Theme deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};