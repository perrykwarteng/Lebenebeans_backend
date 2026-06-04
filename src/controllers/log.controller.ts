import { Request, Response } from "express";
import { db } from "../config/index.js";
import { logs, users } from "../config/db/schema.js";
import { eq } from "drizzle-orm";
import { Device, IpAddress } from "../utils/ip.js";

export const allLogs = async (req: Request, res: Response) => {
  try {
    const log = (await db.select().from(logs)).reverse();

    res.status(200).json({ data: log });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteLog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    if (!id) {
      return res.status(400).json({ message: "LogId is required" });
    }
    await db.delete(logs).where(eq(logs.id, Number(id)));

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: Number(user[0]?.id),
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "",
      },
      action: "Delete",
      module: "Log",
      description: `Deleted log`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    res.status(200).json({ message: "Log delleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
