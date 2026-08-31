import { Request, Response } from "express";
import { db } from "../config/index.js";
import { orders, promotionList } from "../config/db/schema.js";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { parseDateRange } from "../utils/dateRange.js";

export const statistics = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    const { startDate, endDate } = parseDateRange(from as string, to as string);

    const fromTimestamp = new Date(startDate).getTime();
    const toTimestamp = new Date(endDate).getTime();

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
          sql`${orders.date} BETWEEN ${fromTimestamp} AND ${toTimestamp}`,
        ),
      );

    const row = result[0];

    const totalOrders = Number(row?.totalOrders) || 0;
    const totalRevenue = Number(row?.totalRevenue) || 0;
    const totalDelivery = Number(row?.totalDelivery) || 0;

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
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
};

export const promoStatistics = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    const { startDate, endDate } = parseDateRange(from as string, to as string);

    const fromTimestamp = new Date(startDate).getTime();
    const toTimestamp = new Date(endDate).getTime();

    const dateFilter = and(
      eq(orders.orderPaid, true),
      eq(orders.promotion, "Promotion Order"),
      gte(orders.date, fromTimestamp),
      lte(orders.date, toTimestamp),
    );

    const result = await db
      .select({
        totalPromoOrders: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(dateFilter);

    const aiOrder = await db
      .select({
        totalAIOrders: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(and(dateFilter, eq(orders.source, "ai")));

    const freeDeliveryOrders = await db
      .select({
        totalFreeOrders: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(and(dateFilter, eq(orders.source, "website")));

    const promoAmount = await db
      .select({
        totalPromoAmount: sql<number>`
          COALESCE(
            SUM(
              COALESCE(${orders.priceOfFood}, 0) +
              COALESCE(${orders.deliveryFee}, 0)
            ),
            0
          )
        `,
      })
      .from(orders)
      .where(dateFilter);

    const aiAmount10 = await db
      .select({
        totalAIAmount: sql<number>`
          COALESCE(
            SUM(
              (
                COALESCE(${orders.priceOfFood}, 0) +
                COALESCE(${orders.deliveryFee}, 0)
              ) * 0.10
            ),
            0
          )
        `,
      })
      .from(orders)
      .where(and(dateFilter, eq(orders.source, "ai")));

    const aiRemainingAmount = await db
      .select({
        totalAIRemaining: sql<number>`
          COALESCE(
            SUM(
              (
                COALESCE(${orders.priceOfFood}, 0) +
                COALESCE(${orders.deliveryFee}, 0)
              ) * 0.90
            ),
            0
          )
        `,
      })
      .from(orders)
      .where(and(dateFilter, eq(orders.source, "ai")));

    const freeDeliveryOrderAmount = await db
      .select({
        totalFreeDeliveryAmount: sql<number>`
          COALESCE(
            SUM(COALESCE(${orders.priceOfFood}, 0)),
            0
          )
        `,
      })
      .from(orders)
      .where(and(dateFilter, eq(orders.source, "website")));

    const totalPromoOrders = Number(result[0]?.totalPromoOrders) || 0;

    const totalAIOrders = Number(aiOrder[0]?.totalAIOrders) || 0;

    const totalFreeDeliveryOrder =
      Number(freeDeliveryOrders[0]?.totalFreeOrders) || 0;

    const totalPromoAmount = Number(promoAmount[0]?.totalPromoAmount) || 0;

    const totalAIAmount10 = Number(aiAmount10[0]?.totalAIAmount) || 0;

    const totalAIRemaining =
      Number(aiRemainingAmount[0]?.totalAIRemaining) || 0;

    const totalFreeDeliverOrderAmount =
      Number(freeDeliveryOrderAmount[0]?.totalFreeDeliveryAmount) || 0;

    return res.json({
      totalPromoOrders,
      totalAIOrders,
      totalFreeDeliveryOrder,
      totalPromoAmount,
      totalAIAmount10,
      totalAIRemaining,
      totalFreeDeliverOrderAmount,
      from: startDate,
      to: endDate,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
};
