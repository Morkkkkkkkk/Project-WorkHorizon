import prisma from '../config.js';

// สร้าง Controller ง่ายๆ สำหรับดึงข้อมูล Master
const createMasterDataController = (modelName) => async (req, res) => {
  try {
    const { q } = req.query; // (รับ ?q=...)
    const where = q ? { name: { contains: q } } : {}; // (MySQL ไม่รองรับ insensitive)

    const data = await prisma[modelName].findMany({
      where: where,
      orderBy: { name: 'asc' },
      take: 50, // (จำกัดผลการค้นหา)
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch ${modelName}`, details: error.message });
  }
};

export const getCategories = createMasterDataController('category');
export const getJobTypes = createMasterDataController('jobType');
export const getIndustries = createMasterDataController('industry');
export const getProvinces = createMasterDataController('province');
// export const getCountries = createMasterDataController('skill'); // [CLARITY]: ชื่อฟังก์ชันอาจจะทำให้สับสน แต่ปล่อยไว้ตามเดิมเพื่อรักษา Export



// GET /api/data/skills (รองรับการค้นหา)
export const getSkills = async (req, res) => {
  try {
    const { q } = req.query;
    const where = q ? { name: { contains: q } } : {}; // (MySQL ไม่รองรับ insensitive)
    
    const skills = await prisma.skill.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 50 // กันข้อมูลเยอะเกินไป
    });
    res.json(skills);
  } catch (error) {
     res.status(500).json({ error: 'Failed to fetch skills', details: error.message });
  }
};

// GET /api/data/provinces/:provinceId/districts
export const getDistricts = async (req, res) => {
   try {
    const { q } = req.query; // (เพิ่ม) (รองรับการค้นหาอำเภอ)
    const where = { provinceId: req.params.provinceId }; // <--- Base filter
    if (q) {
      where.name = { contains: q };
    }
    
    const districts = await prisma.district.findMany({
      where: where, // [FIX]: ใช้ 'where' object ที่รวมเงื่อนไข q แล้ว
       orderBy: { name: 'asc' }
    });
    res.json(districts);
  } catch (error) {
     res.status(500).json({ error: 'Failed to fetch districts', details: error.message });
  }
};

// GET /api/data/main-categories/:mainCategoryId/sub-categories
export const getSubCategories = async (req, res) => {
  try {
    const { q } = req.query
    const where = { mainCategoryId: req.params.mainCategoryId } // ✅ แก้ไข
    if (q) {
      where.name = { contains: q }
    }

    const subCategories = await prisma.subCategory.findMany({
      where: where,
      orderBy: {name: 'asc' }
    })
    res.json(subCategories)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sub-categories', details: error.message })
  }
}
