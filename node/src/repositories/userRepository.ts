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

export async function getUsers(params: {
    page: number;
    limit: number;
    search?: string;
}) {
    const offset = (params.page - 1) * params.limit; // count offset
    const result = await pool.query(
        `SELECT user_id, name, email, role, balance, created_at FROM "user" 
        WHERE ($1 IS NULL OR name ILIKE $1 OR email ILIKE $1)
        ORDER BY created_at DESC
        OFFSET $2
        LIMIT $3`,
        [
            params.search ? `%${params.search}%`: null, 
            offset, 
            params.limit
        ]
    )

     const countRow = await pool.query(
        `SELECT COUNT(*) AS total FROM "user"
        WHERE ($1 IS NULL OR name ILIKE $1 OR email ILIKE $1)`,
        [params.search ? `%${params.search}%` : null]
    );
    const total = Number(countRow.rows[0].total);
    const totalPages = Math.ceil(total / params.limit);

    return {
        users: result.rows,
        pagination: {
            page: params.page,
            limit: params.limit,
            total,
            totalPages,
        }
    }

}