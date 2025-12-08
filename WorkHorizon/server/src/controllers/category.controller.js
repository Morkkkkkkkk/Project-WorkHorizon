import prisma from '../config.js';

export const listCategories = async (req, res, next) => {
  try {
    const cats = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json(cats);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Missing name" });
    const exists = await prisma.category.findUnique({ where: { name } });
    if (exists) return res.status(400).json({ message: "Category exists" });
    const c = await prisma.category.create({ data: { name } });
    res.status(201).json(c);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
