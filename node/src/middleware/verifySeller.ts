import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const verifySellerAuction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auctionId = parseInt(req.params.id || '');
    const userId = (req as any).user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (isNaN(auctionId)) {
      return res.status(400).json({ success: false, message: 'Invalid Auction ID' });
    }

    const query = `
      SELECT a.auction_id, p.store_id, s.user_id
      FROM auctions a
      JOIN product p ON a.product_id = p.product_id
      JOIN store s ON p.store_id = s.store_id
      WHERE a.auction_id = $1
    `;

    const result = await pool.query(query, [auctionId]);
    const auction = result.rows[0];

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (auction.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: You are not the seller of this auction' });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
