import { Request, Response } from 'express';
import { adminLogin } from '../services/adminAuthService';

// Controller function to handle admin login requests
export async function adminLoginController(req: Request, res: Response) {
    try {
        const { email, password } = req.body as { // Type assertion for req.body
            email?: string;
            password?: string;
        }

        if (!email || !password) {
            return res.status(400).json({ message: "Email dan password wajib diisi"})
        }

        const result = await adminLogin(email, password); // Call service to perform login

        // Return token and admin object directly
        res.status(200).json(result);
    } catch (err: any) { // Set type of err to any so we can access err.message
        
        if (err.message === "email atau password tidak valid") {
            return res.status(401).json({ message: "Kredensial Invalid"})
        }   

        console.error("Admin login error: ", err);

        return res.status(500).json({ message: "Internal server error"})
    }
}