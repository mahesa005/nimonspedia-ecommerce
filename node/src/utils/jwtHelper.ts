import jwt from "jsonwebtoken"
import { JWT_CONFIG } from "../config/jwtConfig"

// JWT payload: structure for admin tokens.
interface AdminJwtPayload { // Define the structure of the JWT payload for admin users
    user_id: number;
    role: 'ADMIN';
    email: string;
}

// Function to sign a JWT token for admin users
// Token uses secret and expiration from JWT_CONFIG
// payload: AdminJwtPayload - data to include in the token
// returns: string - signed JWT token
export function signAdminToken(payload: AdminJwtPayload): string {
    return jwt.sign(payload, JWT_CONFIG.secret, { expiresIn: JWT_CONFIG.expiresIn });
}

// Function to verify a JWT token for admin users
// token: string - JWT token to verify
// returns: AdminJwtPayload - decoded payload if token is valid
export function verifyToken(token: string): AdminJwtPayload {
    return jwt.verify(token, JWT_CONFIG.secret) as AdminJwtPayload;
}