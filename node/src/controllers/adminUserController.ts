import { getPaginatedUsers } from "../services/userService";
import { Request, Response } from "express";

export async function adminUserController(
    req: Request, 
    res: Response
) {
    try {
        const {page, limit, search} = req.body as {
            page: number,
            limit: number,
            search?: string
        }

        if (!page || !limit) {
            return res.status(400).json({ message: "Page dan limit wajib diisi" });
        }
        const result = await getPaginatedUsers({ page, limit, search });

        return res.status(200).json(result);
    } catch (err: any) {
        console.error("Error fetching users: ", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}