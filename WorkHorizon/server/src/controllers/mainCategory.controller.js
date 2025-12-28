import prisma from "../config.js";
import fs from "fs/promises";
import path from "path";

// help
const getWebPath = (filePath) => {
    if (!filePath) return null;
    return filePath.replace(/\\/g, '/').replace("uploads", "/uploads");
};

// help
const deleteFileFromDisk = async (fileUrl) => { // ✅ แก้ไขชื่อตัวแปร
  if (!fileUrl || !fileUrl.startsWith("/uploads")) return; // ✅ แก้ไขตรรกะ
  const oldPath = path.join(
    process.cwd(), // ✅ แก้ไข
    fileUrl.replace("/uploads", "uploads")
  );
  try {
    await fs.unlink(oldPath); // ✅ แก้ไข
  } catch (err) {
    console.warn(`Failed to delete old image: ${oldPath}`, err.message);
  }
};

// --- (Admin) ---

// POST /api/admin/main-categories (สร้าง)
export const createMainCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required." });
    }
    const imageUrl = getWebPath(req.file.path);

    const mainCategory = await prisma.mainCategory.create({
      data: { name, imageUrl },
    });
    res.status(201).json(mainCategory);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/main-categories/:id (อัปเดต Text)
export const updateMainCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const mainCategory = await prisma.mainCategory.update({ // ✅ แก้ไข prism
      where: { id: req.params.id },
      data: { name },
    });
    res.json(mainCategory);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/main-categories/:id/image (อัปเดตรูป)
export const updateMainCategoryImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Image file is required.'})
        }

        const oldCategory = await prisma.mainCategory.findUnique({
            where: {id: req.params.id } // ✅ แก้ไข req.prism.id
        })
        if (!oldCategory) {
            return res.status(404).json({ error: 'Category not found' })
        }

        await deleteFileFromDisk(oldCategory.imageUrl) // ลบรูปเก่า

        const newImageUrl = getWebPath(req.file.path)
        const updateCategory = await prisma.mainCategory.update({
            where:{ id: req.params.id },
            data: { imageUrl: newImageUrl },
        })
        res.json(updateCategory)
    } catch (error) {
        next(error)
    }
}

// DELETE /api/admin/main-categories/:id (ลบ)
export const deleteMainCategory = async (req, res, next ) => {
    try {
        const category = await prisma.mainCategory.delete({
            where: { id: req.params.id }
        })

        await deleteFileFromDisk(category.imageUrl)
        res.status(204).send()
    } catch (error) {
        if (error.code === 'P2003') { //----> (กันลบ ถ้ายังมี SubCategory หรือ Job ผูกอยู่)
            return res.status(400).json({ error: 'Cannot delete. This category is still in use by sub-categories or jobs.' });
        }
        next(error)
    }
}

// --- (Public) ---

// GET /api/main-categories (ดึงทั้งหมดไปแสดงหน้า Home)
export const getMainCategories = async (req, res, next) => {
    try {
        const categories = await prisma.mainCategory.findMany({
            orderBy: { name: 'asc'},
        })
        res.json(categories)
    } catch (error) {
        next(error)
    }
}