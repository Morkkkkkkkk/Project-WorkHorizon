import prisma from '../config.js';

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // เอา 50 อันล่าสุด
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get notifications', details: error.message });
  }
};

// PATCH /api/notifications/:notificationId/read
export const markAsRead = async (req, res) => {
  try {
    const updated = await prisma.notification.updateMany({
      where: {
        id: req.params.notificationId,
        userId: req.user.id, // เช็กเจ้าของ
      },
      data: { isRead: true },
    });
     if (updated.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
     res.status(500).json({ error: 'Failed to update notification', details: error.message });
  }
};

// POST /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false,
      },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications', details: error.message });
  }
};

// DELETE /api/notifications/:notificationId
export const deleteNotification = async (req, res) => {
  try {
    const deleted = await prisma.notification.deleteMany({
      where: {
        id: req.params.notificationId,
        userId: req.user.id, // (สำคัญ) เช็กว่าเป็นเจ้าของ
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Notification not found or user unauthorized' });
    }
    
    res.status(204).send(); // (No Content - ลบสำเร็จ)
  } catch (error) {
     res.status(500).json({ error: 'Failed to delete notification', details: error.message });
  }
};