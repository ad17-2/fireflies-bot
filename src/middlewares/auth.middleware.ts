import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, UserJwtPayload } from "../types/auth.types.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;
    req.user = {
      _id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
