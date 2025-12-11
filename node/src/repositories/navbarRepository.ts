import pool from '../config/database';

export const NavbarRepository = {
  async getCartCount(userId: number): Promise<number> {
    const query = `
      SELECT COUNT(DISTINCT product_id)::int AS count
      FROM cart_item
      WHERE buyer_id = $1
    `;
    const res = await pool.query(query, [userId]);
    return res.rows[0]?.count || 0;
  },

  async getStoreByUserId(userId: number) {
    const query = `
      SELECT store_id, store_name, balance, store_logo_path 
      FROM store 
      WHERE user_id = $1
    `;
    const res = await pool.query(query, [userId]);
    return res.rows[0] || null;
  }
};