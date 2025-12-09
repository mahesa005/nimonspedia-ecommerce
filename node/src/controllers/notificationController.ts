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