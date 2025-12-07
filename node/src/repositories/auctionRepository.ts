import pool from '../config/database';
import { AuctionData, AuctionDetailData, BidHistoryData } from '../models/auctionModel';

export const AuctionRepository = {
  async findDetailById(auctionId: number): Promise<AuctionDetailData | null> {
    const query = `
      SELECT 
        a.auction_id, a.current_price, a.min_increment, 
        a.start_time, a.end_time, a.status, a.winner_id,
        p.product_id, p.product_name, p.description, p.main_image_path,
        s.store_id, s.store_name,
        (SELECT COUNT(DISTINCT bidder_id) FROM "auction_bids" WHERE auction_id = a.auction_id) as bidder_count
      FROM "auctions" a
      JOIN "product" p ON a.product_id = p.product_id
      JOIN "store" s ON p.store_id = s.store_id
      WHERE a.auction_id = $1
    `;
    const result = await pool.query<AuctionDetailData>(query, [auctionId]);
    return result.rows[0] || null;
  },

  async findBidsByAuctionId(auctionId: number, limit = 10): Promise<BidHistoryData[]> {
    const query = `
      SELECT 
        b.bid_id, b.bid_amount, b.bid_time,
        u.name as bidder_name, u.user_id
      FROM "auction_bids" b
      JOIN "user" u ON b.bidder_id = u.user_id
      WHERE b.auction_id = $1
      ORDER BY b.bid_amount DESC
      LIMIT $2
    `;
    const result = await pool.query<BidHistoryData>(query, [auctionId, limit]);
    return result.rows;
  },
};