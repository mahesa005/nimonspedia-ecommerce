import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const requireStore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (user.role !== 'SELLER') {
      return res.status(403).json({ success: false, message: 'Access denied: Sellers only' });
    }

    const query = `SELECT store_id FROM store WHERE user_id = $1`;
    const result = await pool.query(query, [user.user_id]);

    if (result.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'No store found for this user' });
    }

    (req as any).storeId = result.rows[0].store_id;

    next();
  } catch (error) {
    console.error('requireStore Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};