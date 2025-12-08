import { Router } from 'express';
import { getPublicSections } from '../controllers/featuredSection.controller.js';

const router = Router();

// (Public)
router.get('/', getPublicSections);

export default router;