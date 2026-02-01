import express from "express";
import {
  getActiveTheme,
  getAllThemes,
  createTheme,
  activateTheme,
  resetToDefault,
  deleteTheme,
} from "../controllers/theme.controller.js";
import {
  authenticateToken,
  isAdmin,
} from "../middlewares/auth.middleware.js"; // สมมติว่ามี Middleware นี้

const router = express.Router();

// Public
router.get("/active", getActiveTheme);

// Admin Only
router.get("/", authenticateToken, isAdmin, getAllThemes);
router.post("/", authenticateToken, isAdmin, createTheme);
router.put("/:id/activate", authenticateToken, isAdmin, activateTheme);
router.put("/reset", authenticateToken, isAdmin, resetToDefault);
router.delete("/:id", authenticateToken, isAdmin, deleteTheme);

export default router;
