import { Request, response, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../config/index.js";
import { logs, users } from "../config/db/schema.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { changePasswordType } from "../types/type.js";
import { Device, IpAddress } from "../utils/ip.js";

dotenv.config();
const isProd = process.env.NODE_ENV === "production";

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
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 72,
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
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 72,
    });

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      action: "Logged In",
      module: "Auth",
      description: `${user.name} Looged In`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    res.status(200).json({
      user: { name: user.name, email: user.email, role: user.role },
      message: "User loggedIn successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const me = (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
      message: "User fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed getting user details" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { userId } = req.body;
  try {
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const user = await db.select().from(users).where(eq(users.id, userId));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: userId,
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "",
      },
      action: "Logged Out",
      module: "Auth",
      description: `${user[0]?.name ?? "User"} Logged Out`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1,
    });

    res.json({ message: "Logged out succesfully" });
  } catch (error) {
    res.status(500).json({ message: "Logged out Failed" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { data } = req.body as {
    data: changePasswordType;
  };
  try {
    if (!data.email || !data.newPassword) {
      return res
        .status(400)
        .json({ message: "Current Password and New Password are requried" });
    }

    const userExist = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    const user = userExist[0];

    if (!user) {
      return res.status(400).json({ mesage: "User Not Found" });
    }

    const saltround = 10;
    const setNewPassword = await bcrypt.hash(data.newPassword, saltround);

    await db
      .update(users)
      .set({ password: setNewPassword })
      .where(eq(users.email, data.email));

    const userId = data.userId;

    const findUser = await db.select().from(users).where(eq(users.id, userId));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: userId,
        name: findUser[0]?.name ?? "",
        email: findUser[0]?.email ?? "",
      },
      action: "Update",
      module: "User",
      description: `Changes Password`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    return res.status(200).json({
      message: "Changed Password Successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Logged out Failed" });
  }
};
