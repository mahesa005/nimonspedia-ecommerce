import { Response } from "express";
import { AdminRequest } from "../middleware/requireAdmin";

export function adminMeHandler(req: AdminRequest, res: Response) {
  if (!req.admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json({
    admin: req.admin,
  });
}
