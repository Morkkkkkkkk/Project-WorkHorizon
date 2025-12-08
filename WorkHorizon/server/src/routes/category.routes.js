import express from "express";
import { listCategories, createCategory, deleteCategory } from "../controllers/category.controller.js";
import { authenticate, roleGuard } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", listCategories);
router.post("/", authenticate, roleGuard("ADMIN"), createCategory);
router.delete("/:id", authenticate, roleGuard("ADMIN"), deleteCategory);

export default router;
