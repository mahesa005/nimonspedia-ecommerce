// userRepository for managing user data in the database
import { User } from '../models/User';
import {  } from '../config/database';
import pool from '../config/database'

export async function findUserByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
        `SELECT * FROM "user" WHERE email = $1 LIMIT 1`,
        [email]
    );
    
    if (result.rows.length == 0) return null;
    return result.rows[0] as User;
}