import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(authenticateToken);

// GET /api/notifications
router.get('/', getNotifications);

// PATCH /api/notifications/:notificationId/read
router.patch('/:notificationId/read', markAsRead);

// POST /api/notifications/read-all
router.post('/read-all', markAllAsRead);

// DELETE /api/notifications/:notificationId
router.delete('/:notificationId', deleteNotification);

export default router;
