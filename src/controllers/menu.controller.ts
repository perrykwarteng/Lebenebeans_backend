import { Request, Response } from "express";
import { db } from "../config/index.js";
import { logs, menu, users } from "../config/db/schema.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/fileUpload.js";
import { eq } from "drizzle-orm";
import { Device, IpAddress } from "../utils/ip.js";
import { io } from "../index.js";

export const allMenu = async (req: Request, res: Response) => {
  try {
    const menuItems = await db.select().from(menu);

    res.status(200).json({ data: menuItems });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const addMenu = async (req: Request, res: Response) => {
  const file = req.file?.path;
  const { name, price, quantity, available, userId } = req.body || {};
  try {
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(file);

    if (!result) {
      return res.status(400).json({ message: "Failed to upload file" });
    }

    const imageData = {
      imageUrl: result.secure_url,
      public_id: result.public_id,
    };

    const men = await db.insert(menu).values({
      name,
      price: price.toString(),
      quantity: Number(quantity),

      imageUrls: {
        imageUrl: result.secure_url,
        public_id: result.public_id,
      },

      available: available === "true" || available === true,
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
      module: "Menu",
      description: `Menu Created`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    res.status(201).json({
      message: "Menu created successfully",
      data: men[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: error || "Internal server error",
    });
  }
};

export const updateMenu = async (req: Request, res: Response) => {
  try {
    const file = req.file?.path;
    const { id } = req.params;
    const { name, price, quantity, available, public_id, userId } = req.body;

    let imageUrls;

    if (file) {
      if (public_id) {
        await deleteFromCloudinary(public_id);
      }
      const uploaded = await uploadToCloudinary(file);
      imageUrls = {
        imageUrl: uploaded.secure_url,
        public_id: uploaded.public_id,
      };
    }

    await db
      .update(menu)
      .set({
        name,
        price: price.toString(),
        quantity: Number(quantity),
        available: available === "true",

        ...(imageUrls && {
          imageUrls,
        }),
      })
      .where(eq(menu.id, Number(id)));

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
      module: "Menu",
      description: `Menu Updated`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    return res.status(200).json({
      message: "Menu updated successfully",
    });
  } catch (error) {
    console.error(error);
    // console.error("FULL ERROR:", error);
    // console.error("MESSAGE:", error.message);
    // console.error("STACK:", error?.stack);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;

    const existingMenu = await db
      .select()
      .from(menu)
      .where(eq(menu.id, Number(id)))
      .limit(1);

    if (!existingMenu.length) {
      return res.status(404).json({ message: "Menu not found" });
    }

    const menuItem = existingMenu[0];

    if (menuItem?.imageUrls?.public_id) {
      await deleteFromCloudinary(menuItem.imageUrls.public_id);
    }

    await db.delete(menu).where(eq(menu.id, Number(id)));

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
      module: "Menu",
      description: `Menu Deleted`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    res.status(200).json({
      message: "Menu deleted successfully",
    });
  } catch (error) {
    console.error("Delete Menu Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleMenuAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { available, userId } = req.body;

    const menuAvailable = await db
      .update(menu)
      .set({
        available: available === "true" || available === true,
      })
      .where(eq(menu.id, Number(id)));

    io.emit("menu-available");

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
      module: "Menu",
      description: `Menu Availability Update`,
      ipAddress: ip,
      device: {
        type: userDevice.type,
        browser: userDevice.browser,
        os: userDevice.os,
      },
      status: "success",
    });

    return res.status(200).json({
      message: "Menu availability updated",
    });
  } catch (error) {
    console.error("Toggle Availability Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
