import { Request, Response } from "express";
import { db } from "../config/index.js";
import { orders } from "../config/db/schema.js";
import { and, eq, sql } from "drizzle-orm";
import { parseDateRange } from "../utils/dateRange.js";

export const statistics = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const { startDate, endDate } = parseDateRange(from as string, to as string);

    const totalOrdersResult = await db
      .select({ count: sql`COUNT(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.orderPaid, 1),
          sql`${orders.createdAt} BETWEEN ${startDate} AND ${endDate}`,
        ),
      );

    const totalOrders = Number(totalOrdersResult[0]?.count ?? 0);

    const totalRevenueResult = await db
      .select({ totalRevenue: sql`SUM(${orders.priceOfFood})` })
      .from(orders)
      .where(
        and(
          eq(orders.orderPaid, 1),
          sql`${orders.createdAt} BETWEEN ${startDate} AND ${endDate}`,
        ),
      );

    const totalRevenue = Number(totalRevenueResult[0]?.totalRevenue ?? 0);

    const AMOUNT_PERCENTAGE = 0.14;
    const amountToKeep = +(totalRevenue * AMOUNT_PERCENTAGE).toFixed(2);
    const amountToPay = +(totalRevenue - amountToKeep).toFixed(2);

    res.status(200).json({
      totalOrders,
      totalRevenue: +totalRevenue.toFixed(2),
      AMOUNT_PERCENTAGE,
      amountToKeep,
      amountToPay,
      from: startDate,
      to: endDate,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
