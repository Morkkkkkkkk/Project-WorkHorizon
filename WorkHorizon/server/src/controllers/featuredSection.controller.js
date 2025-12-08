import prisma from "../config.js";

// --- (Public) ---
// GET /api/featured-sections
export const getPublicSections = async (req, res, next) => {
  try {
    const sections = await prisma.featuredSection.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        mainCategory: {
          select: { id: true, name: true } // (ดึงข้อมูลหมวดหมู่มาด้วย)
        }
      }
    });
    res.json(sections);
  } catch (error) {
    next(error);
  }
};

// --- (Admin) ---
// GET /api/admin/featured-sections
export const getAdminSections = async (req, res, next) => {
  try {
    const sections = await prisma.featuredSection.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        mainCategory: { select: { id: true, name: true } }
      }
    });
    res.json(sections);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/featured-sections
export const createSection = async (req, res, next) => {
  try {
    const { title, mainCategoryId, sortOrder, contentType } = req.body;
    if (!title || !mainCategoryId) {
      return res.status(400).json({ error: "Title and Main Category are required." });
    }
    const section = await prisma.featuredSection.create({
      data: {
        title,
        mainCategoryId,
        sortOrder: sortOrder || 0,
        contentType: contentType || 'JOB'
      }
    });
    res.status(201).json(section);
  } catch (error) {
     if (error.code === 'P2002') { // (กันหมวดหมู่ซ้ำ)
      return res.status(400).json({ error: 'This main category is already featured.' });
    }
    next(error);
  }
};

// PUT /api/admin/featured-sections/:id
export const updateSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, mainCategoryId, sortOrder, contentType } = req.body;
    
     const data = {
        title,
        mainCategoryId,
        sortOrder: sortOrder || 0
     };

    const section = await prisma.featuredSection.update({
      where: { id },
      data: {
        title,
        mainCategoryId,
        sortOrder: sortOrder || 0,
        contentType: contentType
      }
    });
    res.json(section);
  } catch (error) {
     if (error.code === 'P2002') {
      return res.status(400).json({ error: 'This main category is already featured.' });
    }
    next(error);
  }
};

// DELETE /api/admin/featured-sections/:id
export const deleteSection = async (req, res, next) => {
  try {
    await prisma.featuredSection.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};