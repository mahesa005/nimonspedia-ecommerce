import pool from '../config/database';
import { PushSubscriptionData } from '../models/notificationModel';

export const NotificationRepository = {
  async saveSubscription(userId: number, sub: PushSubscriptionData) {
    const query = `
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (endpoint) DO NOTHING
    `;
    await pool.query(query, [userId, sub.endpoint, sub.keys.p256dh, sub.keys.auth]);
  },

  async getSubscriptionsByUser(userId: number) {
    const query = `SELECT * FROM push_subscriptions WHERE user_id = $1`;
    const res = await pool.query(query, [userId]);
    return res.rows;
  },
  
  async deleteSubscription(endpoint: string) {
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
  },
  
  async getUserPreferences(userId: number) {
    const query = `SELECT * FROM push_subscriptions WHERE user_id = $1`;
    const res = await pool.query(query, [userId]);
    return res.rows[0]; 
  }
};