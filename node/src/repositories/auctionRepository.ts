import pool from '../config/database';
import { AuctionData, AuctionDetailData, BidData, BidHistoryData, OrderDetailsQuery, OrderInsertResult } from '../models/auctionModel';

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

  async createBid(auctionId: number, userId: number, amount: number): Promise<{ bid: BidData; newEndTime: Date; }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const auctionRes = await client.query<AuctionData>(
        'SELECT * FROM "auctions" WHERE auction_id = $1 FOR UPDATE', 
        [auctionId]
      );
      const auction = auctionRes.rows[0];

      if (!auction) throw new Error("Auction not found");
      
      if (!['active', 'ongoing'].includes(auction.status)) {
        throw new Error("Auction is not open for bidding");
      }

      const userRes = await client.query('SELECT balance FROM "user" WHERE user_id = $1', [userId]);
      
      if (userRes.rows[0].balance < amount) throw new Error("Insufficient balance");

      if (auction.winner_id) {
        await client.query(
          'UPDATE "user" SET balance = balance + $1 WHERE user_id = $2',
          [auction.current_price, auction.winner_id]
        );
      }

      await client.query(
        'UPDATE "user" SET balance = balance - $1 WHERE user_id = $2',
        [amount, userId]
      );

      const bidRes = await client.query<BidData>(
        `INSERT INTO "auction_bids" (auction_id, bidder_id, bid_amount, bid_time)
         VALUES ($1, $2, $3, NOW())
         RETURNING *`,
        [auctionId, userId, amount]
      );

      const bidRow = bidRes.rows[0];
      if (!bidRow) {
        throw new Error("Failed to insert auction bids");
      }

      const updateAuction = `
        UPDATE "auctions" 
        SET current_price = $1, 
            winner_id = $2,
            status = 'ongoing',
            end_time = NOW() + interval '15 seconds' 
        WHERE auction_id = $3
        RETURNING end_time
      `;
      const updatedAuctionRes = await client.query<{end_time: Date}>(updateAuction, [amount, userId, auctionId]);

      const row = updatedAuctionRes.rows[0];
      if (!row) {
        throw new Error("Failed to update auction");
      }

      await client.query('COMMIT');
      
      return {
        bid: bidRow,
        newEndTime: row.end_time,
      };

    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async startAuction(auctionId: number): Promise<AuctionData | null> {
    const query = `
      UPDATE "auctions"
      SET status = 'active'
      WHERE auction_id = $1 
        AND status = 'scheduled'
        AND start_time <= NOW()
      RETURNING *
    `;
    const res = await pool.query<AuctionData>(query, [auctionId]);
    const row = res.rows[0]
    if (!row) throw new Error("Failed to start auction");
    return row;
  },

  async closeAuction(auctionId: number): Promise<AuctionData | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const closeQuery = `
        UPDATE "auctions" 
        SET status = 'ended' 
        WHERE auction_id = $1 AND status IN ('active', 'ongoing')
        RETURNING *
      `;
      const closeRes = await client.query<AuctionData>(closeQuery, [auctionId]);
      const auction = closeRes.rows[0];

      if (!auction) {
        await client.query('ROLLBACK');
        return null;
      }

      if (auction.winner_id) {
        const detailsQuery = `
          SELECT p.store_id, u.address 
          FROM "product" p, "user" u 
          WHERE p.product_id = $1 AND u.user_id = $2
        `;
        const detailsRes = await client.query<OrderDetailsQuery>(detailsQuery, [auction.product_id, auction.winner_id]);
        const details = detailsRes.rows[0];

        if (details) {
          const orderQuery = `
            INSERT INTO "order" (
              buyer_id, store_id, total_price, shipping_address, status, created_at
            ) VALUES ($1, $2, $3, $4, 'approved', NOW())
            RETURNING order_id
          `; 
          
          const orderRes = await client.query<OrderInsertResult>(orderQuery, [
            auction.winner_id, 
            details.store_id, 
            auction.current_price, 
            details.address
          ]);
          const orderId = orderRes.rows[0]?.order_id;
          if (!orderId) throw new Error("Order insert failed");

          const itemQuery = `
            INSERT INTO "order_items" (
              order_id, product_id, quantity, price_at_order, subtotal
            ) VALUES ($1, $2, 1, $3, $4)
          `;
          await client.query(itemQuery, [
            orderId, 
            auction.product_id, 
            auction.current_price, 
            auction.current_price
          ]);
          
          await client.query('UPDATE "product" SET stock = stock - 1 WHERE product_id = $1', [auction.product_id]);
        }
      }

      await client.query('COMMIT');
      return auction;

    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};