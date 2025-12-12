import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtHelper";

export interface AdminRequest extends Request { // Extend Express Request to include admin info
    admin?: {
        user_id: number;
        email: string;
        role: 'ADMIN';
    }
}

export function requireAdmin(
    req: AdminRequest, // Use the extended request type with admin info
    res: Response,
    next: NextFunction // Middleware next function to pass control to the next middleware
) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Header tidak ditemukan atau tidak valid" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
    }
    try {
        const payload = verifyToken(token) // JWT token is decoded to get the payload, which contains user information
        if (payload.role !== 'ADMIN') {
            return res.status(403).json({ message: "Akses ditolak: bukan admin" });
        }
        req.admin = { // Attach admin info to the request object, so downstream middleware/controllers can access it
            user_id: payload.user_id,
            email: payload.email,
            role: payload.role,
        }
        next(); // Pass control to the next middleware
    }
    catch (err) {
        return  res.status(401).json({ message: "Token tidak valid atau kedaluwarsa" });
    }
}