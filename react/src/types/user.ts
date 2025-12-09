import type { ApiResponse } from "./response";

// User model definition
type user_role = 'ADMIN' | 'SELLER' | 'BUYER'

interface User {
    user_id: number;
    email: string;
    password: string;
    role: user_role;
    name: string;
    address: string;
    balance: number;
    created_at: Date;
    updated_at: Date;
}

export type MeResponse = ApiResponse<User>

export type { User, user_role };