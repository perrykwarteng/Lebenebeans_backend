import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { db } from "../config/index.js";
import { users } from "../config/db/schema.js";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
    role: "user" | "admin";
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    const decodeToken = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
    };

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decodeToken.id))
      .limit(1);

    const foundUser = user[0];

    if (!foundUser) {
      return res.status(403).json({ message: "Unauthorized User" });
    }

    req.user = foundUser;

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
