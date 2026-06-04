import { Request, Response } from "express";
import { db } from "../config/index.js";
import { deliveryLocations, logs, users } from "../config/db/schema.js";
import { eq } from "drizzle-orm/mysql-core/expressions";
import { toMysqlDatetime } from "../utils/dateFormat.js";
import { Device, IpAddress } from "../utils/ip.js";

const now = new Date();

export const allLocation = async (req: Request, res: Response) => {
  try {
    const location = await db.select().from(deliveryLocations);

    res.status(200).json({ data: location });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const addLocation = async (req: Request, res: Response) => {
  try {
    const { name, price, userId } = req.body;

    if (name === undefined || price === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const loc = await db.insert(deliveryLocations).values({
      name,
      price,
      createdAt: toMysqlDatetime(now),
      updatedAt: toMysqlDatetime(now),
    });

    const user = await db.select().from(users).where(eq(users.id, userId));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: Number(user[0]?.id),
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "",
      },
      action: "Create",
      module: "Location",
      description: `New Location Added`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    res.status(201).json({
      message: "Location created successfully",
      data: loc[0],
    });
  } catch (error) {
    console.error("Add Location Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, price, userId } = req.body;

    if (!id) return res.status(400).json({ message: "Id is required" });
    if (!name || !price)
      return res.status(400).json({ message: "All fields are required" });

    const updateLoc = await db
      .update(deliveryLocations)
      .set({
        name,
        price,
        updatedAt: toMysqlDatetime(now),
      })
      .where(eq(deliveryLocations.id, Number(id)));

    const user = await db.select().from(users).where(eq(users.id, userId));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: Number(user[0]?.id),
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "",
      },
      action: "Update",
      module: "Location",
      description: `Location Update`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    res
      .status(200)
      .json({ message: "Location Updated Successfully", data: updateLoc });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!id) return res.status(400).json({ message: "Id is required" });

    const user = await db.select().from(users).where(eq(users.id, userId));

    const loc = await db
      .delete(deliveryLocations)
      .where(eq(deliveryLocations.id, Number(id)));

    const ip = IpAddress(req);
    const userDevice = Device(req);

    await db.insert(logs).values({
      user: {
        id: Number(user[0]?.id),
        name: user[0]?.name ?? "",
        email: user[0]?.email ?? "",
      },
      action: "Delete",
      module: "Location",
      description: `Location Deleted`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    res
      .status(200)
      .json({ message: "Location Deleted Successfully", data: loc });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
