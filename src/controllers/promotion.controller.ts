// {
//   "code": "BUY2FREEDEL",
//   "type": "FREE_DELIVERY",
//   "limits": 100,
//   "minOrderAmount": 0,
//   "minOrder": 2,
//   "usedCount": 0,
//   "expiresAt": "2026-12-31 23:59:59",
//   "isActive": true,
// }

import { Request, Response } from "express";
import { db } from "../config/index.js";
import { promotion } from "../config/db/schema.js";
import { PromotionType } from "../types/type.js";
import { and, eq, gt } from "drizzle-orm";
import { toMysqlDatetime } from "../utils/dateFormat.js";
import { date } from "drizzle-orm/mysql-core";

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const {
      code,
      type,
      limits,
      minOrderAmount,
      minOrder,
      usedCount,
      expiresAt,
      isActive,
    } = req.body as PromotionType;

    if (!code || !type || !expiresAt || !isActive) {
      return res.status(400).json({
        message:
          "promotion code, promotion type, promotion expiresAt, promotion isActive are required fields",
      });
    }

    const promotionExist = await db
      .select()
      .from(promotion)
      .where(eq(promotion.code, code));

    if (promotionExist.length > 0) {
      return res
        .status(400)
        .json({ message: "This promotion offer already exists" });
    }
    const promoValues: PromotionType = {
      code,
      type,
      limits,
      minOrderAmount,
      minOrder,
      usedCount,
      expiresAt: new Date(expiresAt),
      isActive,
    };

    await db.insert(promotion).values(promoValues);

    res.status(201).json({ message: "Created Promo successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getPromotion = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const type = req.query.type as string;

    if (!code || !type)
      return res.status(400).json({
        message: "Promotion code and Promotion type are missing",
      });

    const nowDate = new Date();
    const getPromo = await db
      .select()
      .from(promotion)
      .where(and(eq(promotion.code, code), eq(promotion.type, type)));

    if (getPromo[0]?.expiresAt! < nowDate) {
      return res
        .status(400)
        .json({ data: { message: "Sorry link has expired" } });
    }

    if (getPromo[0]?.code !== code || getPromo[0].type !== type)
      return res
        .status(400)
        .json({ data: { message: "Sorry You have wrong promo link" } });

    res.status(200).json({
      message: "Returned Promotion Successfully",
      data: {
        id: getPromo[0].id,
        code: getPromo[0]?.code,
        type: getPromo[0]?.type,
        minOrderAmount: getPromo[0]?.minOrderAmount,
        minOrder: getPromo[0]?.minOrder,
        expiresAt:
          getPromo[0]?.expiresAt! < nowDate ? false : getPromo[0]?.expiresAt,
        isActive: getPromo[0]?.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const setPromotionStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { isActive } = req.body as {
      isActive: boolean;
    };

    if (!id)
      return res.status(400).json({ message: "Promotion ID is missing " });

    const updatePromotion = await db
      .update(promotion)
      .set({
        isActive,
      })
      .where(eq(promotion.id, Number(id)));

    res.status(200).json({
      message: "Changed IsActive Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : error,
    });
  }
};
