import { Request, Response } from "express";
import { logs, users } from "../config/db/schema.js";
import { db } from "../config/index.js";
import { eq } from "drizzle-orm";
import { Device, IpAddress } from "../utils/ip.js";
import bcrypt from "bcrypt";

const getDefaultPassword = (role: string) => {
  if (role === "admin") return "admin12345";
  if (role === "sub-admin") return "subadmin12345";
  if (role === "super-admin") return "superadmin12345";
  return "admin12345";
};

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users);
    res.status(200).json({
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, email, role } = req.body;

    await db
      .update(users)
      .set({
        name,
        email,
        role,
      })
      .where(eq(users.id, id));

    const user = await db.select().from(users).where(eq(users.id, id));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: Number(user[0]?.id),
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "",
      },
      action: "Update",
      module: "User",
      description: `User Info Updated`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    res.status(200).json({
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)));

    await db.delete(users).where(eq(users.id, id));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: Number(user[0]?.id),
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "",
      },
      action: "Delete",
      module: "User",
      description: `User Deleted`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const user = await db.select().from(users).where(eq(users.id, id));

    if (!user.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPassword = getDefaultPassword(user[0]!.role);
    const hashed = await bcrypt.hash(newPassword, 10);

    await db.update(users).set({ password: hashed }).where(eq(users.id, id));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: Number(user[0]?.id),
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "",
      },
      action: "Reset",
      module: "User",
      description: `User password reset`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Reset failed" });
  }
};
