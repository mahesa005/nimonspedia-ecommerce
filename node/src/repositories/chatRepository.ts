import pool from '../config/database';
import { ChatMessage, ChatRoom, SendMessageDTO } from '../models/chatModel';

export const ChatRepository = {
  async findRoomsByUser(userId: number, role: 'BUYER' | 'SELLER', searchQuery?: string): Promise<ChatRoom[]> {
      let query = '';
      const params: any[] = [];
  
      const searchPattern = searchQuery ? `%${searchQuery}%` : null;
  
      if (role === 'BUYER') {
        query = `
          SELECT 
            cr.store_id, 
            cr.buyer_id, 
            cr.last_message_at,
            s.store_name AS partner_name,
            s.store_logo_path AS partner_image,
            COALESCE(
              (SELECT content FROM chat_messages m 
               WHERE m.store_id = cr.store_id AND m.buyer_id = cr.buyer_id 
               ORDER BY m.created_at DESC LIMIT 1), 
              ''
            ) AS last_message_content,
            (SELECT COUNT(*)::int FROM chat_messages m 
             WHERE m.store_id = cr.store_id AND m.buyer_id = cr.buyer_id 
             AND m.is_read = false AND m.sender_id != $1) AS unread_count
          FROM chat_rooms cr
          JOIN store s ON cr.store_id = s.store_id
          WHERE cr.buyer_id = $1
        `;
        params.push(userId);
  
        if (searchPattern) {
          query += ` AND s.store_name ILIKE $2`;
          params.push(searchPattern);
        }
  
        query += ` ORDER BY cr.last_message_at DESC`;
  
      } else {
        const storeRes = await pool.query(`SELECT store_id FROM store WHERE user_id = $1`, [userId]);
        if (storeRes.rows.length === 0) return []; 
        
        const storeId = storeRes.rows[0].store_id;
  
        query = `
          SELECT 
            cr.store_id, 
            cr.buyer_id, 
            cr.last_message_at,
            u.name AS partner_name,
            NULL AS partner_image,
            COALESCE(
              (SELECT content FROM chat_messages m 
               WHERE m.store_id = cr.store_id AND m.buyer_id = cr.buyer_id 
               ORDER BY m.created_at DESC LIMIT 1), 
              ''
            ) AS last_message_content,
            (SELECT COUNT(*)::int FROM chat_messages m 
             WHERE m.store_id = cr.store_id AND m.buyer_id = cr.buyer_id 
             AND m.is_read = false AND m.sender_id != $1) AS unread_count
          FROM chat_rooms cr
          JOIN "user" u ON cr.buyer_id = u.user_id
          WHERE cr.store_id = $2
        `;
        
        params.push(userId, storeId);
  
        if (searchPattern) {
          query += ` AND u.name ILIKE $3`;
          params.push(searchPattern);
        }
  
        query += ` ORDER BY cr.last_message_at DESC`;
      }
  
      const res = await pool.query<ChatRoom>(query, params);
      return res.rows;
    },
  
  async findMessages(storeId: number, buyerId: number, limit = 50): Promise<ChatMessage[]> {
    const query = `
      SELECT 
        message_id, store_id, buyer_id, sender_id, message_type, 
        content, product_id, is_read, created_at
      FROM chat_messages 
      WHERE store_id = $1 AND buyer_id = $2
      ORDER BY created_at ASC
      LIMIT $3
    `;
    const res = await pool.query<ChatMessage>(query, [storeId, buyerId, limit]);
    return res.rows;
  },

  async createRoom(storeId: number, buyerId: number): Promise<void> {
    const query = `
      INSERT INTO chat_rooms (store_id, buyer_id, last_message_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (store_id, buyer_id) DO NOTHING
    `;
    await pool.query(query, [storeId, buyerId]);
  },

  async createMessage(data: SendMessageDTO): Promise<ChatMessage> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertQuery = `
        INSERT INTO chat_messages 
          (store_id, buyer_id, sender_id, message_type, content, product_id, is_read, created_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, false, NOW())
        RETURNING *
      `;
      
      const res = await client.query<ChatMessage>(insertQuery, [
        data.store_id, 
        data.buyer_id, 
        data.sender_id, 
        data.message_type, 
        data.content, 
        data.product_id || null
      ]);
      
      const newMessage = res.rows[0];

      if (!newMessage) {
      throw new Error("Failed to insert chat message");
      }

      await client.query(`
        UPDATE chat_rooms 
        SET last_message_at = NOW() 
        WHERE store_id = $1 AND buyer_id = $2
      `, [data.store_id, data.buyer_id]);

      await client.query('COMMIT');
      return newMessage;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  },

  async markMessagesRead(storeId: number, buyerId: number, userId: number): Promise<void> {
    const query = `
      UPDATE chat_messages
      SET is_read = true
      WHERE store_id = $1 AND buyer_id = $2
      AND sender_id != $3
      AND is_read = false
    `;
    await pool.query(query, [storeId, buyerId, userId]);
  }
};