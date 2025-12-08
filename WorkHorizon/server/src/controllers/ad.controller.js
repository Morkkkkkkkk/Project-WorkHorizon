import prisma from '../config.js';
import fs from 'fs/promises'; 
import path from 'path';

// (Helper)
const getWebPath = (filePath) => {
  return filePath.replace(/\\/g, '/').replace('uploads', '/uploads');
};

// --- (Public) ---
// (อัปเกรด) GET /api/advertisements (รองรับการกรองตามขนาด)
export const getAds = async (req, res) => {
  try {
    const { size } = req.query; // (เช่น ?size=LARGE_SLIDE)

    const where = {
      isActive: true,
    };

    if (size) {
      where.adSize = size; // (กรองตามขนาด)
    }

    const ads = await prisma.advertisement.findMany({
      where: where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get ads' });
  }
};

// --- (Admin) ---

// (อัปเกรด) POST /api/advertisements
export const createAd = async (req, res) => {
  try {
    // (อัปเกรด) 1. ดึง adSize และ linkUrl
    const { title, linkUrl, isActive, adSize } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }
    
    const imageUrl = getWebPath(req.file.path);

    const ad = await prisma.advertisement.create({
      data: {
        title,
        linkUrl: linkUrl || null, // (อัปเกรด) ถ้าว่างให้เป็น null
        imageUrl,
        isActive: isActive === 'true', 
        adSize: adSize || 'LARGE_SLIDE', // (อัปเกรด) เพิ่ม adSize
      },
    });
    res.status(201).json(ad);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create ad', details: error.message });
  }
};

// (อัปเกรด) PUT /api/advertisements/:adId (อัปเดต Text)
export const updateAd = async (req, res) => {
  try {
    // (อัปเกรด)
    const { title, linkUrl, isActive, adSize } = req.body;
    const ad = await prisma.advertisement.update({
      where: { id: req.params.adId },
      data: { 
        title, 
        linkUrl: linkUrl || null, // (อัปเกรด)
        isActive, 
        adSize // (อัปเกรด)
      },
    });
    res.json(ad);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ad' });
  }
};

// (ฟังก์ชันนี้ยังไม่ได้ใช้ใน Route แต่ไฟล์ adminApi.js (Canvas) มี)
// GET /admin/advertisements
export const getAdminAds = async (req, res) => {
   try {
    const ads = await prisma.advertisement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get ads' });
  }
};
export const updateAdImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }
    
    // 1. (หา Ad เก่า เพื่อเอา Path รูปเก่ามาลบ)
    const oldAd = await prisma.advertisement.findUnique({
      where: { id: req.params.adId },
    });

    if (!oldAd) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // 2. (ลบรูปเก่าออกจาก Disk)
    if (oldAd.imageUrl) {
      const oldPath = path.join(process.cwd(), oldAd.imageUrl.replace('/uploads', 'uploads'));
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        console.warn(`Failed to delete old image: ${oldPath}`, err.message);
      }
    }

    // 3. (อัปเดต DB ด้วย Path รูปใหม่)
    const newImageUrl = getWebPath(req.file.path);
    const updatedAd = await prisma.advertisement.update({
      where: { id: req.params.adId },
      data: { imageUrl: newImageUrl },
    });
    
    res.json(updatedAd);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update image' });
  }
};
export const deleteAd = async (req, res) => {
  try {
    // 1. (ลบ Ad ออกจาก DB และเอารูปเก่ามาด้วย)
    const ad = await prisma.advertisement.delete({
      where: { id: req.params.adId },
    });

    // 2. (ลบรูปเก่าออกจาก Disk)
    if (ad.imageUrl) {
      const oldPath = path.join(process.cwd(), ad.imageUrl.replace('/uploads', 'uploads'));
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        console.warn(`Failed to delete image: ${oldPath}`, err.message);
      }
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ad' });
  }
};