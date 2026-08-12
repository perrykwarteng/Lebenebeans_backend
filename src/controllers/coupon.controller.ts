import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../config/index.js";
import { couponCodes, couponCodeList, orders } from "../config/db/schema.js";

const generateCouponCode = (): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let randomCode = "";

  for (let i = 0; i < 7; i++) {
    randomCode += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  return `LEB${randomCode}`;
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const couponCode = generateCouponCode();

    const existingCoupon = await db
      .select({ id: couponCodes.id })
      .from(couponCodes)
      .where(eq(couponCodes.couponCode, couponCode))
      .limit(1);

    if (existingCoupon.length > 0) {
      return res.status(400).json({ message: "Coupon Code Already Exists" });
    }

    const today = new Date();

    const startAt = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    const expiresAt = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const [coupon] = await db
      .insert(couponCodes)
      .values({
        couponCode: couponCode,
        usedCount: 0,
        quantity: 0,
        startAt: startAt,
        expiresAt: expiresAt,
      })
      .$returningId();

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: {
        id: coupon?.id,
        couponCode: couponCode,
        usedCount: 0,
        quantity: 2,
        startAt: startAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
};

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await db.select().from(couponCodes);

    return res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
    });
  }
};

export const getCoupon = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    const [coupon] = await db
      .select()
      .from(couponCodes)
      .where(eq(couponCodes.id, id))
      .limit(1);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error("Get coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch coupon",
    });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { usedCount } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    if (
      usedCount === undefined ||
      typeof usedCount !== "number" ||
      usedCount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid usedCount",
      });
    }

    const [existingCoupon] = await db
      .select()
      .from(couponCodes)
      .where(eq(couponCodes.id, id))
      .limit(1);

    if (!existingCoupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await db
      .update(couponCodes)
      .set({
        usedCount,
      })
      .where(eq(couponCodes.id, id));

    const [updatedCoupon] = await db
      .select()
      .from(couponCodes)
      .where(eq(couponCodes.id, id))
      .limit(1);

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: updatedCoupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    const [existingCoupon] = await db
      .select()
      .from(couponCodes)
      .where(eq(couponCodes.id, id))
      .limit(1);

    if (!existingCoupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await db.delete(couponCodes).where(eq(couponCodes.id, id));

    return res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};

export const getCouponUsedList = async (req: Request, res: Response) => {
  try {
    const coupons = await db
      .select({
        couponId: couponCodeList.id,
        couponCode: couponCodeList.couponCode,
        couponCreatedAt: couponCodeList.createdAt,

        order: orders,
      })
      .from(couponCodeList)
      .leftJoin(orders, eq(couponCodeList.orderId, orders.id));

    return res.status(200).json({
      success: true,
      message: "Used coupons fetched successfully",
      data: coupons,
    });
  } catch (error) {
    console.error("Get used coupons error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch used coupons",
    });
  }
};
