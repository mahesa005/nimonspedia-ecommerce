// userRepository for managing user data in the database
import { User } from '../models/User';
import { pool } from '../database/pool';

export async function findUserByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1 LIMIT 1`,
        [email]
    );
    
    if (result.rows.length == 0) return null;
    return result.rows[0] as User;
}