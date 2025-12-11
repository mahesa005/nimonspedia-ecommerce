import pool from '../config/database';
import { ProductWithOwner } from '../models/productModel';

export const ProductRepository = {
  async findByIdWithOwner(productId: number): Promise<ProductWithOwner | null> {
    const query = `
      SELECT 
        p.product_id,
        p.stock,
        p.store_id,
        s.user_id AS owner_id
      FROM "product" p
      JOIN "store" s ON p.store_id = s.store_id
      WHERE p.product_id = $1
    `;
    const res = await pool.query<ProductWithOwner>(query, [productId]);
    return res.rows[0] ?? null;
  },
};