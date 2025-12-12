import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export const subscribe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const subscription = req.body;

    await NotificationService.subscribeUser(user.user_id, subscription);
    res.json({ success: true, message: 'Subscribed to notifications' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to subscribe' });
  }
};

export const triggerNotification = async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-internal-secret'];
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { userId, title, body, url, type } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    await NotificationService.sendToUser(userId, {
      title,
      body,
      url: url,
    }, type || 'unknown');

    res.json({ success: true, message: 'Notification queued' });
  } catch (error) {
    console.error("Trigger Error:", error);
    res.status(500).json({ success: false, message: 'Internal Error' });
  }
};