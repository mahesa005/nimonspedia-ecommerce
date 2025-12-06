import bycrpt from "bcrypt"
import { findUserByEmail}  from "../repositories/userRepository"
import { signAdminToken } from "../utils/jwtHelper"

// Result structure for admin login
export interface AdminLoginResult {
    token: string;
    admin: {
        user_id: number;
        email: string;
        name: string;
        role: 'ADMIN';
    }
}

// Function to handle admin login
// email: string - admin's email
// password: string - admin's password
// returns: Promise<AdminLoginResult> - result containing JWT token and admin info
export async function adminLogin(
    email: string,
    password: string
): Promise<AdminLoginResult> { // Promise that resolves to AdminLoginResult
    const user = await findUserByEmail(email);
    if (!user || user.role !== 'ADMIN') { // Check if user exists and is an admin
        throw new Error("email atau password tidak valid");
    }

    const isPasswordValid = await bycrpt.compare(password, user.password); // Compare provided password with stored hash
    if (!isPasswordValid) {
        throw new Error("email atau password tidak valid");
    }

    const token = signAdminToken({ // Sign JWT token for admin, converts the payload to a string token
        user_id: user.user_id,
        role: 'ADMIN',
        email: user.email,
    })

    return {
        token,
        admin: {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
            role: user.role,
        }
    }
}