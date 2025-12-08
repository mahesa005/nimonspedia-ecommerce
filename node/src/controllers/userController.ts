import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { MeResponse } from '../models/User';

export async function getMe(req: Request, res: Response<MeResponse>) {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, data: null, message: 'Unauthorized' });

    const dbUser = await userService.getUserById(user.user_id);
    if (!dbUser) return res.status(404).json({ success: false, data: null, message: 'User not found' });

    return res.json({ success: true, data: dbUser });
  } catch (err) {
    console.error('GET /me error:', err);
    return res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
}
