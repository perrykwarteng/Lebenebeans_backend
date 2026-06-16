import { Request, Response } from "express";
import { db } from "../config/index.js";
import { orders } from "../config/db/schema.js";
import { and, sql } from "drizzle-orm";
import { parseDateRange } from "../utils/dateRange.js";

export const statistics = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const { startDate, endDate } = parseDateRange(from as string, to as string);

    const result = await db
      .select({
        totalOrders: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`COALESCE(SUM(${orders.priceOfFood}), 0)`,
        totalDelivery: sql<number>`COALESCE(SUM(${orders.deliveryFee}), 0)`,
      })
      .from(orders)
      .where(
        and(
          sql`${orders.orderPaid} = 1`,
          sql`LEFT(${orders.createdAt}, 10) BETWEEN ${startDate} AND ${endDate}`,
        ),
      );

    const row = result[0];

    const totalOrders = Number(row!.totalOrders) || 0;
    const totalRevenue = Number(row!.totalRevenue) || 0;
    const totalDelivery = Number(row!.totalDelivery) || 0;

    const AMOUNT_PERCENTAGE = 0.14;
    const amountToKeep = Number((totalRevenue * AMOUNT_PERCENTAGE).toFixed(2));
    const amountToPay = Number((totalRevenue - amountToKeep).toFixed(2));

    return res.json({
      totalOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalDelivery: Number(totalDelivery.toFixed(2)),
      AMOUNT_PERCENTAGE,
      amountToKeep,
      amountToPay,
      from: startDate,
      to: endDate,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
