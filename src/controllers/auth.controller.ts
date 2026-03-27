import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config";
import { users } from "../config/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body as {
      name: string;
      email: string;
      password: string;
      role: string;
    };
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const isUserExist = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (isUserExist.length > 0) {
      return res.status(400).json({
        message: "User Already Exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role: role as "admin" | "user",
      })
      .execute();

    const token = jwt.sign({ id: newUser }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.status(201).json({ user: newUser, message: "Registered Successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return res.status(400).json({
        message: "Both Email & Password are required",
      });
    }

    const userExist = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    const user = userExist[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.status(200).json({
      user: { name: user.name, email: user.email, role: user.role },
      message: "User loggedIn successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
